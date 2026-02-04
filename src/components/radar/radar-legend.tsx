import type { BlipData } from "./use-radar-geometry";
import type { Ring } from "@/lib/types";

type RadarLegendProps = {
  blips: BlipData[];
  rings: Ring[];
  selectedBlip: BlipData | null;
  onBlipClick: (blip: BlipData) => void;
};

export function RadarLegend({
  blips,
  rings,
  selectedBlip,
  onBlipClick,
}: RadarLegendProps) {
  // Group by ring instead of quadrant (since we're in single quadrant view)
  const grouped = rings.map((ring) => ({
    ring,
    blips: blips.filter((b) => b.ringName === ring.name),
  }));

  return (
    <div className="space-y-4">
      {grouped.map(({ ring, blips: ringBlips }) => (
        <div key={ring.id}>
          <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {ring.name}
          </h3>
          {ringBlips.length === 0 ? (
            <p className="text-xs text-gray-400">No items</p>
          ) : (
            <ul className="space-y-1">
              {ringBlips.map((blip) => (
                <li
                  key={blip.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 ${
                    selectedBlip?.id === blip.id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => onBlipClick(blip)}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-xs font-semibold text-gray-700">
                    {blip.index}
                  </span>
                  <span className="text-gray-900 flex-1">{blip.name}</span>
                  {blip.isNew && (
                    <span className="w-2 h-2 bg-[#bd4257] rounded-full"></span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
