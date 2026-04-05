// server.ts
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Blueprint Routes
  app.post('/blueprint/create', async (req, res) => {
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

  app.post('/blueprint/from-emotion', async (req, res) => {
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

  app.post('/blueprint/from-inventory', async (req, res) => {
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
  app.post('/vision/analyze', upload.single('image'), async (req: any, res: any) => {
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
  app.post('/ai/placement', async (req, res) => {
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
  app.post('/motion/emotion-detect', async (req, res) => {
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

  app.post('/motion/brief', async (req, res) => {
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

  app.post('/motion/generate', async (req, res) => {
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
  app.post('/project/save', async (req, res) => {
    try {
      const { projectId, projectData } = req.body;
      res.json({ status: 'success', message: 'Project saved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save project' });
    }
  });

  app.get('/project/list', async (req, res) => {
    try {
      res.json({ projects: [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list projects' });
    }
  });

  app.get('/project/:id', async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ project: { id } });
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
