"use client";

import { useState } from "react";
import type { Quadrant, Ring, BlipWithRelations } from "@/lib/types";
import { useRadarGeometry, type BlipData } from "./use-radar-geometry";
import { RadarRing } from "./radar-ring";
import { RadarBlip } from "./radar-blip";
import { RadarQuadrantLabels, RadarRingLabels } from "./radar-labels";
import { RadarTooltip } from "./radar-tooltip";
import { RadarLegend } from "./radar-legend";

type RadarChartProps = {
  quadrants: Quadrant[];
  rings: Ring[];
  blips: BlipWithRelations[];
};

const SVG_SIZE = 800;

export function RadarChart({ quadrants, rings, blips }: RadarChartProps) {
  const [hoveredBlip, setHoveredBlip] = useState<BlipData | null>(null);
  const [selectedBlip, setSelectedBlip] = useState<BlipData | null>(null);

  const { cx, cy, radius, segments, blipData, quadrantLabels, ringLabels } =
    useRadarGeometry(quadrants, rings, blips, SVG_SIZE);

  function handleBlipClick(blip: BlipData) {
    setSelectedBlip(selectedBlip?.id === blip.id ? null : blip);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* SVG Radar */}
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full max-w-[800px]"
          role="img"
          aria-label="Technology Radar"
        >
          {/* Background */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />

          {/* Segments */}
          {segments.map((seg, i) => (
            <RadarRing key={i} segment={seg} />
          ))}

          {/* Cross-hairs */}
          <line
            x1={cx - radius}
            y1={cy}
            x2={cx + radius}
            y2={cy}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
          <line
            x1={cx}
            y1={cy - radius}
            x2={cx}
            y2={cy + radius}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />

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
                stroke="currentColor"
                strokeOpacity={0.15}
                strokeWidth={1}
              />
            );
          })}

          {/* Labels */}
          <RadarQuadrantLabels labels={quadrantLabels} />
          <RadarRingLabels labels={ringLabels} />

          {/* Blips */}
          {blipData.map((blip) => (
            <RadarBlip
              key={blip.id}
              blip={blip}
              onHover={setHoveredBlip}
              onClick={handleBlipClick}
            />
          ))}

          {/* Tooltip */}
          <RadarTooltip blip={hoveredBlip} svgSize={SVG_SIZE} />
        </svg>
      </div>

      {/* Legend sidebar */}
      <div className="w-full rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:w-80">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Legend
        </h2>
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon
                points="6,0 0,10.4 12,10.4"
                fill="#888"
              />
            </svg>
            New
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" fill="#888" />
            </svg>
            Existing
          </span>
        </div>
        <RadarLegend
          blips={blipData}
          quadrants={quadrants}
          rings={rings}
          selectedBlip={selectedBlip}
          onBlipClick={handleBlipClick}
        />

        {/* Selected blip detail */}
        {selectedBlip && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedBlip.index}. {selectedBlip.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedBlip.quadrantName} &middot; {selectedBlip.ringName}
            </p>
            {selectedBlip.description && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {selectedBlip.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
