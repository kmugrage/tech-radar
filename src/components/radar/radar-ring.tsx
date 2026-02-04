import type { SegmentData } from "./use-radar-geometry";

export function RadarRing({ segment }: { segment: SegmentData }) {
  return (
    <path
      d={segment.path}
      fill={segment.color}
      fillOpacity={segment.opacity * 0.3}
      stroke={segment.color}
      strokeOpacity={0.3}
      strokeWidth={0.5}
    />
  );
}
