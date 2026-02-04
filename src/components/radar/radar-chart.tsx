"use client";

import { useState, useRef, useCallback } from "react";
import type { Quadrant, Ring, BlipWithRelations } from "@/lib/types";
import { useRadarGeometry, type BlipData } from "./use-radar-geometry";
import { RadarRing } from "./radar-ring";
import { RadarBlip } from "./radar-blip";
import { RadarRingLabels } from "./radar-labels";
import { RadarTooltip } from "./radar-tooltip";
import { RadarLegend } from "./radar-legend";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type RadarChartProps = {
  quadrants: Quadrant[];
  rings: Ring[];
  blips: BlipWithRelations[];
};

const SVG_SIZE = 800;

export function RadarChart({ quadrants, rings, blips }: RadarChartProps) {
  const [hoveredBlip, setHoveredBlip] = useState<BlipData | null>(null);
  const [selectedBlip, setSelectedBlip] = useState<BlipData | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { cx, cy, radius, segments, blipData, ringLabels } =
    useRadarGeometry(quadrants, rings, blips, SVG_SIZE);

  const handleBlipHover = useCallback((blip: BlipData | null) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (blip) {
      // Show tooltip immediately on hover
      setHoveredBlip(blip);
    } else {
      // Add a small delay before hiding to prevent flicker
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredBlip(null);
      }, 50);
    }
  }, []);

  function handleBlipClick(blip: BlipData) {
    setSelectedBlip(selectedBlip?.id === blip.id ? null : blip);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={quadrants[0]?.id || ""}>
        <TabsList>
          {quadrants.map((q) => (
            <TabsTrigger key={q.id} value={q.id}>
              {q.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {quadrants.map((quadrant) => {
          const quadrantSegments = segments.filter(
            (s) => s.quadrant.id === quadrant.id
          );
          const quadrantBlips = blipData.filter(
            (b) => b.quadrantName === quadrant.name
          );

          return (
            <TabsContent key={quadrant.id} value={quadrant.id}>
              <div className="flex flex-col gap-6 lg:flex-row">
                {/* SVG Radar - Single Quadrant */}
                <div className="flex-1">
                  <svg
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    className="w-full max-w-[800px] select-none"
                    role="img"
                    aria-label={`Technology Radar - ${quadrant.name}`}
                    style={{ userSelect: 'none' }}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    {/* Background */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="white"
                      stroke="#e5e5e5"
                      strokeWidth={1}
                    />

                    {/* Segments for this quadrant only */}
                    {quadrantSegments.map((seg, i) => (
                      <RadarRing key={i} segment={seg} />
                    ))}

                    {/* Ring circles */}
                    {rings.map((ring) => {
                      const r = ((ring.position + 1) / rings.length) * radius;
                      return (
                        <circle
                          key={ring.id}
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill="none"
                          stroke="#e5e5e5"
                          strokeWidth={1}
                        />
                      );
                    })}

                    {/* Ring Labels */}
                    <RadarRingLabels labels={ringLabels} />

                    {/* Blips for this quadrant only */}
                    {quadrantBlips.map((blip) => (
                      <RadarBlip
                        key={blip.id}
                        blip={blip}
                        isSelected={selectedBlip?.id === blip.id}
                        onHover={handleBlipHover}
                        onClick={handleBlipClick}
                      />
                    ))}

                    {/* Tooltip */}
                    <RadarTooltip blip={hoveredBlip} svgSize={SVG_SIZE} />
                  </svg>
                </div>

                {/* Legend sidebar */}
                <div className="w-full rounded-sm border border-gray-200 bg-white p-4 lg:w-80">
                  <h2 className="mb-4 text-lg font-display font-normal text-gray-900">
                    {quadrant.name}
                  </h2>
                  <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-[#bd4257] rounded-full"></span>
                      New
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 border-2 border-gray-400 rounded-full"></span>
                      No change
                    </span>
                  </div>
                  <RadarLegend
                    blips={quadrantBlips}
                    rings={rings}
                    selectedBlip={selectedBlip}
                    onBlipClick={handleBlipClick}
                  />

                  {/* Selected blip detail */}
                  {selectedBlip && quadrantBlips.some(b => b.id === selectedBlip.id) && (
                    <div className="mt-6 rounded-sm border border-gray-200 bg-gray-50 p-4">
                      <h3 className="font-semibold text-gray-900">
                        {selectedBlip.index}. {selectedBlip.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedBlip.ringName}
                      </p>
                      {selectedBlip.description && (
                        <p className="mt-2 text-sm text-gray-700">
                          {selectedBlip.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
