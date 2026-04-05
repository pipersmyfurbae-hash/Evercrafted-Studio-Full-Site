// EVERCRAFTED LISTING GENERATOR

export function generateTitle() {
  const titles = [
    "Quiet Structure",
    "Soft Tension",
    "Gathered Light",
    "Still Bloom",
    "Held in Form",
    "Ashen Petal",
    "Faded Dawn",
    "Brutalist Bloom",
    "Neutral Balance",
    "Woven Silence"
  ];

  return titles[Math.floor(Math.random() * titles.length)];
}

export function generateDescription() {
  return `
A carefully composed faux botanical wreath built with asymmetrical balance,
designed for editorial-level styling and real-world buildability.

Includes full blueprint layout, stem placement, and design structure.
`;
}
