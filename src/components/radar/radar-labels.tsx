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
          fill="#404040"
          fontSize={14}
          fontWeight="600"
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
          fill="#737373"
          fontSize={11}
          fontWeight="400"
          pointerEvents="none"
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}
