import type { SegmentData } from "./use-radar-geometry";

export function RadarRing({ segment }: { segment: SegmentData }) {
  return (
    <path
      d={segment.path}
      fill={segment.color}
      fillOpacity={segment.opacity * 0.15}
      stroke="none"
    />
  );
}
