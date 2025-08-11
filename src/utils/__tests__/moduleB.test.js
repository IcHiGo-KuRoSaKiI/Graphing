/**
 * Edge & Arrow System - Module B Tests
 * Tests for ports, anchors, and jetty layer
 */

import {
  // Perimeter intersection
  intersectRectPerimeter,
  intersectRoundedRectPerimeter,
  intersectEllipsePerimeter,
  getDirectionFromSide,
  getNormalFromSide,
  isPointInRect,
  isPointInEllipse,
  
  // Anchor point
  anchorPoint,
  getBestSide,
  createDefaultPortForNode,
  validatePortForNode,
  
  // Jetty
  DEFAULT_JETTY_CONFIG,
  jetty,
  jettyWithSize,
  unjetty,
  jettyEdgeEndpoints,
  calculateAdaptiveJettySize,
  createJettyConfig,
  validateJettyConfig
} from '../moduleB.js';

import { SIDES } from '../edgeTypes.js';

describe('Module B - Ports, Anchors, and Jetty', () => {
  describe('Perimeter Intersection', () => {
    const rect = { x: 100, y: 100, width: 200, height: 150 };
    
    test('intersectRectPerimeter should find correct intersection', () => {
      const origin = { x: 50, y: 175 }; // Left of rectangle, at middle height
      const direction = { x: 1, y: 0 }; // Right direction
      const result = intersectRectPerimeter(rect, origin, direction);
      
      expect(result).toBeTruthy();
      expect(result.point.x).toBe(100); // Left edge
      expect(result.point.y).toBe(175);
      expect(result.side).toBe(SIDES.WEST);
    });
    
    test('intersectRectPerimeter should handle upward direction', () => {
      const origin = { x: 200, y: 300 }; // Below rectangle, at middle width
      const direction = { x: 0, y: -1 }; // Up direction
      const result = intersectRectPerimeter(rect, origin, direction);
      
      expect(result).toBeTruthy();
      expect(result.point.x).toBe(200);
      expect(result.point.y).toBe(250); // Bottom edge
      expect(result.side).toBe(SIDES.SOUTH);
    });
    
    test('intersectRectPerimeter should return null for invalid inputs', () => {
      expect(intersectRectPerimeter(null, origin, { x: 1, y: 0 })).toBeNull();
      expect(intersectRectPerimeter(rect, null, { x: 1, y: 0 })).toBeNull();
      expect(intersectRectPerimeter(rect, origin, null)).toBeNull();
    });
  });
  
  describe('Direction and Normal Vectors', () => {
    test('getDirectionFromSide should return correct vectors', () => {
      expect(getDirectionFromSide(SIDES.NORTH)).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromSide(SIDES.EAST)).toEqual({ x: 1, y: 0 });
      expect(getDirectionFromSide(SIDES.SOUTH)).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromSide(SIDES.WEST)).toEqual({ x: -1, y: 0 });
    });
    
    test('getNormalFromSide should return same as direction', () => {
      expect(getNormalFromSide(SIDES.NORTH)).toEqual(getDirectionFromSide(SIDES.NORTH));
      expect(getNormalFromSide(SIDES.EAST)).toEqual(getDirectionFromSide(SIDES.EAST));
    });
  });
  
  describe('Point Containment', () => {
    const rect = { x: 100, y: 100, width: 200, height: 150 };
    const ellipse = { cx: 200, cy: 175, rx: 100, ry: 75 };
    
    test('isPointInRect should work correctly', () => {
      expect(isPointInRect({ x: 150, y: 150 }, rect)).toBe(true);
      expect(isPointInRect({ x: 50, y: 150 }, rect)).toBe(false);
      expect(isPointInRect({ x: 150, y: 50 }, rect)).toBe(false);
    });
    
    test('isPointInEllipse should work correctly', () => {
      expect(isPointInEllipse({ x: 200, y: 175 }, ellipse)).toBe(true); // Center
      expect(isPointInEllipse({ x: 300, y: 175 }, ellipse)).toBe(true); // On edge
      expect(isPointInEllipse({ x: 301, y: 175 }, ellipse)).toBe(false); // Outside
    });
  });
  
  describe('Anchor Point Resolution', () => {
    const node = {
      id: 'test-node',
      position: { x: 100, y: 100 },
      width: 200,
      height: 150,
      shape: 'rect'
    };
    
    test('anchorPoint should resolve side-based port', () => {
      const port = { side: SIDES.EAST, sticky: true, align: 0.5 };
      const result = anchorPoint(node, port);
      
      expect(result).toBeTruthy();
      expect(result.point.x).toBe(300); // Right edge
      expect(result.point.y).toBe(175); // Middle of height
      expect(result.side).toBe(SIDES.EAST);
    });
    
    test('anchorPoint should resolve fixed coordinate port', () => {
      const port = { x: 150, y: 125 };
      const result = anchorPoint(node, port);
      
      expect(result).toBeTruthy();
      expect(result.point.x).toBe(150);
      expect(result.point.y).toBe(125);
    });
    
    test('anchorPoint should auto-resolve port with target', () => {
      const port = {};
      const targetPoint = { x: 400, y: 175 };
      const result = anchorPoint(node, port, targetPoint);
      
      expect(result).toBeTruthy();
      expect(result.side).toBe(SIDES.EAST); // Should choose east for target to the right
    });
    
    test('anchorPoint should return null for invalid inputs', () => {
      expect(anchorPoint(null, { side: SIDES.EAST })).toBeNull();
      expect(anchorPoint(node, null)).toBeNull();
      expect(anchorPoint(node, {})).toBeNull(); // Invalid port
    });
  });
  
  describe('Best Side Detection', () => {
    const node = {
      position: { x: 100, y: 100 },
      width: 200,
      height: 150
    };
    
    test('getBestSide should choose correct side', () => {
      expect(getBestSide(node, { x: 400, y: 175 })).toBe(SIDES.EAST); // Right
      expect(getBestSide(node, { x: 50, y: 175 })).toBe(SIDES.WEST); // Left
      expect(getBestSide(node, { x: 200, y: 50 })).toBe(SIDES.NORTH); // Above
      expect(getBestSide(node, { x: 200, y: 300 })).toBe(SIDES.SOUTH); // Below
    });
  });
  
  describe('Port Validation', () => {
    const node = {
      position: { x: 100, y: 100 },
      width: 200,
      height: 150
    };
    
    test('validatePortForNode should validate correctly', () => {
      expect(validatePortForNode(node, { side: SIDES.EAST })).toBe(true);
      expect(validatePortForNode(node, { x: 150, y: 125 })).toBe(true);
      expect(validatePortForNode(node, { x: 50, y: 125 })).toBe(false); // Outside
      expect(validatePortForNode(node, {})).toBe(false); // Invalid port
    });
  });
  
  describe('Jetty System', () => {
    const point = { x: 100, y: 100 };
    
    test('jetty should apply correct offset', () => {
      const result = jetty(point, SIDES.EAST);
      
      expect(result.x).toBe(120); // 100 + 20 (jetty size)
      expect(result.y).toBe(100);
    });
    
    test('jetty should handle different sides', () => {
      expect(jetty(point, SIDES.NORTH)).toEqual({ x: 100, y: 80 });
      expect(jetty(point, SIDES.SOUTH)).toEqual({ x: 100, y: 120 });
      expect(jetty(point, SIDES.WEST)).toEqual({ x: 80, y: 100 });
    });
    
    test('jetty should respect configuration', () => {
      const config = { size: 10, enabled: true };
      const result = jetty(point, SIDES.EAST, config);
      
      expect(result.x).toBe(110); // 100 + 10
      expect(result.y).toBe(100);
    });
    
    test('jetty should be disabled when configured', () => {
      const config = { size: 20, enabled: false };
      const result = jetty(point, SIDES.EAST, config);
      
      expect(result).toEqual(point); // No change
    });
    
    test('unjetty should reverse jetty offset', () => {
      const jettedPoint = jetty(point, SIDES.EAST);
      const unjettedPoint = unjetty(jettedPoint, SIDES.EAST);
      
      expect(unjettedPoint.x).toBeCloseTo(point.x, 5);
      expect(unjettedPoint.y).toBeCloseTo(point.y, 5);
    });
    
    test('jettyEdgeEndpoints should handle both endpoints', () => {
      const sourcePoint = { x: 100, y: 100 };
      const targetPoint = { x: 300, y: 100 };
      
      const result = jettyEdgeEndpoints(sourcePoint, SIDES.EAST, targetPoint, SIDES.WEST);
      
      expect(result.sourceJetty.x).toBe(120); // 100 + 20
      expect(result.sourceJetty.y).toBe(100);
      expect(result.targetJetty.x).toBe(280); // 300 - 20
      expect(result.targetJetty.y).toBe(100);
    });
    
    test('calculateAdaptiveJettySize should scale based on distance', () => {
      const shortEdge = calculateAdaptiveJettySize({ x: 0, y: 0 }, { x: 50, y: 0 });
      const longEdge = calculateAdaptiveJettySize({ x: 0, y: 0 }, { x: 600, y: 0 });
      
      expect(shortEdge).toBeLessThan(DEFAULT_JETTY_CONFIG.size); // Smaller for short edge
      expect(longEdge).toBeGreaterThan(DEFAULT_JETTY_CONFIG.size); // Larger for long edge
    });
  });
  
  describe('Jetty Configuration', () => {
    test('createJettyConfig should merge options', () => {
      const config = createJettyConfig({ size: 30, enabled: false });
      
      expect(config.size).toBe(30);
      expect(config.enabled).toBe(false);
      expect(config.minSize).toBe(DEFAULT_JETTY_CONFIG.minSize); // Preserved
    });
    
    test('validateJettyConfig should validate correctly', () => {
      expect(validateJettyConfig(DEFAULT_JETTY_CONFIG)).toBe(true);
      expect(validateJettyConfig({ size: 20, enabled: true })).toBe(true);
      expect(validateJettyConfig({ size: -1, enabled: true })).toBe(false);
      expect(validateJettyConfig({ size: 20, enabled: 'invalid' })).toBe(false);
      expect(validateJettyConfig(null)).toBe(false);
    });
  });
  
  describe('Integration Tests', () => {
    const node = {
      id: 'test-node',
      position: { x: 100, y: 100 },
      width: 200,
      height: 150,
      shape: 'rect'
    };
    
    test('Complete port resolution with jetty', () => {
      // 1. Resolve anchor point
      const port = { side: SIDES.EAST, align: 0.5 };
      const anchor = anchorPoint(node, port);
      
      expect(anchor).toBeTruthy();
      expect(anchor.point.x).toBe(300); // Right edge
      expect(anchor.side).toBe(SIDES.EAST);
      
      // 2. Apply jetty
      const jettedPoint = jetty(anchor.point, anchor.side);
      
      expect(jettedPoint.x).toBe(320); // 300 + 20
      expect(jettedPoint.y).toBe(175); // Middle of height
    });
    
    test('Port resolution for different shapes', () => {
      const ellipseNode = {
        ...node,
        shape: 'ellipse'
      };
      
      const port = { side: SIDES.NORTH };
      const result = anchorPoint(ellipseNode, port);
      
      expect(result).toBeTruthy();
      expect(result.side).toBe(SIDES.NORTH);
      // Point should be on ellipse perimeter
      expect(result.point.y).toBeLessThan(node.position.y + node.height / 2);
    });
  });
});
