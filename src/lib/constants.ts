export const DEFAULT_QUADRANTS = [
  { name: "Techniques", position: 0, color: "#3b82f6" },
  { name: "Platforms", position: 1, color: "#10b981" },
  { name: "Tools", position: 2, color: "#f59e0b" },
  { name: "Languages & Frameworks", position: 3, color: "#ef4444" },
] as const;

export const DEFAULT_RINGS = [
  { name: "Adopt", position: 0, opacity: 1.0 },
  { name: "Trial", position: 1, opacity: 0.75 },
  { name: "Assess", position: 2, opacity: 0.5 },
  { name: "Hold", position: 3, opacity: 0.25 },
] as const;
