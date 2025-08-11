import {
  // Route Patterns
  L_PATTERNS,
  S_PATTERNS,
  getLPatterns,
  getSPatterns,
  getAllPatterns,
  isLPattern,
  isSPattern,
  
  // Routing Algorithms
  calculateOrthogonalRoute,
  calculatePatternRoute,
  calculateStraightRoute,
  snapPointToGrid,
  calculateRouteWithObstacles,
  hasCollisions,
  segmentIntersectsRect,
  linesIntersect,
  
  // Routing Pipeline
  routeOrthogonalEdge,
  validateRoutingInputs,
  generateRoutingMetadata,
  calculateRouteDistance,
  updateRoute,
  hasNodesMovedSignificantly,
  optimizeRoute,
  createRoutingContext
} from '../moduleC.js';

import { SIDES } from '../edgeTypes.js';

describe('Module C - Routing Pipeline', () => {
  // Test data
  const mockSourceNode = {
    id: 'source',
    position: { x: 100, y: 100 },
    width: 80,
    height: 60,
    shape: 'rect'
  };

  const mockTargetNode = {
    id: 'target',
    position: { x: 300, y: 200 },
    width: 100,
    height: 80,
    shape: 'rect'
  };

  const mockTransform = {
    x: 0,
    y: 0,
    k: 1
  };

  const mockGridConfig = {
    enabled: true,
    size: 20,
    tolerance: 5
  };

  describe('Route Patterns', () => {
    test('L_PATTERNS should contain patterns for all side combinations', () => {
      expect(L_PATTERNS[SIDES.NORTH]).toBeDefined();
      expect(L_PATTERNS[SIDES.SOUTH]).toBeDefined();
      expect(L_PATTERNS[SIDES.EAST]).toBeDefined();
      expect(L_PATTERNS[SIDES.WEST]).toBeDefined();
    });

    test('S_PATTERNS should contain patterns for same-side connections', () => {
      expect(S_PATTERNS[SIDES.NORTH][SIDES.NORTH]).toBeDefined();
      expect(S_PATTERNS[SIDES.SOUTH][SIDES.SOUTH]).toBeDefined();
      expect(S_PATTERNS[SIDES.EAST][SIDES.EAST]).toBeDefined();
      expect(S_PATTERNS[SIDES.WEST][SIDES.WEST]).toBeDefined();
    });

    test('getLPatterns should return patterns for valid side combinations', () => {
      const patterns = getLPatterns(SIDES.NORTH, SIDES.SOUTH);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].name).toBe('L-NS');
    });

    test('getSPatterns should return patterns for same-side connections', () => {
      const patterns = getSPatterns(SIDES.NORTH, SIDES.NORTH);
      expect(patterns).toHaveLength(1);
      expect(patterns[0].name).toBe('S-NN');
    });

    test('getAllPatterns should return both L and S patterns', () => {
      const patterns = getAllPatterns(SIDES.NORTH, SIDES.SOUTH);
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('isLPattern should correctly identify L patterns', () => {
      const lPattern = { name: 'L-NS' };
      const sPattern = { name: 'S-NN' };
      
      expect(isLPattern(lPattern)).toBe(true);
      expect(isLPattern(sPattern)).toBe(false);
    });

    test('isSPattern should correctly identify S patterns', () => {
      const lPattern = { name: 'L-NS' };
      const sPattern = { name: 'S-NN' };
      
      expect(isSPattern(sPattern)).toBe(true);
      expect(isSPattern(lPattern)).toBe(false);
    });
  });

  describe('Routing Algorithms', () => {
    test('calculateStraightRoute should return simple two-point route', () => {
      const sourcePoint = { x: 0, y: 0 };
      const targetPoint = { x: 100, y: 100 };
      
      const result = calculateStraightRoute(sourcePoint, targetPoint);
      
      expect(result.success).toBe(true);
      expect(result.points).toHaveLength(2);
      expect(result.pattern).toBe('straight');
    });

    test('snapPointToGrid should snap points within tolerance', () => {
      const point = { x: 35, y: 45 };
      const gridConfig = { size: 20, tolerance: 5 };
      
      const snapped = snapPointToGrid(point, gridConfig);
      
      expect(snapped.x).toBe(40);
      expect(snapped.y).toBe(40);
    });

    test('snapPointToGrid should not snap points outside tolerance', () => {
      const point = { x: 35, y: 45 };
      const gridConfig = { size: 20, tolerance: 2 };
      
      const snapped = snapPointToGrid(point, gridConfig);
      
      expect(snapped.x).toBe(35);
      expect(snapped.y).toBe(45);
    });

    test('linesIntersect should detect intersection', () => {
      const line1 = { x1: 0, y1: 0, x2: 10, y2: 10 };
      const line2 = { x1: 0, y1: 10, x2: 10, y2: 0 };
      
      // These lines should intersect at (5, 5)
      expect(linesIntersect(line1, line2)).toBe(true);
    });

    test('linesIntersect should detect intersection with different test data', () => {
      const line1 = { x1: 0, y1: 0, x2: 5, y2: 5 };
      const line2 = { x1: 0, y1: 5, x2: 5, y2: 0 };
      
      expect(linesIntersect(line1, line2)).toBe(true);
    });

    test('linesIntersect should detect intersection with simpler test data', () => {
      const line1 = { x1: 0, y1: 0, x2: 2, y2: 2 };
      const line2 = { x1: 0, y1: 2, x2: 2, y2: 0 };
      
      expect(linesIntersect(line1, line2)).toBe(true);
    });

    test('linesIntersect should not detect intersection for parallel lines', () => {
      const line1 = { x1: 0, y1: 0, x2: 10, y2: 0 };
      const line2 = { x1: 0, y1: 10, x2: 10, y2: 10 };
      
      expect(linesIntersect(line1, line2)).toBe(false);
    });

    test('segmentIntersectsRect should detect intersection', () => {
      const segment = { x1: 0, y1: 0, x2: 10, y2: 10 };
      const rect = { x: 5, y: 5, width: 10, height: 10 };
      
      expect(segmentIntersectsRect(segment, rect)).toBe(true);
    });

    test('hasCollisions should detect route collisions', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ];
      const obstacles = [
        { x: 5, y: 5, width: 10, height: 10 }
      ];
      
      expect(hasCollisions(points, obstacles)).toBe(true);
    });

    test('hasCollisions should not detect collisions when none exist', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ];
      const obstacles = [
        { x: 20, y: 20, width: 10, height: 10 }
      ];
      
      expect(hasCollisions(points, obstacles)).toBe(false);
    });
  });

  describe('Routing Pipeline', () => {
    test('validateRoutingInputs should validate correct inputs', () => {
      const context = {
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode,
        transform: mockTransform
      };
      
      const result = validateRoutingInputs(context);
      expect(result.valid).toBe(true);
    });

    test('validateRoutingInputs should reject invalid inputs', () => {
      const context = {
        sourceNode: null,
        targetNode: mockTargetNode,
        transform: mockTransform
      };
      
      const result = validateRoutingInputs(context);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('calculateRouteDistance should calculate correct distance', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 6, y: 8 }
      ];
      
      const distance = calculateRouteDistance(points);
      expect(distance).toBe(10); // 5 + 5
    });

    test('calculateRouteDistance should return 0 for single point', () => {
      const points = [{ x: 0, y: 0 }];
      const distance = calculateRouteDistance(points);
      expect(distance).toBe(0);
    });

    test('generateRoutingMetadata should create valid metadata', () => {
      const context = {
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode,
        obstacles: [],
        avoidObstacles: true
      };
      
      const routeResult = {
        pattern: 'L-NS',
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      };
      
      const modelPoints = [{ x: 0, y: 0 }, { x: 10, y: 10 }];
      
      const metadata = generateRoutingMetadata(context, routeResult, modelPoints);
      
      expect(metadata.totalDistance).toBeGreaterThan(0);
      expect(metadata.segmentCount).toBe(1);
      expect(metadata.pattern).toBe('L-NS');
      expect(metadata.obstacleCount).toBe(0);
      expect(metadata.obstacleAvoidance).toBe(true);
      expect(metadata.timestamp).toBeDefined();
    });

    test('hasNodesMovedSignificantly should detect significant movement', () => {
      const route = {
        success: true,
        modelPoints: [
          { x: 100, y: 100 },
          { x: 300, y: 200 }
        ]
      };
      
      const movedSourceNode = { position: { x: 120, y: 100 } };
      const movedTargetNode = { position: { x: 300, y: 200 } };
      
      const context = { gridConfig: { tolerance: 5 } };
      
      expect(hasNodesMovedSignificantly(route, movedSourceNode, movedTargetNode, context)).toBe(true);
    });

    test('hasNodesMovedSignificantly should not detect insignificant movement', () => {
      const route = {
        success: true,
        modelPoints: [
          { x: 100, y: 100 },
          { x: 300, y: 200 }
        ]
      };
      
      const movedSourceNode = { position: { x: 102, y: 100 } };
      const movedTargetNode = { position: { x: 300, y: 200 } };
      
      const context = { gridConfig: { tolerance: 5 } };
      
      expect(hasNodesMovedSignificantly(route, movedSourceNode, movedTargetNode, context)).toBe(false);
    });

    test('optimizeRoute should remove redundant points', () => {
      const route = {
        success: true,
        modelPoints: [
          { x: 0, y: 0 },
          { x: 5, y: 5 },
          { x: 10, y: 10 }
        ],
        viewPoints: [
          { x: 0, y: 0 },
          { x: 5, y: 5 },
          { x: 10, y: 10 }
        ],
        metadata: {}
      };
      
      const context = {
        transform: mockTransform,
        gridConfig: { size: 20 }
      };
      
      const optimized = optimizeRoute(route, context);
      
      expect(optimized.modelPoints.length).toBeLessThan(route.modelPoints.length);
      expect(optimized.metadata.optimized).toBe(true);
    });

    test('createRoutingContext should create valid context', () => {
      const context = createRoutingContext(
        mockSourceNode,
        mockTargetNode,
        mockTransform,
        {
          sourcePort: { side: SIDES.NORTH },
          targetPort: { side: SIDES.SOUTH },
          gridConfig: mockGridConfig,
          obstacles: [],
          avoidObstacles: true
        }
      );
      
      expect(context.sourceNode).toBe(mockSourceNode);
      expect(context.targetNode).toBe(mockTargetNode);
      expect(context.transform).toBe(mockTransform);
      expect(context.sourcePort.side).toBe(SIDES.NORTH);
      expect(context.targetPort.side).toBe(SIDES.SOUTH);
      expect(context.gridConfig).toBe(mockGridConfig);
      expect(context.obstacles).toEqual([]);
      expect(context.avoidObstacles).toBe(true);
    });

    test('routeOrthogonalEdge should return valid route result', () => {
      const context = createRoutingContext(
        mockSourceNode,
        mockTargetNode,
        mockTransform,
        {
          sourcePort: { side: SIDES.NORTH },
          targetPort: { side: SIDES.SOUTH },
          gridConfig: mockGridConfig
        }
      );
      
      const result = routeOrthogonalEdge(context);
      
      expect(result.success).toBe(true);
      expect(result.modelPoints.length).toBeGreaterThan(0);
      expect(result.viewPoints.length).toBeGreaterThan(0);
      expect(result.pattern).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('routeOrthogonalEdge should handle invalid inputs gracefully', () => {
      const context = createRoutingContext(
        null, // Invalid source node
        mockTargetNode,
        mockTransform
      );
      
      const result = routeOrthogonalEdge(context);
      
      expect(result.success).toBe(false);
      expect(result.modelPoints).toEqual([]);
      expect(result.viewPoints).toEqual([]);
      expect(result.metadata.error).toBeDefined();
    });

    test('updateRoute should update route when nodes move significantly', () => {
      const originalRoute = {
        success: true,
        modelPoints: [
          { x: 100, y: 100 },
          { x: 300, y: 200 }
        ],
        viewPoints: [
          { x: 100, y: 100 },
          { x: 300, y: 200 }
        ],
        pattern: 'L-NS',
        sides: [SIDES.NORTH, SIDES.SOUTH],
        metadata: {}
      };
      
      const movedSourceNode = { 
        ...mockSourceNode, 
        position: { x: 150, y: 150 } 
      };
      const movedTargetNode = { 
        ...mockTargetNode, 
        position: { x: 350, y: 250 } 
      };
      
      const context = createRoutingContext(
        movedSourceNode,
        movedTargetNode,
        mockTransform,
        { gridConfig: mockGridConfig }
      );
      
      const updatedRoute = updateRoute(originalRoute, movedSourceNode, movedTargetNode, context);
      
      expect(updatedRoute.success).toBe(true);
      expect(updatedRoute.modelPoints.length).toBeGreaterThan(0);
    });
  });
});
