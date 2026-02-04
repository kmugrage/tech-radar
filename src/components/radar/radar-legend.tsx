import type { BlipData } from "./use-radar-geometry";
import type { Quadrant, Ring } from "@/lib/types";

type RadarLegendProps = {
  blips: BlipData[];
  quadrants: Quadrant[];
  rings: Ring[];
  selectedBlip: BlipData | null;
  onBlipClick: (blip: BlipData) => void;
};

export function RadarLegend({
  blips,
  quadrants,
  rings,
  selectedBlip,
  onBlipClick,
}: RadarLegendProps) {
  // Group blips by quadrant
  const grouped = quadrants.map((q) => ({
    quadrant: q,
    blips: blips.filter((b) => b.quadrantName === q.name),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ quadrant, blips: qBlips }) => (
        <div key={quadrant.id}>
          <h3
            className="mb-2 text-sm font-bold uppercase tracking-wider"
            style={{ color: quadrant.color }}
          >
            {quadrant.name}
          </h3>
          {qBlips.length === 0 ? (
            <p className="text-xs text-gray-400">No blips</p>
          ) : (
            <ul className="space-y-1">
              {qBlips.map((blip) => (
                <li
                  key={blip.id}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedBlip?.id === blip.id
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => onBlipClick(blip)}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: blip.color }}
                  >
                    {blip.index}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {blip.name}
                  </span>
                  {blip.isNew && (
                    <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      NEW
                    </span>
                  )}
                  <span className="ml-auto text-xs text-gray-400">
                    {blip.ringName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
