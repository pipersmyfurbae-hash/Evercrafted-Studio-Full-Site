// EVERCRAFTED VISION ENGINE (GEMINI)

import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeWreathImage(imageUrl: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Extract base64 data from data URL if necessary
  let base64Data = imageUrl;
  let mimeType = "image/jpeg";
  
  if (imageUrl.startsWith("data:")) {
    const parts = imageUrl.split(",");
    base64Data = parts[1];
    mimeType = parts[0].split(":")[1].split(";")[0];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `
Analyze this wreath image and return structured JSON with:
- element: the specific flower or greenery name (e.g., "red rose", "eucalyptus")
- angle_deg: approximate angle position (0–360)
- radius: depth layer ("inner", "mid", "outer")
- category: classification ("focal", "secondary", "accent", "filler", "greenery")

Return ONLY a JSON array of objects.
            `,
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            element: { type: Type.STRING },
            angle_deg: { type: Type.NUMBER },
            radius: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["element", "angle_deg", "radius", "category"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    return [];
  }
}
