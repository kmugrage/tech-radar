import type { BlipData } from "./use-radar-geometry";

type RadarBlipProps = {
  blip: BlipData;
  onHover: (blip: BlipData | null) => void;
  onClick: (blip: BlipData) => void;
};

export function RadarBlip({ blip, onHover, onClick }: RadarBlipProps) {
  const { position, color, isNew, index } = blip;
  const size = 12;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(blip)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(blip)}
    >
      {isNew ? (
        // Triangle for new blips
        <polygon
          points={`${position.x},${position.y - size} ${position.x - size * 0.866},${position.y + size * 0.5} ${position.x + size * 0.866},${position.y + size * 0.5}`}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
        />
      ) : (
        // Circle for existing blips
        <circle
          cx={position.x}
          cy={position.y}
          r={size * 0.75}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
        />
      )}
      <text
        x={position.x}
        y={position.y + (isNew ? 1 : 1)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={9}
        fontWeight="bold"
        pointerEvents="none"
      >
        {index}
      </text>
    </g>
  );
}
