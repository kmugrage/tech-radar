export const DEFAULT_QUADRANTS = [
  { name: "Techniques", position: 0, color: "#bd4257" },
  { name: "Platforms", position: 1, color: "#6b7c93" },
  { name: "Tools", position: 2, color: "#8b7355" },
  { name: "Languages & Frameworks", position: 3, color: "#5a7d7c" },
] as const;

export const DEFAULT_RINGS = [
  { name: "Adopt", position: 0, opacity: 1.0 },
  { name: "Trial", position: 1, opacity: 0.75 },
  { name: "Assess", position: 2, opacity: 0.5 },
  { name: "Hold", position: 3, opacity: 0.25 },
] as const;
