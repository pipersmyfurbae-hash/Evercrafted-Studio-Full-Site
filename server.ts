// server.ts
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { analyzeWreathImage } from './src/services/vision-flower-engine.ts';
import { generateMotion } from './src/services/motionEngine.ts';
import { GoogleGenAI, Type } from '@google/genai';
import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'wreath-weaver.firebasestorage.app'
});
const db = getFirestore();
const storage = getStorage();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

type AuthenticatedRequest = express.Request & {
  user?: DecodedIdToken;
};

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

function getBearerToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7);
}

async function requireAuth(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Missing bearer token' });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired auth token' });
  }
}

function requireBodyFields(fields: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Request body must be a JSON object' });
      return;
    }

    for (const field of fields) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        res.status(400).json({ error: `Missing required field: ${field}` });
        return;
      }
    }

    next();
  };
}

function createRateLimiter(options: RateLimitOptions) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const existing = requests.get(key);

    if (!existing || now > existing.resetAt) {
      requests.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (existing.count >= options.maxRequests) {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
      });
      return;
    }

    existing.count += 1;
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const aiRouteLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });
  const mediaRouteLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
  const projectRouteLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60_000 });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Blueprint Routes
  app.post('/blueprint/create', aiRouteLimiter, requireBodyFields(['prompt', 'formula', 'inventory', 'diameter']), async (req, res) => {
    try {
      const { prompt, formula, inventory, diameter } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a wreath design blueprint based on: "${prompt}". Formula: ${formula}. Inventory: ${JSON.stringify(inventory)}. Diameter: ${diameter}. Output valid JSON blueprint.`,
        config: {
          systemInstruction: `You are Evercrafted, a deterministic floral design engine. Convert prompt into structured, buildable wreath designs.`,
          responseMimeType: 'application/json',
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error('Blueprint creation error:', error);
      res.status(500).json({ error: 'Failed to create blueprint' });
    }
  });

  app.post('/blueprint/from-emotion', aiRouteLimiter, requireBodyFields(['prompt']), async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a complete Evercrafted wreath design package based on this memory/emotion: "${prompt}". Output valid JSON blueprint.`,
        config: {
          systemInstruction: `You are Evercrafted, a deterministic floral design engine. Convert emotion into structured, buildable wreath designs.`,
          responseMimeType: 'application/json',
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error('Emotion blueprint error:', error);
      res.status(500).json({ error: 'Failed to generate blueprint from emotion' });
    }
  });

  app.post('/blueprint/from-inventory', aiRouteLimiter, requireBodyFields(['blueprint', 'inventory']), async (req, res) => {
    try {
      const { blueprint, inventory } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a wreath design blueprint using ONLY these inventory items: ${JSON.stringify(inventory)}. Current blueprint context: ${JSON.stringify(blueprint)}. Output valid JSON blueprint.`,
        config: {
          systemInstruction: `You are Evercrafted, a deterministic floral design engine. Match inventory to blueprint requirements.`,
          responseMimeType: 'application/json',
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error('Inventory blueprint error:', error);
      res.status(500).json({ error: 'Failed to generate blueprint from inventory' });
    }
  });

  // Vision Routes
  app.post('/vision/analyze', mediaRouteLimiter, upload.single('image'), async (req: any, res: any) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      const result = await analyzeWreathImage(imageUrl);
      res.json(result.blueprint);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  // Placement Routes (QACS AI)
  app.post('/ai/placement', aiRouteLimiter, requireBodyFields(['prompt', 'wreathSize']), async (req, res) => {
    try {
      const { prompt, wreathSize } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a QACS blueprint for a ${wreathSize} inch wreath based on: "${prompt}". Output ONLY raw JSON array.`,
        config: { responseMimeType: 'application/json' }
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate AI placement' });
    }
  });

  // Motion Routes
  app.post('/motion/emotion-detect', aiRouteLimiter, requireBodyFields(['description']), async (req, res) => {
    try {
      const { description } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze emotional intent: "${description}". Output JSON: {"emotion": string, "motionProfile": "whisper"|"breeze"|"statement", "motionType": "sway"|"rotation"|"pulse", "intensity": number, "rationale": string}`,
        config: { responseMimeType: 'application/json' }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      res.status(500).json({ error: 'Motion detection failed' });
    }
  });

  app.post('/motion/brief', aiRouteLimiter, requireBodyFields(['description']), async (req, res) => {
    try {
      const { description } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a motion brief for: "${description}". Output JSON: {"emotionMapping": string, "recommendedProfile": "whisper"|"breeze"|"statement", "recommendedType": "sway"|"rotation"|"pulse", "intensity": number, "socialUse": string, "etsyUse": string, "shotList": string[]}`,
        config: { responseMimeType: 'application/json' }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      res.status(500).json({ error: 'Brief generation failed' });
    }
  });

  app.post('/motion/generate', mediaRouteLimiter, requireBodyFields(['projectId']), async (req, res) => {
    try {
      const { projectId, motion_type, motion_intensity } = req.body;
      if (!projectId) return res.status(400).json({ error: 'projectId is required' });

      // Return immediately
      res.json({ status: 'processing', message: 'Motion generation pipeline initiated' });

      // Non-blocking process
      (async () => {
        try {
          const projectRef = db.collection('projects').doc(projectId);
          const projectDoc = await projectRef.get();
          if (!projectDoc.exists) throw new Error('Project not found');
          
          const projectData = projectDoc.data();
          const renderUrl = projectData?.render;
          if (!renderUrl) throw new Error('No render image found in project');

          // Generate motion
          const videoPath = await generateMotion(
            renderUrl,
            motion_type,
            motion_intensity,
            10,
            30
          );

          // Upload to Storage
          const bucket = storage.bucket();
          const fileName = `motions/${projectId}-${Date.now()}.mp4`;
          await bucket.upload(videoPath, { destination: fileName });
          const [url] = await bucket.file(fileName).getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });

          // Update project
          await projectRef.update({
            motion: {
              type: motion_type,
              intensity: motion_intensity,
              duration: 10,
              fps: 30,
              videoUrl: url
            }
          });
        } catch (error) {
          console.error('Motion generation pipeline error:', error);
        }
      })();
    } catch (error) {
      console.error('Motion generation error:', error);
      res.status(500).json({ error: 'Failed to initiate motion generation' });
    }
  });

  // Project Routes
  app.post('/project/save', projectRouteLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const authUserId = req.user?.uid;
      if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { projectData } = req.body;
      if (!projectData || typeof projectData !== 'object') {
        res.status(400).json({ error: 'projectData is required' });
        return;
      }

      const {
        id,
        name,
        status,
        description = '',
        deadline = '',
        createdAt = new Date().toISOString(),
      } = projectData;

      if (!id || !name || !status) {
        res.status(400).json({ error: 'Project id, name, and status are required' });
        return;
      }

      const projectRef = db.collection('projects').doc(String(id));
      const existingDoc = await projectRef.get();
      if (existingDoc.exists && existingDoc.data()?.userId !== authUserId) {
        res.status(403).json({ error: 'You do not have access to this project' });
        return;
      }

      const normalizedProject = {
        id: String(id),
        userId: authUserId,
        name: String(name),
        description: String(description),
        status: String(status),
        deadline: String(deadline),
        createdAt: existingDoc.exists ? existingDoc.data()?.createdAt || createdAt : createdAt,
        updatedAt: new Date().toISOString(),
      };

      await projectRef.set(normalizedProject, { merge: true });
      res.json({ status: 'success', project: normalizedProject });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save project' });
    }
  });

  app.get('/project/list', projectRouteLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const authUserId = req.user?.uid;
      if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const snapshot = await db
        .collection('projects')
        .where('userId', '==', authUserId)
        .orderBy('createdAt', 'desc')
        .get();

      const projects = snapshot.docs.map((doc) => doc.data());
      res.json({ projects });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list projects' });
    }
  });

  app.get('/project/:id', projectRouteLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const authUserId = req.user?.uid;
      if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const projectDoc = await db.collection('projects').doc(id).get();
      if (!projectDoc.exists) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const project = projectDoc.data();
      if (project?.userId !== authUserId) {
        res.status(403).json({ error: 'You do not have access to this project' });
        return;
      }

      res.json({ project });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get project' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
