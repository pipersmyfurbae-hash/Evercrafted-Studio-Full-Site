// server.ts
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { analyzeWreathImage } from './src/services/vision-flower-engine.ts';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/generate-blueprint', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a wreath design blueprint for: "${prompt}". Context: ${JSON.stringify(context)}`,
        config: {
          systemInstruction: "You are the Evercrafted Design Engine. Output valid JSON blueprints.",
          responseMimeType: 'application/json',
        }
      });
      
      res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: 'Failed to generate blueprint' });
    }
  });

  app.post('/api/match-inventory', async (req, res) => {
    try {
      const { blueprint, inventory } = req.body;
      
      // Simple matching logic for now
      const matched = blueprint.map((el: any) => {
        const match = inventory.find((inv: any) => 
          inv.name.toLowerCase().includes(el.element.toLowerCase()) ||
          el.element.toLowerCase().includes(inv.name.toLowerCase())
        );
        return { ...el, inventoryId: match?.id, sku: match?.sku || 'GENERIC' };
      });
      
      res.json(matched);
    } catch (error) {
      console.error('Matching error:', error);
      res.status(500).json({ error: 'Failed to match inventory' });
    }
  });

  app.post('/api/analyze-image', upload.single('image'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }
      
      const inventory = req.body.inventory ? JSON.parse(req.body.inventory) : [];
      
      // Convert buffer to base64 for the vision engine
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      const result = await analyzeWreathImage(imageUrl, inventory);
      res.json(result.blueprint);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  app.post('/api/upload-design', upload.single('image'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }
      
      const base64Image = req.file.buffer.toString('base64');
      const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      
      const result = await analyzeWreathImage(imageUrl);
      
      // Simulate saving to a database or marketplace
      res.json({
        id: `DS-${Date.now()}`,
        title: result.title,
        blueprint: result.blueprint,
        renderPreview: imageUrl,
        price: '$19.00'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload design' });
    }
  });

  app.post('/ai/placement', async (req, res) => {
    try {
      const { prompt, wreathSize } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Generate a QACS (Quadrant Arc Coordinate System) blueprint for a ${wreathSize} inch wreath based on this description: "${prompt}". 
        
        Output ONLY a raw JSON array of placement objects (no markdown, no explanation).
        Each object must have: element (string), category (focal|greenery|filler|accent|base|ribbon), angle_deg (number), radius ("inner"|"mid"|"outer"), density ("low"|"medium"|"high"), stem_count (number).
        
        The wreath uses polar coordinates:
        - angle_deg: 0–359, where 0° = 12:00, clockwise
        - radius: "inner" (0–33%), "mid" (33–66%), "outer" (66–100%)
        `,
        config: { responseMimeType: 'application/json' }
      });
      
      res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
      console.error('AI Placement error:', error);
      res.status(500).json({ error: 'Failed to generate AI placement' });
    }
  });

  app.post('/blueprint/create', async (req, res) => {
    try {
      const { userId, blueprint } = req.body;
      // This would call the project service or interact directly with Firestore
      // For now, we simulate the creation
      res.json({ status: 'success', message: 'Blueprint saved' });
    } catch (error) {
      console.error('Blueprint save error:', error);
      res.status(500).json({ error: 'Failed to save blueprint' });
    }
  });

  // Motion Engine Routes
  app.post('/motion/emotion-detect', async (req, res) => {
    try {
      const { description } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Analyze the emotional intent of this design description: "${description}". Output JSON: {"emotion": string, "motionProfile": "whisper"|"breeze"|"statement", "motionType": "sway"|"rotation"|"pulse", "intensity": number, "rationale": string}`,
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
    // This would typically interface with a local FFmpeg/Canvas process
    // For now, we return a success status indicating the generation pipeline started
    res.json({ status: 'processing', message: 'Motion generation pipeline initiated' });
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
