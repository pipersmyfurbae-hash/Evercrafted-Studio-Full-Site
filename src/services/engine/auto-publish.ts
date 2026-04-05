// EVERCRAFTED AUTO-PUBLISH SYSTEM

import { extractBlueprintFromImage } from "./image-to-blueprint";
import { compileRenderPrompts } from "./render-compiler";
import { renderScore } from "./render-score";
import { repairPrompt } from "./prompt-repair";
import { publishBlueprint } from "./marketplace-service";
import { generateTitle, generateDescription } from "./listing-generator";
import crypto from "crypto";

export async function autoPublishFromImage(imageUrl: string, userId: string) {
  // 1. Extract blueprint
  const blueprint = await extractBlueprintFromImage(imageUrl);

  // 2. Compile prompts
  let prompts = compileRenderPrompts(blueprint as any);

  // 3. Score + repair
  let score = renderScore(prompts.midjourney);

  if (score.total < 70) {
    prompts.midjourney = repairPrompt(prompts.midjourney);
  }

  // 4. Create listing
  const listing = publishBlueprint({
    id: crypto.randomUUID(),
    title: generateTitle(),
    description: generateDescription(),
    blueprint,
    renderPreview: imageUrl,
    price: 19,
    creatorId: userId,
    emotionTags: ["calm", "elegant"],
    styleTags: ["editorial", "luxury"],
    createdAt: new Date().toISOString(),
    downloads: 0,
    rating: 0,
  });

  return listing;
}
