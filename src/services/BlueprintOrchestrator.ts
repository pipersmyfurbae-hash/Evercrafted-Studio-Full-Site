import { Blueprint, EmotionProfile, ScoreReport } from '../types';
import { scoreBlueprint } from '../services/blueprintScoringEngine';
import { generatePlacement } from './engine/placementEngine';
import { engineToUI } from './transformer';

export const runOrchestrator = async (
  blueprint: Blueprint,
  emotionProfile?: EmotionProfile
): Promise<{
  report: ScoreReport;
  blueprint: Blueprint;
}> => {
  // 1. If clusters are provided, update the blueprint elements
  let updatedBlueprint = { ...blueprint };
  if (updatedBlueprint.clusters && updatedBlueprint.clusters.length > 0) {
    updatedBlueprint.elements = generatePlacement(updatedBlueprint);
    // Sync legacy blueprint array
    updatedBlueprint.blueprint = updatedBlueprint.elements.map(engineToUI) as any;
  }

  // 2. Score the blueprint
  const report = scoreBlueprint(updatedBlueprint, emotionProfile);
  
  return { report, blueprint: updatedBlueprint };
};
