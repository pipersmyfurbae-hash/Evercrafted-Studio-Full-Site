import { GoogleGenAI, Type } from '@google/genai';
import { EmotionProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const translateEmotion = async (emotionText: string): Promise<EmotionProfile> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Translate the following emotional input into a design profile for a floral wreath: "${emotionText}".
    
    Rules:
    - Map to:
      - color palette (3 colors: primary, secondary, accent)
      - contrast level (low / medium / high)
      - shape language (rounded / mixed / angular)
      - density (airy / balanced / full)
      - texture (soft / mixed / sharp)
      - intent (calm / dramatic / nostalgic / grounded / elevated)
    - Apply bouba/kiki mapping: soft emotions -> rounded, intense emotions -> angular.
    - Avoid overly saturated palettes unless intensity is high.
    - Always include one controlled accent color.
    
    Return a JSON object matching the EmotionProfile interface.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          colors: { type: Type.ARRAY, items: { type: Type.STRING } },
          contrast: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          shapes: { type: Type.STRING, enum: ['rounded', 'mixed', 'angular'] },
          density: { type: Type.STRING, enum: ['airy', 'balanced', 'full'] },
          textures: { type: Type.STRING, enum: ['soft', 'mixed', 'sharp'] },
          intent: { type: Type.STRING },
        },
        required: ['colors', 'contrast', 'shapes', 'density', 'textures', 'intent'],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate emotion profile");
  }

  return JSON.parse(response.text) as EmotionProfile;
};
