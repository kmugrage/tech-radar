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
  const tooltipWidth = 220;
  const tooltipHeight = 80;
  let x = blip.position.x + 16;
  let y = blip.position.y - 10;

  if (x + tooltipWidth > svgSize) {
    x = blip.position.x - tooltipWidth - 16;
  }
  if (y + tooltipHeight > svgSize) {
    y = svgSize - tooltipHeight - 10;
  }
  if (y < 10) y = 10;

  return (
    <foreignObject x={x} y={y} width={tooltipWidth} height={tooltipHeight}>
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {blip.index}. {blip.name}
          {blip.isNew && (
            <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
              NEW
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {blip.quadrantName} &middot; {blip.ringName}
        </p>
        {blip.description && (
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {blip.description}
          </p>
        )}
      </div>
    </foreignObject>
  );
}
