import type { BlipData } from "./use-radar-geometry";

export function RadarTooltip({
  blip,
  svgSize,
}: {
  blip: BlipData | null;
  svgSize: number;
}) {
  if (!blip) return null;

  // Position tooltip near the blip, keeping it within bounds
  // Keep it away from the blip to avoid interference
  const tooltipWidth = 240;
  const tooltipHeight = 130; // Larger to accommodate longer descriptions
  const offset = 20; // Increased offset to keep tooltip away from blip

  let x = blip.position.x + offset;
  let y = blip.position.y - tooltipHeight / 2;

  // If tooltip goes off right edge, position it to the left
  if (x + tooltipWidth > svgSize - 10) {
    x = blip.position.x - tooltipWidth - offset;
  }

  // Keep tooltip within vertical bounds
  if (y < 10) y = 10;
  if (y + tooltipHeight > svgSize - 10) {
    y = svgSize - tooltipHeight - 10;
  }

  // Keep tooltip within horizontal bounds
  if (x < 10) x = 10;

  return (
    <foreignObject x={x} y={y} width={tooltipWidth} height={tooltipHeight} pointerEvents="none">
      <div className="rounded-sm border border-gray-200 bg-white p-3 shadow-lg overflow-hidden">
        <p className="font-medium text-gray-900 text-sm">
          {blip.index}. {blip.name}
          {blip.isNew && (
            <span className="ml-1 text-xs text-[#bd4257]">
              NEW
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {blip.quadrantName} &middot; {blip.ringName}
        </p>
        {blip.description && (
          <p className="mt-1 text-xs text-gray-600 line-clamp-4">
            {blip.description}
          </p>
        )}
      </div>
    </foreignObject>
  );
}
