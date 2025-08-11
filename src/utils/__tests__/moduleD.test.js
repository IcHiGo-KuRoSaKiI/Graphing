/**
 * Module D Tests - Handlers & Editing
 */

import { 
  getEdgeHandler, 
  getHitTestPriority, 
  createHandlerContext 
} from '../edgeHandlers.js';
import { EDGE_STYLES } from '../edgeTypes.js';

// Mock React Flow context
const mockSetEdges = jest.fn();
const mockUpdateEdge = jest.fn();

// Mock nodes
const mockSourceNode = {
  id: 'source-1',
  position: { x: 100, y: 100 },
  width: 150,
  height: 60,
  shape: 'rectangle'
};

const mockTargetNode = {
  id: 'target-1',
  position: { x: 300, y: 200 },
  width: 150,
  height: 60,
  shape: 'rectangle'
};

const mockNodes = [mockSourceNode, mockTargetNode];

// Mock edge
const mockEdge = {
  id: 'edge-1',
  source: 'source-1',
  target: 'target-1',
  data: {
    waypoints: [
      { x: 175, y: 130 },
      { x: 225, y: 130 },
      { x: 225, y: 230 }
    ],
    sourcePort: { side: 'E' },
    targetPort: { side: 'W' }
  }
};

// Mock context
const mockContext = {
  edgeId: 'edge-1',
  edge: mockEdge,
  nodes: mockNodes,
  transform: { x: 0, y: 0, k: 1 },
  gridConfig: { size: 20, tolerance: 5, enabled: true },
  updateEdge: mockUpdateEdge,
  setEdges: mockSetEdges
};

describe('Module D - Edge Handlers & Editing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEdgeHandler', () => {
    test('should create SegmentHandler for orthogonal edges', () => {
      const handler = getEdgeHandler(EDGE_STYLES.ORTHOGONAL, mockContext);
      expect(handler).toBeDefined();
      expect(handler.getHitTestPriority()).toBe(3);
    });

    test('should create SegmentHandler for segment edges', () => {
      const handler = getEdgeHandler(EDGE_STYLES.SEGMENT, mockContext);
      expect(handler).toBeDefined();
      expect(handler.getHitTestPriority()).toBe(3);
    });

    test('should create ElbowHandler for elbow edges', () => {
      const handler = getEdgeHandler(EDGE_STYLES.ELBOW, mockContext);
      expect(handler).toBeDefined();
      expect(handler.getHitTestPriority()).toBe(2);
    });

    test('should create EdgeHandler for straight edges', () => {
      const handler = getEdgeHandler(EDGE_STYLES.STRAIGHT, mockContext);
      expect(handler).toBeDefined();
      expect(handler.getHitTestPriority()).toBe(1);
    });

    test('should create EdgeHandler for unknown edge styles', () => {
      const handler = getEdgeHandler('unknown', mockContext);
      expect(handler).toBeDefined();
      expect(handler.getHitTestPriority()).toBe(1);
    });
  });

  describe('getHitTestPriority', () => {
    test('should return correct priorities for different element types', () => {
      expect(getHitTestPriority('terminal')).toBe(5);
      expect(getHitTestPriority('waypoint')).toBe(4);
      expect(getHitTestPriority('segment')).toBe(3);
      expect(getHitTestPriority('virtual')).toBe(2);
      expect(getHitTestPriority('label')).toBe(1);
    });

    test('should return 0 for unknown element types', () => {
      expect(getHitTestPriority('unknown')).toBe(0);
    });
  });

  describe('createHandlerContext', () => {
    test('should create valid handler context', () => {
      const context = createHandlerContext(
        mockEdge,
        mockNodes,
        { x: 0, y: 0, k: 1 },
        { size: 20, tolerance: 5, enabled: true },
        mockUpdateEdge,
        mockSetEdges
      );

      expect(context).toEqual({
        edgeId: 'edge-1',
        edge: mockEdge,
        nodes: mockNodes,
        transform: { x: 0, y: 0, k: 1 },
        gridConfig: { size: 20, tolerance: 5, enabled: true },
        updateEdge: mockUpdateEdge,
        setEdges: mockSetEdges
      });
    });
  });

  describe('BaseEdgeHandler', () => {
    let handler;

    beforeEach(() => {
      handler = getEdgeHandler(EDGE_STYLES.ORTHOGONAL, mockContext);
    });

    test('should validate orthogonality correctly', () => {
      const orthogonalPoints = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ];
      expect(handler.validateOrthogonality(orthogonalPoints)).toBe(true);

      const nonOrthogonalPoints = [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 100, y: 100 }
      ];
      expect(handler.validateOrthogonality(nonOrthogonalPoints)).toBe(false);
    });

    test('should validate minimum segment length', () => {
      const longSegments = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 }
      ];
      expect(handler.validateMinSegmentLength(longSegments, 30)).toBe(true);

      const shortSegments = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ];
      expect(handler.validateMinSegmentLength(shortSegments, 30)).toBe(false);
    });

    test('should snap points to grid', () => {
      const points = [
        { x: 23, y: 37 },
        { x: 66, y: 84 }
      ];
      const gridConfig = { size: 20, tolerance: 6, enabled: true };
      
      const snapped = handler.snapPointsToGrid(points, gridConfig);
      expect(snapped[0].x).toBe(20);
      expect(snapped[0].y).toBe(40);
      expect(snapped[1].x).toBe(60);
      expect(snapped[1].y).toBe(80);
    });

    test('should create routing context', () => {
      const routingContext = handler.createRoutingContext(
        mockSourceNode,
        mockTargetNode,
        { x: 0, y: 0, k: 1 },
        { size: 20, tolerance: 5, enabled: true }
      );

      expect(routingContext).toEqual({
        sourceNode: mockSourceNode,
        targetNode: mockTargetNode,
        sourcePort: { side: 'E' },
        targetPort: { side: 'W' },
        transform: { x: 0, y: 0, k: 1 },
        gridConfig: { size: 20, tolerance: 5, enabled: true },
        obstacles: [],
        avoidObstacles: true
      });
    });

    test('should update edge route', () => {
      const newPoints = [
        { x: 175, y: 130 },
        { x: 225, y: 130 }
      ];
      const metadata = { lastEdit: 'test' };

      handler.updateEdgeRoute(newPoints, metadata);

      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the setEdges function
      const setEdgesCallback = mockSetEdges.mock.calls[0][0];
      const mockEdges = [mockEdge];
      const result = setEdgesCallback(mockEdges);
      
      expect(result[0].data.waypoints).toEqual(newPoints);
      expect(result[0].data.lastEdit).toBe('test');
    });
  });

  describe('SegmentHandler', () => {
    let handler;

    beforeEach(() => {
      handler = getEdgeHandler(EDGE_STYLES.ORTHOGONAL, mockContext);
    });

    test('should handle mouse down correctly', () => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      handler.onMouseDown(mockEvent, 0);

      expect(handler.isDragging).toBe(true);
      expect(handler.draggedSegmentIndex).toBe(0);
      expect(handler.dragStartPoint).toEqual({ x: 100, y: 100 });
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    test('should handle mouse move with axis lock', () => {
      // Setup dragging state
      handler.isDragging = true;
      handler.draggedSegmentIndex = 0;
      handler.dragStartPoint = { x: 100, y: 100 };
      handler.axisLock = 'horizontal';

      const mockEvent = {
        clientX: 150,
        clientY: 150
      };

      handler.onMouseMove(mockEvent);

      // Should only move horizontally due to axis lock
      expect(handler.livePreview).toBeDefined();
    });

    test('should handle mouse up correctly', () => {
      // Setup dragging state
      handler.isDragging = true;
      handler.draggedSegmentIndex = 0;
      handler.livePreview = [{ x: 175, y: 130 }];

      handler.onMouseUp();

      expect(handler.isDragging).toBe(false);
      expect(handler.draggedSegmentIndex).toBe(null);
      expect(handler.axisLock).toBe(null);
      expect(handler.livePreview).toBe(null);
    });

    test('should handle double click to remove waypoint', () => {
      const mockEvent = {};
      // Create waypoints that will remain orthogonal after removal
      const orthogonalWaypoints = [
        { x: 175, y: 130 },
        { x: 225, y: 130 },
        { x: 225, y: 230 }
      ];
      
      // Temporarily replace waypoints with orthogonal ones
      const originalWaypoints = mockEdge.data.waypoints;
      mockEdge.data.waypoints = orthogonalWaypoints;

      // Remove the first waypoint (index 0) which should leave us with a valid path
      handler.onDoubleClick(mockEvent, 0);

      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the setEdges function
      const setEdgesCallback = mockSetEdges.mock.calls[0][0];
      const mockEdges = [mockEdge];
      const result = setEdgesCallback(mockEdges);
      
      // Should have one less waypoint
      expect(result[0].data.waypoints).toHaveLength(orthogonalWaypoints.length - 1);
      expect(result[0].data.lastEdit).toBe('waypoint_removed');
      
      // Restore original waypoints
      mockEdge.data.waypoints = originalWaypoints;
    });

    test('should render handles when selected or hovered', () => {
      const waypoints = [
        { x: 175, y: 130 },
        { x: 225, y: 130 }
      ];

      // Test when selected
      const selectedHandles = handler.renderHandles(waypoints, true, false);
      expect(selectedHandles).toBeDefined();

      // Test when hovered
      const hoveredHandles = handler.renderHandles(waypoints, false, true);
      expect(hoveredHandles).toBeDefined();

      // Test when neither selected nor hovered
      const noHandles = handler.renderHandles(waypoints, false, false);
      expect(noHandles).toBe(null);
    });
  });

  describe('ElbowHandler', () => {
    let handler;

    beforeEach(() => {
      handler = getEdgeHandler(EDGE_STYLES.ELBOW, mockContext);
    });

    test('should have correct hit test priority', () => {
      expect(handler.getHitTestPriority()).toBe(2);
    });

    test('should handle waypoint dragging', () => {
      const mockEvent = {
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      handler.onMouseDown(mockEvent, 0);
      expect(handler.draggedWaypointIndex).toBe(0);
    });

    test('should render elbow handles', () => {
      const waypoints = [{ x: 175, y: 130 }];
      const handles = handler.renderHandles(waypoints, true, false);
      expect(handles).toBeDefined();
    });
  });

  describe('EdgeHandler', () => {
    let handler;

    beforeEach(() => {
      handler = getEdgeHandler(EDGE_STYLES.STRAIGHT, mockContext);
    });

    test('should have lowest hit test priority', () => {
      expect(handler.getHitTestPriority()).toBe(1);
    });

    test('should not render handles for straight edges', () => {
      const handles = handler.renderHandles([], true, false);
      expect(handles).toBe(null);
    });

    test('should convert to orthogonal on double click', () => {
      const mockEvent = {};
      handler.onDoubleClick(mockEvent);
      
      // Should attempt to convert to orthogonal
      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
