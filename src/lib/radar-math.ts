/**
 * Pure math functions for radar SVG rendering.
 *
 * The radar is a full circle centered at (cx, cy) with radius R.
 * - 4 quadrants, each 90 degrees
 *   Q0 = top-right (270° to 360°), Q1 = top-left (180° to 270°),
 *   Q2 = bottom-left (90° to 180°), Q3 = bottom-right (0° to 90°)
 * - 4 concentric rings from center outward (ring 0 = innermost)
 */

export type Point = { x: number; y: number };

/** Convert degrees to radians */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert polar coordinates to cartesian */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): Point {
  const rad = degToRad(angleDeg);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

/**
 * Start angle (in degrees, counter-clockwise from 3 o'clock) for each quadrant.
 * Q0 (top-right):     0° to 90°
 * Q1 (top-left):     90° to 180°
 * Q2 (bottom-left): 180° to 270°
 * Q3 (bottom-right): 270° to 360°
 */
export function quadrantAngles(position: number): {
  startAngle: number;
  endAngle: number;
} {
  const startAngle = position * 90;
  return { startAngle, endAngle: startAngle + 90 };
}

/**
 * Inner and outer radius for a ring, given total radius R and ring count.
 * Ring 0 is innermost (closest to center).
 */
export function ringRadii(
  position: number,
  totalRadius: number,
  ringCount: number = 4
): { innerRadius: number; outerRadius: number } {
  const step = totalRadius / ringCount;
  return {
    innerRadius: position * step,
    outerRadius: (position + 1) * step,
  };
}

/**
 * Build an SVG arc path for a segment (quadrant + ring intersection).
 * Returns a path "d" attribute for the arc segment.
 */
export function arcSegmentPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  // Handle full-circle inner radius = 0 as a special case
  if (innerRadius === 0) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
      `Z`,
    ].join(" ");
  }

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}

/**
 * Convert a blip's normalized offsets (0-1) to cartesian position
 * within its segment (quadrant + ring).
 */
export function blipPosition(
  cx: number,
  cy: number,
  totalRadius: number,
  quadrantPosition: number,
  ringPosition: number,
  offsetX: number,
  offsetY: number,
  ringCount: number = 4
): Point {
  const { startAngle, endAngle } = quadrantAngles(quadrantPosition);
  const { innerRadius, outerRadius } = ringRadii(
    ringPosition,
    totalRadius,
    ringCount
  );

  // Map offsetX to angle within quadrant, offsetY to radius within ring
  const angle = startAngle + offsetX * (endAngle - startAngle);
  const radius = innerRadius + offsetY * (outerRadius - innerRadius);

  // Add small padding from edges
  const paddedInner = innerRadius + (outerRadius - innerRadius) * 0.1;
  const paddedOuter = outerRadius - (outerRadius - innerRadius) * 0.1;
  const paddedRadius = paddedInner + offsetY * (paddedOuter - paddedInner);

  const paddedStartAngle = startAngle + 5;
  const paddedEndAngle = endAngle - 5;
  const paddedAngle =
    paddedStartAngle + offsetX * (paddedEndAngle - paddedStartAngle);

  return polarToCartesian(cx, cy, paddedRadius, paddedAngle);
}

/**
 * Position for a quadrant label (placed outside the outermost ring,
 * at the midpoint angle of the quadrant).
 */
export function quadrantLabelPosition(
  cx: number,
  cy: number,
  totalRadius: number,
  quadrantPosition: number
): Point {
  const { startAngle, endAngle } = quadrantAngles(quadrantPosition);
  const midAngle = (startAngle + endAngle) / 2;
  return polarToCartesian(cx, cy, totalRadius * 1.3, midAngle);
}

/**
 * Position for a ring label (placed along the 45-degree line from center).
 */
export function ringLabelPosition(
  cx: number,
  cy: number,
  totalRadius: number,
  ringPosition: number,
  ringCount: number = 4
): Point {
  const { innerRadius, outerRadius } = ringRadii(
    ringPosition,
    totalRadius,
    ringCount
  );
  const midRadius = (innerRadius + outerRadius) / 2;
  // Place at 45 degrees (top-right diagonal)
  return polarToCartesian(cx, cy, midRadius, 45);
}

/**
 * Check if two points are too close (collision detection).
 * Returns true if distance between points is less than minDistance.
 */
export function hasCollision(
  p1: Point,
  p2: Point,
  minDistance: number = 20
): boolean {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < minDistance;
}

/**
 * Adjust blip positions to avoid collisions using a simple force-based approach.
 * This mutates the positions array in place.
 */
export function resolveCollisions(
  positions: Point[],
  minDistance: number = 20,
  maxIterations: number = 50
): void {
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hadCollision = false;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (hasCollision(positions[i], positions[j], minDistance)) {
          hadCollision = true;

          // Calculate repulsion vector
          const dx = positions[j].x - positions[i].x;
          const dy = positions[j].y - positions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Avoid division by zero
          if (distance < 0.1) {
            // If points are almost identical, push them apart in a random direction
            const angle = Math.random() * Math.PI * 2;
            positions[i].x -= Math.cos(angle) * minDistance * 0.5;
            positions[i].y -= Math.sin(angle) * minDistance * 0.5;
            positions[j].x += Math.cos(angle) * minDistance * 0.5;
            positions[j].y += Math.sin(angle) * minDistance * 0.5;
          } else {
            // Push points apart proportionally
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * overlap * 0.5;
            const pushY = (dy / distance) * overlap * 0.5;

            positions[i].x -= pushX;
            positions[i].y -= pushY;
            positions[j].x += pushX;
            positions[j].y += pushY;
          }
        }
      }
    }

    // If no collisions were found, we're done
    if (!hadCollision) break;
  }
}
