// src/services/enginePipeline.ts

import { GoogleGenAI, Type } from '@google/genai';
import { EmotionProfile, Blueprint, WreathDNA, InventoryItem } from '../types';
import { translateEmotion } from './emotionTranslator';
import { compileBlueprint } from './orchestration/blueprintCompiler';
import { normalizeBlueprint } from './transformer';
import { renderScore } from './engine/render-score';
import { repairPrompt } from './engine/prompt-repair';
import { buildRenderLayout } from './engine/evercrafted-engine';
import { compileRenderPrompts } from './engine/render-compiler';
import { buildInventoryPools, assignInventoryToBlueprint } from './engine/inventory-engine';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PipelineResult {
  emotionProfile: EmotionProfile;
  blueprint: Blueprint;
  renderPrompt: string;
}

/**
 * The Evercrafted Engine Pipeline
 * Flow: Memory → Emotion → Formula → Blueprint JSON → normalizeBlueprint() → render prompt compiler
 */
export const runEnginePipeline = async (
  memory: string,
  formula: string,
  inventory: InventoryItem[],
  diameter_inches: number = 24
): Promise<PipelineResult> => {
  // 1. Memory → Emotion
  const emotionProfile = await translateEmotion(memory);

  // 2. Emotion + Formula → Blueprint JSON
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a luxury floral wreath blueprint based on this emotion profile and design formula.
    
    Emotion Profile: ${JSON.stringify(emotionProfile)}
    Design Formula: ${formula}
    Inventory Available: ${JSON.stringify(inventory.map(i => i.name))}
    
    CRITICAL: You must construct the wreath MATHEMATICALLY using the Engine Pack schema.
    - Define "clusters" with center (theta), spread, and density.
    - Define "open_arc" as [start, end] degrees for negative space.
    - Use a unique "seed" string.
    
    Return a JSON object matching the EngineBlueprint schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          seed: { type: Type.STRING },
          open_arc: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            minItems: 2,
            maxItems: 2
          },
          clusters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                center: { type: Type.NUMBER },
                spread: { type: Type.NUMBER },
                density: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["title", "seed", "open_arc", "clusters"]
      }
    }
  });

  const blueprintJson = JSON.parse(response.text);

  // 3. Blueprint JSON → compileBlueprint (includes placement engine)
  const dna: WreathDNA = {
    cluster_count: blueprintJson.clusters.length,
    cluster_weight_distribution: 0.5,
    cluster_spread_deg: 60,
    density_profile: 0.7,
    greenery_direction: 'balanced',
    silhouette_bias: 'mixed',
    greenery_ratio: 0.4,
    focal_ratio: 0.15,
    silence_arc: 30,
    focal_depth: 0.5,
    style_signature: 'abundant',
    color_bias: 'neutral'
  };

  const compiledBlueprint = compileBlueprint(
    { ...blueprintJson, emotion_profile: emotionProfile },
    formula,
    dna,
    diameter_inches,
    inventory
  );

  // 4. normalizeBlueprint()
  compiledBlueprint.blueprint = normalizeBlueprint(compiledBlueprint.elements);

  // 4.5 Inventory Engine (Optional but recommended for production-ready outputs)
  try {
    const pools = buildInventoryPools(inventory);
    compiledBlueprint.blueprint = assignInventoryToBlueprint(compiledBlueprint.blueprint, pools);
  } catch (error) {
    console.warn('Inventory assignment failed, using generic elements:', error);
  }

  // 5. Render Prompt Compiler (Evercrafted Core Brain)
  const layout = buildRenderLayout(compiledBlueprint.blueprint, 600, 600);
  const prompts = compileRenderPrompts(layout);
  let renderPrompt = prompts.vertex;

  // 6. Render Quality Check
  const score = renderScore(renderPrompt);
  if (score.total < 70) {
    renderPrompt = repairPrompt(renderPrompt);
  }
  if (score.issues.length > 0) {
    console.log('Render Prompt Issues:', score.issues);
  }

  return {
    emotionProfile,
    blueprint: compiledBlueprint,
    renderPrompt
  };
};

/**
 * Compiles a photorealistic render prompt based on the blueprint and emotion profile.
 */
export const compileRenderPrompt = (blueprint: Blueprint, emotion: EmotionProfile): string => {
  const elementsSummary = (blueprint.blueprint || [])
    .slice(0, 10) // Top 10 for brevity in prompt
    .map(el => `${el.element} at ${el.angle_deg}°`)
    .join(', ');

  return `A photorealistic, high-end luxury faux botanical wreath. 
  Style: ${emotion.intent}, ${emotion.textures} textures, ${emotion.shapes} shapes.
  Palette: ${emotion.colors.join(', ')}.
  Composition: ${blueprint.formula} arrangement with focal clusters including ${elementsSummary}.
  Lighting: soft editorial daylight, 85mm lens, shallow depth of field, neutral plaster wall background, 8k resolution.`;
};
