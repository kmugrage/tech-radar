import type { BlipData } from "./use-radar-geometry";

type RadarBlipProps = {
  blip: BlipData;
  isSelected?: boolean;
  onHover: (blip: BlipData | null) => void;
  onClick: (blip: BlipData) => void;
};

export function RadarBlip({ blip, isSelected = false, onHover, onClick }: RadarBlipProps) {
  const { position, color, isNew, index } = blip;
  const size = 14;

  // Round coordinates to avoid hydration mismatch
  const x = Math.round(position.x * 100) / 100;
  const y = Math.round(position.y * 100) / 100;
  const triangleTop = Math.round((y - size) * 100) / 100;
  const triangleBottom = Math.round((y + size * 0.5) * 100) / 100;
  const triangleLeft = Math.round((x - size * 0.866) * 100) / 100;
  const triangleRight = Math.round((x + size * 0.866) * 100) / 100;
  const circleRadius = Math.round(size * 0.6 * 100) / 100;
  const textY = Math.round((y + 1) * 100) / 100;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(blip)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(blip)}
    >
      {/* Selection highlight ring */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={size * 1.2}
          fill="none"
          stroke="#bd4257"
          strokeWidth={2.5}
          opacity={0.6}
        >
          <animate
            attributeName="r"
            values={`${size * 1.2};${size * 1.4};${size * 1.2}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.3;0.6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {isNew ? (
        // Triangle for new blips - filled burgundy
        <polygon
          points={`${x},${triangleTop} ${triangleLeft},${triangleBottom} ${triangleRight},${triangleBottom}`}
          fill="#bd4257"
          stroke="white"
          strokeWidth={2}
        />
      ) : (
        // Circle for existing blips - hollow with colored stroke
        <circle
          cx={x}
          cy={y}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth={2}
        />
      )}
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isNew ? "white" : color}
        fontSize={10}
        fontWeight="600"
        pointerEvents="none"
      >
        {index}
      </text>
    </g>
  );
}
