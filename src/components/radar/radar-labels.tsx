import type { LabelData } from "./use-radar-geometry";

export function RadarQuadrantLabels({ labels }: { labels: LabelData[] }) {
  return (
    <g>
      {labels.map((label, i) => (
        <text
          key={i}
          x={label.position.x}
          y={label.position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          fontSize={14}
          fontWeight="600"
          className="text-gray-700 dark:text-gray-300"
          pointerEvents="none"
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}

export function RadarRingLabels({ labels }: { labels: LabelData[] }) {
  return (
    <g>
      {labels.map((label, i) => (
        <text
          key={i}
          x={label.position.x}
          y={label.position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          fontSize={11}
          fontWeight="400"
          className="text-gray-500 dark:text-gray-400"
          pointerEvents="none"
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}
