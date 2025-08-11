/**
 * Optimized Orthogonal Edge - Draw.io Style Implementation
 * 
 * Features:
 * ✅ Uses our new routing infrastructure (Modules A, B, C)
 * ✅ Handler-based editing system (Module D)
 * ✅ Performance optimized with caching and debouncing
 * ✅ Draw.io-style connection points and jetty system
 * ✅ Virtual handles for segment dragging
 * ✅ Collision avoidance and route optimization
 * ✅ Grid snapping and orthogonal constraints
 * ✅ Live preview during editing
 */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { routeOrthogonalEdge } from '../../utils/routingPipeline.js';
import { getEdgeHandler, createHandlerContext } from '../../utils/edgeHandlers.js';
import { EDGE_STYLES } from '../../utils/edgeTypes.js';
import { DEFAULT_GRID_CONFIG } from '../../utils/gridSnapping.js';
import { modelToView, viewToModel } from '../../utils/coordinateTransforms.js';
import { anchorPoint } from '../../utils/anchorPoint.js';
import { jettyEdgeEndpoints } from '../../utils/jetty.js';

// Performance optimization constants
const DEBOUNCE_DELAY = 100;
const CACHE_EXPIRY = 30000; // 30 seconds
const MIN_SEGMENT_LENGTH = 30;

const OptimizedOrthogonalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  data,
  selected,
}) => {
  const { 
    screenToFlowPosition, 
    setEdges, 
    getEdges, 
    getNodes,
    getViewport 
  } = useReactFlow();

  // State management
  const [hoveredElement, setHoveredElement] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [routeCache, setRouteCache] = useState(new Map());
  const [lastRouteUpdate, setLastRouteUpdate] = useState(0);

  // Refs for performance optimization
  const debounceTimeoutRef = useRef(null);
  const handlerRef = useRef(null);
  const lastNodesRef = useRef(null);

  // Get current nodes and viewport
  const nodes = getNodes();
  const viewport = getViewport();
  const transform = { x: viewport.x, y: viewport.y, k: viewport.zoom };

  // Grid configuration
  const gridConfig = useMemo(() => ({
    ...DEFAULT_GRID_CONFIG,
    tolerance: DEFAULT_GRID_CONFIG.tolerance * viewport.zoom
  }), [viewport.zoom]);

  // Get source and target nodes
  const sourceNode = useMemo(() => 
    nodes.find(n => n.id === data?.source), [nodes, data?.source]
  );
  const targetNode = useMemo(() => 
    nodes.find(n => n.id === data?.target), [nodes, data?.target]
  );

  // Determine edge style
  const edgeStyle = useMemo(() => 
    data?.style || EDGE_STYLES.ORTHOGONAL, [data?.style]
  );

  // Create handler context
  const handlerContext = useMemo(() => 
    createHandlerContext(
      { id, sourceX, sourceY, targetX, targetY, data, selected },
      nodes,
      transform,
      gridConfig,
      () => {}, // updateEdge function
      setEdges
    ), [id, sourceX, sourceY, targetX, targetY, data, selected, nodes, transform, gridConfig, setEdges]
  );

  // Initialize handler
  useEffect(() => {
    handlerRef.current = getEdgeHandler(edgeStyle, handlerContext);
  }, [edgeStyle, handlerContext]);

  // Calculate route using our optimized infrastructure
  const calculateRoute = useCallback(async () => {
    if (!sourceNode || !targetNode) return null;

    // Check cache first
    const cacheKey = `${sourceNode.id}-${targetNode.id}-${sourceNode.position.x}-${sourceNode.position.y}-${targetNode.position.x}-${targetNode.position.y}`;
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.route;
    }

    setIsProcessing(true);

    try {
      // Use our routing pipeline
      const routingContext = {
        sourceNode,
        targetNode,
        sourcePort: data?.sourcePort,
        targetPort: data?.targetPort,
        transform,
        gridConfig,
        obstacles: nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id),
        avoidObstacles: true
      };

      const routeResult = routeOrthogonalEdge(routingContext);

      if (routeResult.success) {
        // Cache the result
        setRouteCache(prev => new Map(prev).set(cacheKey, {
          route: routeResult,
          timestamp: Date.now()
        }));

        return routeResult;
      }
    } catch (error) {
      console.warn('Route calculation failed:', error);
    } finally {
      setIsProcessing(false);
    }

    return null;
  }, [sourceNode, targetNode, data?.sourcePort, data?.targetPort, transform, gridConfig, nodes, routeCache]);

  // Debounced route update
  const updateRoute = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      const routeResult = await calculateRoute();
      if (routeResult) {
        setLastRouteUpdate(Date.now());
        
        // Update edge data with new route
        setEdges(edges => 
          edges.map(edge => {
            if (edge.id === id) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  waypoints: routeResult.modelPoints,
                  lastRouteUpdate: Date.now(),
                  routeMetadata: routeResult.metadata
                }
              };
            }
            return edge;
          })
        );
      }
    }, DEBOUNCE_DELAY);
  }, [calculateRoute, id, setEdges]);

  // Check if nodes have moved significantly
  const checkNodeMovement = useCallback(() => {
    if (!lastNodesRef.current) {
      lastNodesRef.current = nodes;
      return false;
    }

    const hasMoved = nodes.some(node => {
      const lastNode = lastNodesRef.current.find(n => n.id === node.id);
      if (!lastNode) return true;
      
      const dx = Math.abs(node.position.x - lastNode.position.x);
      const dy = Math.abs(node.position.y - lastNode.position.y);
      return dx > 5 || dy > 5;
    });

    lastNodesRef.current = nodes;
    return hasMoved;
  }, [nodes]);

  // Update route when nodes move
  useEffect(() => {
    if (checkNodeMovement()) {
      updateRoute();
    }
  }, [nodes, checkNodeMovement, updateRoute]);

  // Get current waypoints (from data or calculated)
  const waypoints = useMemo(() => {
    return data?.waypoints || [];
  }, [data?.waypoints]);

  // Calculate connection points with jetty
  const connectionPoints = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return {
        sourcePoint: { x: sourceX, y: sourceY },
        targetPoint: { x: targetX, y: targetY }
      };
    }

    // Get anchor points
    const sourceAnchor = anchorPoint(sourceNode, data?.sourcePort, { 
      x: targetNode.position.x, y: targetNode.position.y 
    });
    const targetAnchor = anchorPoint(targetNode, data?.targetPort, { 
      x: sourceNode.position.x, y: sourceNode.position.y 
    });

    if (!sourceAnchor || !targetAnchor) {
      return {
        sourcePoint: { x: sourceX, y: sourceY },
        targetPoint: { x: targetX, y: targetY }
      };
    }

    // Apply jetty system
    const jettyResult = jettyEdgeEndpoints(
      sourceAnchor.point,
      sourceAnchor.side,
      targetAnchor.point,
      targetAnchor.side
    );

    return {
      sourcePoint: jettyResult.sourcePoint,
      targetPoint: jettyResult.targetPoint,
      sourceSide: sourceAnchor.side,
      targetSide: targetAnchor.side
    };
  }, [sourceNode, targetNode, sourceX, sourceY, targetX, targetY, data?.sourcePort, data?.targetPort]);

  // Generate all points for the path
  const allPoints = useMemo(() => {
    return [connectionPoints.sourcePoint, ...waypoints, connectionPoints.targetPoint];
  }, [connectionPoints.sourcePoint, waypoints, connectionPoints.targetPoint]);

  // Generate SVG path
  const path = useMemo(() => {
    if (allPoints.length < 2) return '';

    let pathString = `M ${allPoints[0].x},${allPoints[0].y}`;
    
    for (let i = 1; i < allPoints.length; i++) {
      const prev = allPoints[i - 1];
      const curr = allPoints[i];
      
      // Check if segment is orthogonal
      const isOrthogonal = Math.abs(prev.x - curr.x) < 5 || Math.abs(prev.y - curr.y) < 5;
      
      if (isOrthogonal) {
        pathString += ` L ${curr.x},${curr.y}`;
      } else {
        // Smooth curve for non-orthogonal segments
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        pathString += ` Q ${midX},${midY} ${curr.x},${curr.y}`;
      }
    }
    
    return pathString;
  }, [allPoints]);

  // Calculate label position
  const labelPosition = useMemo(() => {
    if (allPoints.length < 2) return { x: sourceX, y: sourceY };
    
    // Find the longest segment for label placement
    let maxLength = 0;
    let bestSegment = 0;
    
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p1 = allPoints[i];
      const p2 = allPoints[i + 1];
      const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      
      if (length > maxLength) {
        maxLength = length;
        bestSegment = i;
      }
    }
    
    const p1 = allPoints[bestSegment];
    const p2 = allPoints[bestSegment + 1];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }, [allPoints, sourceX, sourceY]);

  // Event handlers
  const handleMouseDown = useCallback((event, elementType, index) => {
    if (handlerRef.current) {
      handlerRef.current.onMouseDown(event, index);
    }
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (handlerRef.current) {
      handlerRef.current.onMouseMove(event);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (handlerRef.current) {
      handlerRef.current.onMouseUp();
    }
  }, []);

  const handleDoubleClick = useCallback((event, index) => {
    if (handlerRef.current) {
      handlerRef.current.onDoubleClick(event, index);
    }
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      handleMouseMove(event);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Render interactive handles
  const renderHandles = useCallback(() => {
    if (!handlerRef.current) return null;
    
    return handlerRef.current.renderHandles(
      waypoints,
      selected,
      hoveredElement === 'edge'
    );
  }, [waypoints, selected, hoveredElement]);

  // Render virtual segment handles
  const renderVirtualHandles = useCallback(() => {
    if (!selected && hoveredElement !== 'edge') return null;
    
    return allPoints.slice(0, -1).map((p1, segmentIndex) => {
      const p2 = allPoints[segmentIndex + 1];
      const segmentLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      
      // Only show handles for meaningful segments
      if (segmentLength < MIN_SEGMENT_LENGTH) return null;
      
      const isHorizontal = Math.abs(p1.y - p2.y) < 5;
      const isVertical = Math.abs(p1.x - p2.x) < 5;
      
      return (
        <g key={`virtual-handle-${segmentIndex}`}>
          {/* Invisible hit area */}
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="transparent"
            strokeWidth={20}
            style={{ cursor: isHorizontal ? 'ns-resize' : isVertical ? 'ew-resize' : 'move' }}
            onMouseDown={(e) => handleMouseDown(e, 'segment', segmentIndex)}
            onMouseEnter={() => setHoveredElement('segment')}
            onMouseLeave={() => setHoveredElement(null)}
          />
          
          {/* Visual feedback */}
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={hoveredElement === 'segment' ? "rgba(59, 130, 246, 0.6)" : "transparent"}
            strokeWidth={4}
            strokeDasharray="8,4"
            style={{ pointerEvents: 'none' }}
          />
        </g>
      );
    });
  }, [allPoints, selected, hoveredElement, handleMouseDown]);

  return (
    <>
      {/* Base edge path */}
      <BaseEdge
        id={id}
        path={path}
        style={{
          ...style,
          opacity: isProcessing ? 0.7 : 1,
          transition: 'opacity 0.2s ease'
        }}
        markerStart={markerStart}
        markerEnd={markerEnd}
        onMouseEnter={() => setHoveredElement('edge')}
        onMouseLeave={() => setHoveredElement(null)}
      />

      {/* Processing indicator */}
      {isProcessing && (
        <g>
          <circle
            cx={labelPosition.x}
            cy={labelPosition.y}
            r={8}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgb(59, 130, 246)"
            strokeWidth={2}
            opacity={0.8}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${labelPosition.x} ${labelPosition.y};360 ${labelPosition.x} ${labelPosition.y}`}
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* Edge label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              left: labelPosition.x,
              top: labelPosition.y,
              transform: 'translate(-50%, -50%)',
              fontSize: 12,
              fontWeight: 500,
              color: '#333',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
              zIndex: 10,
              backdropFilter: 'blur(4px)',
            }}
            className="nodrag nopan edge-label"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Virtual segment handles */}
      {renderVirtualHandles()}

      {/* Interactive handles */}
      {renderHandles()}
    </>
  );
};

export default OptimizedOrthogonalEdge;
