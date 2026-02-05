import { describe, it, expect } from 'vitest';
import {
  degToRad,
  polarToCartesian,
  quadrantAngles,
  ringRadii,
  arcSegmentPath,
  blipPosition,
  quadrantLabelPosition,
  ringLabelPosition,
  hasCollision,
  resolveCollisions,
} from '@/lib/radar-math';

describe('radar-math utilities', () => {
  describe('degToRad', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degToRad(0)).toBe(0);
    });

    it('converts 90 degrees to π/2 radians', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    });

    it('converts 180 degrees to π radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
    });

    it('converts 360 degrees to 2π radians', () => {
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });

    it('handles negative angles', () => {
      expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
    });
  });

  describe('polarToCartesian', () => {
    it('converts polar coordinates to cartesian at 0 degrees', () => {
      const result = polarToCartesian(0, 0, 100, 0);
      expect(result.x).toBeCloseTo(100);
      expect(result.y).toBeCloseTo(0);
    });

    it('converts polar coordinates to cartesian at 90 degrees', () => {
      const result = polarToCartesian(0, 0, 100, 90);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-100);
    });

    it('converts polar coordinates with center offset', () => {
      const result = polarToCartesian(50, 50, 100, 0);
      expect(result.x).toBeCloseTo(150);
      expect(result.y).toBeCloseTo(50);
    });

    it('handles radius of 0', () => {
      const result = polarToCartesian(0, 0, 0, 45);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
    });
  });

  describe('quadrantAngles', () => {
    it('returns correct angles for quadrant 0 (0° to 90°)', () => {
      const angles = quadrantAngles(0);
      expect(angles.startAngle).toBe(0);
      expect(angles.endAngle).toBe(90);
    });

    it('returns correct angles for quadrant 1 (90° to 180°)', () => {
      const angles = quadrantAngles(1);
      expect(angles.startAngle).toBe(90);
      expect(angles.endAngle).toBe(180);
    });

    it('returns correct angles for quadrant 2 (180° to 270°)', () => {
      const angles = quadrantAngles(2);
      expect(angles.startAngle).toBe(180);
      expect(angles.endAngle).toBe(270);
    });

    it('returns correct angles for quadrant 3 (270° to 360°)', () => {
      const angles = quadrantAngles(3);
      expect(angles.startAngle).toBe(270);
      expect(angles.endAngle).toBe(360);
    });

    it('does not throw error for valid quadrant positions', () => {
      expect(() => quadrantAngles(0)).not.toThrow();
      expect(() => quadrantAngles(1)).not.toThrow();
      expect(() => quadrantAngles(2)).not.toThrow();
      expect(() => quadrantAngles(3)).not.toThrow();
    });
  });

  describe('ringRadii', () => {
    it('calculates correct radii for innermost ring (position 0)', () => {
      const radii = ringRadii(0, 400);
      expect(radii.innerRadius).toBe(0);
      expect(radii.outerRadius).toBe(100);
    });

    it('calculates correct radii for ring position 1', () => {
      const radii = ringRadii(1, 400);
      expect(radii.innerRadius).toBe(100);
      expect(radii.outerRadius).toBe(200);
    });

    it('calculates correct radii for ring position 2', () => {
      const radii = ringRadii(2, 400);
      expect(radii.innerRadius).toBe(200);
      expect(radii.outerRadius).toBe(300);
    });

    it('calculates correct radii for outermost ring (position 3)', () => {
      const radii = ringRadii(3, 400);
      expect(radii.innerRadius).toBe(300);
      expect(radii.outerRadius).toBe(400);
    });

    it('does not throw error for valid ring positions', () => {
      expect(() => ringRadii(0, 400)).not.toThrow();
      expect(() => ringRadii(1, 400)).not.toThrow();
      expect(() => ringRadii(2, 400)).not.toThrow();
      expect(() => ringRadii(3, 400)).not.toThrow();
    });
  });

  describe('arcSegmentPath', () => {
    it('generates valid SVG path for a quadrant segment', () => {
      const path = arcSegmentPath(0, 0, 100, 200, -90, 0);
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('L');
      expect(path).toContain('Z');
    });

    it('handles zero inner radius (full sector)', () => {
      const path = arcSegmentPath(0, 0, 0, 100, 0, 90);
      expect(path).toBeTruthy();
    });

    it('generates different paths for different angles', () => {
      const path1 = arcSegmentPath(0, 0, 100, 200, 0, 90);
      const path2 = arcSegmentPath(0, 0, 100, 200, 90, 180);
      expect(path1).not.toBe(path2);
    });
  });

  describe('blipPosition', () => {
    it('calculates blip position with normalized offsets', () => {
      const position = blipPosition(0, 0, 400, 0, 0, 0.5, 0.5);
      expect(position.x).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(0);
    });

    it('handles offset at minimum (0, 0)', () => {
      const position = blipPosition(0, 0, 400, 0, 0, 0, 0);
      expect(position.x).toBeGreaterThan(0);
      expect(position.y).toBeGreaterThanOrEqual(-10);
    });

    it('handles offset at maximum (1, 1)', () => {
      const position = blipPosition(0, 0, 400, 0, 0, 1, 1);
      expect(position.x).toBeGreaterThan(0);
      expect(position.y).toBeLessThan(0);
    });

    it('calculates different positions for different quadrants', () => {
      const pos0 = blipPosition(0, 0, 400, 0, 0, 0.5, 0.5);
      const pos1 = blipPosition(0, 0, 400, 1, 0, 0.5, 0.5);
      expect(pos0.x).not.toBe(pos1.x);
      expect(pos0.y).not.toBe(pos1.y);
    });

    it('calculates different positions for different rings', () => {
      const pos0 = blipPosition(0, 0, 400, 0, 0, 0.5, 0.5);
      const pos1 = blipPosition(0, 0, 400, 0, 1, 0.5, 0.5);
      expect(Math.hypot(pos0.x, pos0.y)).toBeLessThan(
        Math.hypot(pos1.x, pos1.y)
      );
    });
  });

  describe('quadrantLabelPosition', () => {
    it('calculates position for quadrant 0', () => {
      const pos = quadrantLabelPosition(0, 0, 400, 0);
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeLessThan(0);
    });

    it('calculates position for quadrant 1', () => {
      const pos = quadrantLabelPosition(0, 0, 400, 1);
      expect(pos.x).toBeLessThan(0);
      expect(pos.y).toBeLessThan(0);
    });

    it('calculates position for quadrant 2', () => {
      const pos = quadrantLabelPosition(0, 0, 400, 2);
      expect(pos.x).toBeLessThan(0);
      expect(pos.y).toBeGreaterThan(0);
    });

    it('calculates position for quadrant 3', () => {
      const pos = quadrantLabelPosition(0, 0, 400, 3);
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeGreaterThan(0);
    });
  });

  describe('ringLabelPosition', () => {
    it('calculates position for ring 0', () => {
      const pos = ringLabelPosition(0, 0, 400, 0);
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeLessThan(0);
    });

    it('calculates position for ring 3', () => {
      const pos = ringLabelPosition(0, 0, 400, 3);
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeLessThan(0);
    });

    it('places labels further from center for outer rings', () => {
      const pos0 = ringLabelPosition(0, 0, 400, 0);
      const pos3 = ringLabelPosition(0, 0, 400, 3);
      const dist0 = Math.hypot(pos0.x, pos0.y);
      const dist3 = Math.hypot(pos3.x, pos3.y);
      expect(dist3).toBeGreaterThan(dist0);
    });
  });

  describe('hasCollision', () => {
    it('detects collision when points are very close', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 5, y: 5 };
      expect(hasCollision(p1, p2)).toBe(true);
    });

    it('detects no collision when points are far apart', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 50, y: 50 };
      expect(hasCollision(p1, p2)).toBe(false);
    });

    it('detects collision at exact threshold distance', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 15, y: 0 };
      // Default min distance is 15
      expect(hasCollision(p1, p2)).toBe(true);
    });

    it('handles same point collision', () => {
      const p1 = { x: 10, y: 10 };
      const p2 = { x: 10, y: 10 };
      expect(hasCollision(p1, p2)).toBe(true);
    });
  });

  describe('resolveCollisions', () => {
    it('handles empty array', () => {
      const blips: Array<{ x: number; y: number }> = [];
      resolveCollisions(blips);
      expect(blips).toEqual([]);
    });

    it('does not modify single blip', () => {
      const blips = [{ x: 0, y: 0 }];
      const originalX = blips[0].x;
      const originalY = blips[0].y;
      resolveCollisions(blips);
      expect(blips[0].x).toBe(originalX);
      expect(blips[0].y).toBe(originalY);
    });

    it('separates colliding blips', () => {
      const blips = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ];
      const original = blips.map(b => ({ ...b }));

      resolveCollisions(blips);

      // Check that at least some blips have been moved
      const moved = blips.some((b, i) =>
        b.x !== original[i].x || b.y !== original[i].y
      );
      expect(moved).toBe(true);
    });

    it('does not move non-colliding blips significantly', () => {
      const blips = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ];
      const originalX1 = blips[0].x;
      const originalY1 = blips[0].y;
      const originalX2 = blips[1].x;
      const originalY2 = blips[1].y;

      resolveCollisions(blips);

      // Non-colliding blips should remain roughly in the same place
      expect(blips[0].x).toBeCloseTo(originalX1, 0);
      expect(blips[0].y).toBeCloseTo(originalY1, 0);
      expect(blips[1].x).toBeCloseTo(originalX2, 0);
      expect(blips[1].y).toBeCloseTo(originalY2, 0);
    });

    it('terminates after maximum iterations', () => {
      const blips = Array(20).fill(null).map(() => ({ x: 0, y: 0 }));

      // Should complete without hanging
      expect(() => resolveCollisions(blips)).not.toThrow();
      expect(blips).toHaveLength(20);
    });

    it('preserves number of blips', () => {
      const blips = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
        { x: 15, y: 15 },
      ];
      resolveCollisions(blips);
      expect(blips).toHaveLength(4);
    });
  });
});
