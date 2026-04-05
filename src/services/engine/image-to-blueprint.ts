// EVERCRAFTED IMAGE → BLUEPRINT ENGINE

export interface DetectedElement {
  element: string;
  category: "focal" | "secondary" | "accent" | "filler" | "greenery";
  angle_deg: number;
  radius: "inner" | "mid" | "outer";
}

export async function extractBlueprintFromImage(imageUrl: string) {
  // Placeholder for AI vision call (Vertex / OpenAI Vision)
  // In a real implementation, we would use the Gemini API with the image input.

  const detected: DetectedElement[] = await fakeVisionModel(imageUrl);

  return detected.map((el, i) => ({
    id: `det-${i}`,
    element: el.element,
    category: el.category,
    angle_deg: el.angle_deg,
    radius: el.radius,
    stem_count: 1,
  }));
}

// TEMP MOCK (replace with real model)
async function fakeVisionModel(imageUrl: string) {
  // Simulating AI vision detection
  return [
    {
      element: "garden rose",
      category: "focal",
      angle_deg: 210,
      radius: "outer",
    },
    {
      element: "eucalyptus",
      category: "greenery",
      angle_deg: 180,
      radius: "mid",
    },
    {
      element: "peony",
      category: "focal",
      angle_deg: 45,
      radius: "mid",
    },
    {
      element: "lavender",
      category: "accent",
      angle_deg: 120,
      radius: "inner",
    }
  ] as DetectedElement[];
}
