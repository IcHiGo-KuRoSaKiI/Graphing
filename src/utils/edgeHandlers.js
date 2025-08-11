// Module D - Edge Handlers & Editing
import { EDGE_STYLES } from './edgeTypes.js';
import { routeOrthogonalEdge } from './routingPipeline.js';
import { snapPoint } from './gridSnapping.js';
import { modelToView, viewToModel } from './coordinateTransforms.js';

/**
 * @typedef {Object} EdgeHandlerContext
 * @property {string} edgeId - Edge identifier
 * @property {Object} edge - Edge data
 * @property {Array<Object>} nodes - All nodes in the diagram
 * @property {Object} transform - Current view transform
 * @property {Object} gridConfig - Grid configuration
 * @property {Function} updateEdge - Function to update edge data
 * @property {Function} setEdges - Function to update all edges
 */

/**
 * @typedef {Object} EdgeHandler
 * @property {Function} onMouseDown - Handle mouse down events
 * @property {Function} onMouseMove - Handle mouse move events
 * @property {Function} onMouseUp - Handle mouse up events
 * @property {Function} onDoubleClick - Handle double click events
 * @property {Function} getHitTestPriority - Get hit test priority
 * @property {Function} renderHandles - Render interactive handles
 */

/**
 * Base handler class with common functionality
 */
class BaseEdgeHandler {
  constructor(context) {
    this.context = context;
    this.isDragging = false;
    this.dragStartPoint = null;
    this.originalEdgeData = null;
    this.livePreview = null;
  }

  /**
   * Get hit test priority for this handler
   */
  getHitTestPriority() {
    return 1; // Default priority
  }

  /**
   * Validate orthogonality constraint
   */
  validateOrthogonality(points) {
    if (points.length < 2) return true;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const isHorizontal = Math.abs(prev.y - curr.y) < 5;
      const isVertical = Math.abs(prev.x - curr.x) < 5;
      
      if (!isHorizontal && !isVertical) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate minimum segment length
   */
  validateMinSegmentLength(points, minLength = 30) {
    if (points.length < 2) return true;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const length = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      
      if (length < minLength) {
        return false;
      }
    }
    return true;
  }

  /**
   * Apply grid snapping to points
   */
  snapPointsToGrid(points, gridConfig) {
    return points.map(point => snapPoint(point, gridConfig));
  }

  /**
   * Create routing context for edge updates
   */
  createRoutingContext(sourceNode, targetNode, transform, gridConfig) {
    return {
      sourceNode,
      targetNode,
      sourcePort: this.context.edge.data?.sourcePort,
      targetPort: this.context.edge.data?.targetPort,
      transform,
      gridConfig,
      obstacles: this.context.nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id),
      avoidObstacles: true
    };
  }

  /**
   * Update edge with new route
   */
  updateEdgeRoute(newPoints, metadata = {}) {
    const { edgeId, updateEdge, setEdges } = this.context;
    
    setEdges(edges => 
      edges.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: newPoints,
              lastUpdated: Date.now(),
              ...metadata
            }
          };
        }
        return edge;
      })
    );
  }
}

/**
 * Segment Handler - For orthogonal edges with multiple segments
 * Allows dragging individual segments while maintaining orthogonality
 */
class SegmentHandler extends BaseEdgeHandler {
  constructor(context) {
    super(context);
    this.draggedSegmentIndex = null;
    this.axisLock = null; // 'horizontal' or 'vertical'
  }

  getHitTestPriority() {
    return 3; // High priority for segment handles
  }

  onMouseDown(event, segmentIndex) {
    this.isDragging = true;
    this.draggedSegmentIndex = segmentIndex;
    this.dragStartPoint = { x: event.clientX, y: event.clientY };
    
    // Store original edge data for undo
    this.originalEdgeData = { ...this.context.edge.data };
    
    // Determine axis lock based on segment orientation
    const waypoints = this.context.edge.data?.waypoints || [];
    if (segmentIndex < waypoints.length - 1) {
      const p1 = waypoints[segmentIndex];
      const p2 = waypoints[segmentIndex + 1];
      this.axisLock = Math.abs(p1.y - p2.y) < 5 ? 'horizontal' : 'vertical';
    }
    
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove(event) {
    if (!this.isDragging || this.draggedSegmentIndex === null) return;

    const deltaX = event.clientX - this.dragStartPoint.x;
    const deltaY = event.clientY - this.dragStartPoint.y;
    
    // Apply axis lock
    let adjustedDeltaX = deltaX;
    let adjustedDeltaY = deltaY;
    
    if (this.axisLock === 'horizontal') {
      adjustedDeltaY = 0;
    } else if (this.axisLock === 'vertical') {
      adjustedDeltaX = 0;
    }

    // Transform screen coordinates to model coordinates
    const transform = this.context.transform;
    const modelDelta = viewToModel({ x: adjustedDeltaX, y: adjustedDeltaY }, transform);
    
    // Update waypoints with live preview
    const waypoints = [...(this.context.edge.data?.waypoints || [])];
    const segmentIndex = this.draggedSegmentIndex;
    
    if (segmentIndex < waypoints.length) {
      waypoints[segmentIndex] = {
        x: waypoints[segmentIndex].x + modelDelta.x,
        y: waypoints[segmentIndex].y + modelDelta.y
      };
    }
    
    // Apply constraints
    if (this.validateOrthogonality(waypoints) && this.validateMinSegmentLength(waypoints)) {
      const snappedWaypoints = this.snapPointsToGrid(waypoints, this.context.gridConfig);
      this.livePreview = snappedWaypoints;
      
      // Update edge with live preview
      this.updateEdgeRoute(snappedWaypoints, { 
        isLivePreview: true,
        draggedSegment: segmentIndex 
      });
    }
  }

  onMouseUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.draggedSegmentIndex = null;
    this.axisLock = null;
    
    // Commit the final route
    if (this.livePreview) {
      this.updateEdgeRoute(this.livePreview, { 
        isLivePreview: false,
        lastEdit: 'segment_drag'
      });
      this.livePreview = null;
    }
    
    this.dragStartPoint = null;
    this.originalEdgeData = null;
  }

  onDoubleClick(event, segmentIndex) {
    // Remove waypoint on double click
    const waypoints = [...(this.context.edge.data?.waypoints || [])];
    
    if (segmentIndex >= 0 && segmentIndex < waypoints.length) {
      waypoints.splice(segmentIndex, 1);
      
      // Validate and update
      if (this.validateOrthogonality(waypoints) && this.validateMinSegmentLength(waypoints)) {
        const snappedWaypoints = this.snapPointsToGrid(waypoints, this.context.gridConfig);
        this.updateEdgeRoute(snappedWaypoints, { 
          lastEdit: 'waypoint_removed',
          removedIndex: segmentIndex 
        });
      }
    }
  }

  renderHandles(waypoints, isSelected, isHovered) {
    if (!isSelected && !isHovered) return null;
    
    return waypoints.map((waypoint, index) => (
      <g key={`segment-handle-${index}`}>
        {/* Invisible hit area */}
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={8}
          fill="transparent"
          style={{ cursor: 'move' }}
          onMouseDown={(e) => this.onMouseDown(e, index)}
          onDoubleClick={(e) => this.onDoubleClick(e, index)}
        />
        
        {/* Visual handle */}
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={isHovered ? 6 : 4}
          fill="rgb(59, 130, 246)"
          stroke="white"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Center dot */}
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={2}
          fill="white"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    ));
  }
}

/**
 * Elbow Handler - For single-bend orthogonal edges
 * Maintains L-shape routing with single waypoint
 */
class ElbowHandler extends BaseEdgeHandler {
  constructor(context) {
    super(context);
    this.draggedWaypointIndex = null;
  }

  getHitTestPriority() {
    return 2; // Medium priority
  }

  onMouseDown(event, waypointIndex) {
    this.isDragging = true;
    this.draggedWaypointIndex = waypointIndex;
    this.dragStartPoint = { x: event.clientX, y: event.clientY };
    this.originalEdgeData = { ...this.context.edge.data };
    
    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove(event) {
    if (!this.isDragging || this.draggedWaypointIndex === null) return;

    const deltaX = event.clientX - this.dragStartPoint.x;
    const deltaY = event.clientY - this.dragStartPoint.y;
    
    const transform = this.context.transform;
    const modelDelta = viewToModel({ x: deltaX, y: deltaY }, transform);
    
    const waypoints = [...(this.context.edge.data?.waypoints || [])];
    const waypointIndex = this.draggedWaypointIndex;
    
    if (waypointIndex < waypoints.length) {
      waypoints[waypointIndex] = {
        x: waypoints[waypointIndex].x + modelDelta.x,
        y: waypoints[waypointIndex].y + modelDelta.y
      };
      
      // Ensure L-shape constraint
      const sourceNode = this.context.nodes.find(n => n.id === this.context.edge.source);
      const targetNode = this.context.nodes.find(n => n.id === this.context.edge.target);
      
      if (sourceNode && targetNode) {
        const routingContext = this.createRoutingContext(sourceNode, targetNode, transform, this.context.gridConfig);
        const routeResult = routeOrthogonalEdge(routingContext);
        
        if (routeResult.success) {
          this.livePreview = routeResult.modelPoints;
          this.updateEdgeRoute(routeResult.modelPoints, { 
            isLivePreview: true,
            draggedWaypoint: waypointIndex 
          });
        }
      }
    }
  }

  onMouseUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.draggedWaypointIndex = null;
    
    if (this.livePreview) {
      this.updateEdgeRoute(this.livePreview, { 
        isLivePreview: false,
        lastEdit: 'elbow_drag'
      });
      this.livePreview = null;
    }
    
    this.dragStartPoint = null;
    this.originalEdgeData = null;
  }

  onDoubleClick(event, waypointIndex) {
    // Remove waypoint and recalculate route
    const sourceNode = this.context.nodes.find(n => n.id === this.context.edge.source);
    const targetNode = this.context.nodes.find(n => n.id === this.context.edge.target);
    
    if (sourceNode && targetNode) {
      const routingContext = this.createRoutingContext(sourceNode, targetNode, this.context.transform, this.context.gridConfig);
      const routeResult = routeOrthogonalEdge(routingContext);
      
      if (routeResult.success) {
        this.updateEdgeRoute(routeResult.modelPoints, { 
          lastEdit: 'waypoint_removed',
          removedIndex: waypointIndex 
        });
      }
    }
  }

  renderHandles(waypoints, isSelected, isHovered) {
    if (!isSelected && !isHovered) return null;
    
    return waypoints.map((waypoint, index) => (
      <g key={`elbow-handle-${index}`}>
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={10}
          fill="transparent"
          style={{ cursor: 'move' }}
          onMouseDown={(e) => this.onMouseDown(e, index)}
          onDoubleClick={(e) => this.onDoubleClick(e, index)}
        />
        
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={isHovered ? 7 : 5}
          fill="rgb(34, 197, 94)"
          stroke="white"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
        
        <circle
          cx={waypoint.x}
          cy={waypoint.y}
          r={3}
          fill="white"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    ));
  }
}

/**
 * Edge Handler - For straight edges
 * Simple point-to-point routing
 */
class EdgeHandler extends BaseEdgeHandler {
  constructor(context) {
    super(context);
  }

  getHitTestPriority() {
    return 1; // Lowest priority
  }

  onMouseDown(event) {
    // Straight edges don't have waypoints to drag
    return;
  }

  onMouseMove(event) {
    // No dragging for straight edges
    return;
  }

  onMouseUp() {
    // No dragging for straight edges
    return;
  }

  onDoubleClick(event) {
    // Convert to orthogonal edge on double click
    const sourceNode = this.context.nodes.find(n => n.id === this.context.edge.source);
    const targetNode = this.context.nodes.find(n => n.id === this.context.edge.target);
    
    if (sourceNode && targetNode) {
      const routingContext = this.createRoutingContext(sourceNode, targetNode, this.context.transform, this.context.gridConfig);
      const routeResult = routeOrthogonalEdge(routingContext);
      
      if (routeResult.success) {
        this.updateEdgeRoute(routeResult.modelPoints, { 
          lastEdit: 'converted_to_orthogonal',
          style: EDGE_STYLES.ORTHOGONAL 
        });
      }
    }
  }

  renderHandles(waypoints, isSelected, isHovered) {
    // Straight edges don't have handles
    return null;
  }
}

/**
 * Handler factory - creates appropriate handler based on edge style
 */
export function getEdgeHandler(edgeStyle, context) {
  switch (edgeStyle) {
    case EDGE_STYLES.ORTHOGONAL:
    case EDGE_STYLES.SEGMENT:
      return new SegmentHandler(context);
    
    case EDGE_STYLES.ELBOW:
      return new ElbowHandler(context);
    
    case EDGE_STYLES.STRAIGHT:
    default:
      return new EdgeHandler(context);
  }
}

/**
 * Get hit test priority for edge elements
 * Higher numbers = higher priority
 */
export function getHitTestPriority(elementType) {
  const priorities = {
    'terminal': 5,      // Connection points
    'waypoint': 4,      // Waypoint handles
    'segment': 3,       // Segment handles
    'virtual': 2,       // Virtual handles
    'label': 1          // Edge labels
  };
  
  return priorities[elementType] || 0;
}

/**
 * Create handler context from React Flow props
 */
export function createHandlerContext(edge, nodes, transform, gridConfig, updateEdge, setEdges) {
  return {
    edgeId: edge.id,
    edge,
    nodes,
    transform,
    gridConfig,
    updateEdge,
    setEdges
  };
}
