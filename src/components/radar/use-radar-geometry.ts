import { useMemo } from "react";
import type { Quadrant, Ring, BlipWithRelations } from "@/lib/types";
import {
  quadrantAngles,
  ringRadii,
  arcSegmentPath,
  blipPosition,
  quadrantLabelPosition,
  ringLabelPosition,
  resolveCollisions,
  type Point,
} from "@/lib/radar-math";

export type SegmentData = {
  quadrant: Quadrant;
  ring: Ring;
  path: string;
  color: string;
  opacity: number;
};

export type BlipData = {
  id: string;
  name: string;
  description: string | null;
  isNew: boolean;
  position: Point;
  color: string;
  quadrantName: string;
  ringName: string;
  index: number;
};

export type LabelData = {
  text: string;
  position: Point;
};

export function useRadarGeometry(
  quadrants: Quadrant[],
  rings: Ring[],
  blips: BlipWithRelations[],
  size: number = 800
) {
  return useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * 0.8; // leave room for labels outside the rings

    // Build segments
    const segments: SegmentData[] = [];
    for (const quadrant of quadrants) {
      const { startAngle, endAngle } = quadrantAngles(quadrant.position);
      for (const ring of rings) {
        const { innerRadius, outerRadius } = ringRadii(
          ring.position,
          radius,
          rings.length
        );
        const path = arcSegmentPath(
          cx,
          cy,
          innerRadius,
          outerRadius,
          startAngle,
          endAngle
        );
        segments.push({
          quadrant,
          ring,
          path,
          color: quadrant.color,
          opacity: ring.opacity,
        });
      }
    }

    // Build blip positions
    const blipData: BlipData[] = blips.map((blip, idx) => {
      const quadrant = quadrants.find((q) => q.id === blip.quadrantId);
      const ring = rings.find((r) => r.id === blip.ringId);
      const pos = blipPosition(
        cx,
        cy,
        radius,
        quadrant?.position ?? 0,
        ring?.position ?? 0,
        blip.offsetX,
        blip.offsetY,
        rings.length
      );
      return {
        id: blip.id,
        name: blip.name,
        description: blip.description,
        isNew: blip.isNew,
        position: pos,
        color: quadrant?.color ?? "#888",
        quadrantName: quadrant?.name ?? "",
        ringName: ring?.name ?? "",
        index: idx + 1,
      };
    });

    // Apply collision detection and resolution
    const positions = blipData.map(b => b.position);
    resolveCollisions(positions, 20, 50);
    // Update blip positions with collision-resolved coordinates
    blipData.forEach((blip, idx) => {
      blip.position = positions[idx];
    });

    // Build labels
    const quadrantLabels: LabelData[] = quadrants.map((q) => ({
      text: q.name,
      position: quadrantLabelPosition(cx, cy, radius, q.position),
    }));

    const ringLabels: LabelData[] = rings.map((r) => ({
      text: r.name,
      position: ringLabelPosition(cx, cy, radius, r.position, rings.length),
    }));

    return { cx, cy, radius, segments, blipData, quadrantLabels, ringLabels };
  }, [quadrants, rings, blips, size]);
}
