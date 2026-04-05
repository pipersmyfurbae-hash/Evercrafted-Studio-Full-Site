// EVERCRAFTED PROMPT AUTO-REPAIR ENGINE

export function repairPrompt(prompt: string): string {
  let repaired = prompt;

  // ----------------------------
  // REMOVE BAD SIGNALS
  // ----------------------------

  const REMOVE_TERMS = [
    "fresh flowers",
    "dew",
    "water droplets",
    "wet petals",
    "realistic moisture",
  ];

  REMOVE_TERMS.forEach((term) => {
    const regex = new RegExp(term, "gi");
    repaired = repaired.replace(regex, "");
  });

  // ----------------------------
  // FORCE FAUX MATERIAL DNA
  // ----------------------------

  const REQUIRED_BLOCK = `
silk flowers with matte fabric petals,
slight fraying edges,
latex-coated leaves with subtle vein texture,
semi-gloss foliage,
visible wired stems integrated into grapevine base,
`;

  if (!repaired.includes("silk flowers")) {
    repaired += "\n" + REQUIRED_BLOCK;
  }

  // ----------------------------
  // FORCE LIGHTING DNA
  // ----------------------------

  if (!repaired.includes("85mm")) {
    repaired += `
85mm lens, shallow depth of field,
soft directional daylight (12–2pm),
editorial product photography,
`;
  }

  // ----------------------------
  // FORCE NEGATIVE RULES
  // ----------------------------

  const NEGATIVE_BLOCK = `
NO fresh flowers,
NO water droplets,
NO hyper-saturated colors,
NO plastic shine,
NO artificial gloss reflections
`;

  if (!repaired.includes("NO fresh flowers")) {
    repaired += "\n" + NEGATIVE_BLOCK;
  }

  return repaired.trim();
}
