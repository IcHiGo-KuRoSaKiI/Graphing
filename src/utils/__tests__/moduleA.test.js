/**
 * Edge & Arrow System - Module A Tests
 * Tests for foundation layer: Types, Coordinates, and Snap
 */

import {
  EdgeConfig,
  SIDES,
  EDGE_STYLES,
  isValidSide,
  isValidEdgeStyle,
  isValidPoint,
  createDefaultEdge,
  validateEdge,
  modelToView,
  viewToModel,
  snapPoint,
  DEFAULT_GRID_CONFIG,
  distance,
  distanceSquared
} from '../moduleA.js';

describe('Module A - Foundation Layer', () => {
  describe('Types and Constants', () => {
    test('EdgeConfig should have correct values', () => {
      expect(EdgeConfig.JETTY_SIZE).toBe(20);
      expect(EdgeConfig.ORTH_BUFFER).toBe(10);
      expect(EdgeConfig.PARALLEL_SPACING).toBe(8);
      expect(EdgeConfig.SNAP_TOLERANCE).toBe(6);
      expect(EdgeConfig.COLLINEAR_EPS).toBe(0.75);
    });

    test('SIDES should have correct values', () => {
      expect(SIDES.NORTH).toBe('N');
      expect(SIDES.EAST).toBe('E');
      expect(SIDES.SOUTH).toBe('S');
      expect(SIDES.WEST).toBe('W');
    });

    test('EDGE_STYLES should have correct values', () => {
      expect(EDGE_STYLES.ORTHOGONAL).toBe('orthogonal');
      expect(EDGE_STYLES.SEGMENT).toBe('segment');
      expect(EDGE_STYLES.STRAIGHT).toBe('straight');
      expect(EDGE_STYLES.ELBOW).toBe('elbow');
    });
  });

  describe('Type Guards', () => {
    test('isValidSide should work correctly', () => {
      expect(isValidSide('N')).toBe(true);
      expect(isValidSide('E')).toBe(true);
      expect(isValidSide('S')).toBe(true);
      expect(isValidSide('W')).toBe(true);
      expect(isValidSide('X')).toBe(false);
      expect(isValidSide(null)).toBe(false);
    });

    test('isValidEdgeStyle should work correctly', () => {
      expect(isValidEdgeStyle('orthogonal')).toBe(true);
      expect(isValidEdgeStyle('segment')).toBe(true);
      expect(isValidEdgeStyle('straight')).toBe(true);
      expect(isValidEdgeStyle('elbow')).toBe(true);
      expect(isValidEdgeStyle('invalid')).toBe(false);
      expect(isValidEdgeStyle(null)).toBe(false);
    });

    test('isValidPoint should work correctly', () => {
      expect(isValidPoint({ x: 0, y: 0 })).toBe(true);
      expect(isValidPoint({ x: 10.5, y: -20 })).toBe(true);
      expect(isValidPoint({ x: NaN, y: 0 })).toBe(false);
      expect(isValidPoint({ x: 0 })).toBe(false);
      expect(isValidPoint(null)).toBe(false);
    });
  });

  describe('Edge Creation and Validation', () => {
    test('createDefaultEdge should create valid edge', () => {
      const edge = createDefaultEdge('test-1', 'node-A', 'node-B');
      
      expect(edge.id).toBe('test-1');
      expect(edge.source).toBe('node-A');
      expect(edge.target).toBe('node-B');
      expect(edge.style).toBe('orthogonal');
      expect(edge.sourcePort.side).toBe('E');
      expect(edge.targetPort.side).toBe('W');
      expect(edge.waypoints).toEqual([]);
      expect(edge.meta.parallelIndex).toBe(0);
    });

    test('validateEdge should validate correct edge', () => {
      const edge = createDefaultEdge('test-1', 'node-A', 'node-B');
      expect(() => validateEdge(edge)).not.toThrow();
    });

    test('validateEdge should reject invalid edge', () => {
      expect(() => validateEdge(null)).toThrow('Edge must be an object');
      expect(() => validateEdge({})).toThrow('Edge must have a string id');
      expect(() => validateEdge({ id: 'test', source: 'A', target: 'B', style: 'invalid' }))
        .toThrow('Invalid edge style: invalid');
    });
  });

  describe('Coordinate Transforms', () => {
    const transform = { x: 100, y: 200, k: 2 };

    test('modelToView should transform correctly', () => {
      const modelPoint = { x: 10, y: 20 };
      const viewPoint = modelToView(modelPoint, transform);
      
      expect(viewPoint.x).toBe(10 * 2 + 100); // 120
      expect(viewPoint.y).toBe(20 * 2 + 200); // 240
    });

    test('viewToModel should transform correctly', () => {
      const viewPoint = { x: 120, y: 240 };
      const modelPoint = viewToModel(viewPoint, transform);
      
      expect(modelPoint.x).toBe(10);
      expect(modelPoint.y).toBe(20);
    });

    test('transform should be reversible', () => {
      const originalPoint = { x: 15.5, y: 25.7 };
      const viewPoint = modelToView(originalPoint, transform);
      const backToModel = viewToModel(viewPoint, transform);
      
      expect(backToModel.x).toBeCloseTo(originalPoint.x, 5);
      expect(backToModel.y).toBeCloseTo(originalPoint.y, 5);
    });
  });

  describe('Grid Snapping', () => {
    test('snapPoint should snap to grid', () => {
      const point = { x: 23, y: 37 };
      const snapped = snapPoint(point, DEFAULT_GRID_CONFIG);
      
      // Should snap to nearest 20px grid lines
      expect(snapped.x).toBe(20);
      expect(snapped.y).toBe(40);
    });

    test('snapPoint should not snap if too far from grid', () => {
      const point = { x: 35, y: 45 };
      const snapped = snapPoint(point, DEFAULT_GRID_CONFIG);
      
      // 35 is 5px from 40 (grid line), which is within 6px tolerance, so it should snap
      // 45 is 5px from 40 (grid line), which is within 6px tolerance, so it should snap
      expect(snapped.x).toBe(40);
      expect(snapped.y).toBe(40);
    });

    test('snapPoint should handle disabled grid', () => {
      const point = { x: 23, y: 37 };
      const disabledGrid = { ...DEFAULT_GRID_CONFIG, enabled: false };
      const snapped = snapPoint(point, disabledGrid);
      
      expect(snapped.x).toBe(23);
      expect(snapped.y).toBe(37);
    });
  });

  describe('Utility Functions', () => {
    test('distance should calculate correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      
      expect(distance(p1, p2)).toBe(5); // 3-4-5 triangle
    });

    test('distanceSquared should calculate correctly', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      
      expect(distanceSquared(p1, p2)).toBe(25); // 3² + 4² = 25
    });

    test('distanceSquared should be faster than distance', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      
      const start1 = performance.now();
      distance(p1, p2);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      distanceSquared(p1, p2);
      const time2 = performance.now() - start2;
      
      // distanceSquared should be faster (no sqrt)
      expect(time2).toBeLessThan(time1);
    });
  });
});
