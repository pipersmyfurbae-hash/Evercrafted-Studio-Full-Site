import { Blueprint } from '../../types';

export interface PackageBundle {
  blueprint: string; // PDF Blob URL or Base64
  instructions: string;
  materials: string;
  render_prompt: string;
}

export const packageBlueprint = (blueprint: Blueprint, instructions: string, materials: string[], prompt: string): PackageBundle => {
  // This will be expanded to generate the actual PDF bundle structure
  return {
    blueprint: `data:application/pdf;base64,${btoa(JSON.stringify(blueprint))}`,
    instructions,
    materials: materials.join('\n'),
    render_prompt: prompt
  };
};
