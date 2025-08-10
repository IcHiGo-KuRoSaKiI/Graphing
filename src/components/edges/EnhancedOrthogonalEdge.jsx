/**
 * Enhanced Orthogonal Edge - Draw.io Style Implementation
 * Features:
 * - Web Worker-based processing for all operations
 * - Intelligent waypoint optimization
 * - Segment intersection detection & merging
 * - Virtual bend points for dynamic waypoint insertion
 * - Smart pathfinding with obstacle avoidance
 * - Layout-aware routing
 * - Performance monitoring and optimization
 */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, Position } from 'reactflow';
import edgeWorkerService from '../../services/EdgeWorkerService';

const getConnectionPoint = (x, y, width, height, position) => {
  switch (position) {
    case Position.Top:
      return { x: x + width / 2, y };
    case Position.Right:
      return { x: x + width, y: y + height / 2 };
    case Position.Bottom:
      return { x: x + width / 2, y: y + height };
    case Position.Left:
      return { x, y: y + height / 2 };
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
};

const EnhancedOrthogonalEdge = ({
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
  const { screenToFlowPosition, setEdges, getEdges, getNodes } = useReactFlow();
  
  // State management
  const [optimizedWaypoints, setOptimizedWaypoints] = useState([]);
  const [virtualBends, setVirtualBends] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [hoveredSegmentInfo, setHoveredSegmentInfo] = useState(null);
  const [hoveredVirtualBend, setHoveredVirtualBend] = useState(null);
  const [draggedSegmentIndex, setDraggedSegmentIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Refs
  const processingTimeoutRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Get node information
  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === data?.source || n.id === data?.sourceNode || n.id === data?.sourceId);
  const targetNode = nodes.find(n => n.id === data?.target || n.id === data?.targetNode || n.id === data?.targetId);
  
  // Calculate connection points
  const sourcePoint = useMemo(() => {
    return sourceNode && sourcePosition
      ? getConnectionPoint(sourceNode.position.x, sourceNode.position.y, sourceNode.width || 150, sourceNode.height || 60, sourcePosition)
      : { x: sourceX, y: sourceY };
  }, [sourceNode, sourcePosition, sourceX, sourceY]);
  
  const targetPoint = useMemo(() => {
    return targetNode && targetPosition
      ? getConnectionPoint(targetNode.position.x, targetNode.position.y, targetNode.width || 150, targetNode.height || 60, targetPosition)
      : { x: targetX, y: targetY };
  }, [targetNode, targetPosition, targetX, targetY]);
  
  // Create edge object for Web Worker processing
  const edgeForProcessing = useMemo(() => ({
    id,
    source: sourceNode?.id,
    target: targetNode?.id,
    sourceHandle: sourcePosition,
    targetHandle: targetPosition,
    data: {
      ...data,
      waypoints: data?.waypoints || []
    }
  }), [id, sourceNode?.id, targetNode?.id, sourcePosition, targetPosition, data]);
  
  // Debounced processing function
  const processEdgeWithWorker = useCallback(async (forceUpdate = false) => {
    const now = performance.now();
    if (!forceUpdate && now - lastUpdateTimeRef.current < 100) {
      // Debounce updates to prevent excessive processing
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => processEdgeWithWorker(true), 100);
      return;
    }
    
    lastUpdateTimeRef.current = now;
    setIsProcessing(true);
    
    try {
      // Process multiple operations in parallel
      const [optimizedWaypoints, virtualBends, intersections] = await Promise.all([
        edgeWorkerService.optimizeWaypoints(edgeForProcessing, nodes),
        edgeWorkerService.calculateVirtualBends(edgeForProcessing, nodes),
        edgeWorkerService.detectIntersections(edgeForProcessing, nodes)
      ]);
      
      setOptimizedWaypoints(optimizedWaypoints);
      setVirtualBends(virtualBends);
      setIntersections(intersections);
      
      // Update performance metrics
      const metrics = await edgeWorkerService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      
      // Update edge data if waypoints were optimized
      if (optimizedWaypoints.length !== (data?.waypoints?.length || 0)) {
        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  waypoints: optimizedWaypoints
                }
              };
            }
            return edge;
          })
        );
      }
      
    } catch (error) {
      console.error('❌ EnhancedOrthogonalEdge: Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [edgeForProcessing, nodes, data?.waypoints?.length, id, setEdges]);
  
  // Effect to trigger processing when edge or nodes change
  useEffect(() => {
    processEdgeWithWorker();
  }, [processEdgeWithWorker]);
  
  // Use optimized waypoints or fallback to original
  const activeWaypoints = useMemo(() => {
    return optimizedWaypoints.length > 0 ? optimizedWaypoints : (data?.waypoints || []);
  }, [optimizedWaypoints, data?.waypoints]);
  
  // Generate SVG path
  const path = useMemo(() => {
    const points = [sourcePoint, ...activeWaypoints, targetPoint];
    let pathString = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathString += ` L ${points[i].x},${points[i].y}`;
    }
    return pathString;
  }, [sourcePoint, targetPoint, activeWaypoints]);
  
  // Handle virtual bend click to add waypoint
  const handleVirtualBendClick = useCallback(async (event, virtualBend) => {
    event.stopPropagation();
    event.preventDefault();
    
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    
    // Insert new waypoint at virtual bend position
    const currentWaypoints = activeWaypoints || [];
    const newWaypoints = [...currentWaypoints];
    newWaypoints.splice(virtualBend.segmentIndex + 1, 0, position);
    
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: newWaypoints
            }
          };
        }
        return edge;
      })
    );
    
    // Re-process with new waypoint
    await processEdgeWithWorker(true);
  }, [activeWaypoints, id, setEdges, screenToFlowPosition, processEdgeWithWorker]);
  
  // Enhanced segment dragging with Web Worker processing
  const handleSegmentMouseDown = useCallback((event, segmentIndex) => {
    event.stopPropagation();
    event.preventDefault();
    
    setDraggedSegmentIndex(segmentIndex);
    
    const onMouseMove = async (moveEvent) => {
      const position = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            const currentWaypoints = edge.data?.waypoints || [];
            const points = [sourcePoint, ...currentWaypoints, targetPoint];
            const p1 = points[segmentIndex];
            const p2 = points[segmentIndex + 1];
            
            if (!p1 || !p2) return edge;
            
            const isHorizontal = Math.abs(p1.y - p2.y) < 10;
            const newWaypoints = [...currentWaypoints];
            
            if (isHorizontal) {
              // Move horizontal segment vertically
              const newY = position.y;
              
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                newWaypoints[segmentIndex - 1] = { ...newWaypoints[segmentIndex - 1], y: newY };
              }
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                newWaypoints[segmentIndex] = { ...newWaypoints[segmentIndex], y: newY };
              }
            } else {
              // Move vertical segment horizontally
              const newX = position.x;
              
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                newWaypoints[segmentIndex - 1] = { ...newWaypoints[segmentIndex - 1], x: newX };
              }
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                newWaypoints[segmentIndex] = { ...newWaypoints[segmentIndex], x: newX };
              }
            }
            
            return {
              ...edge,
              data: {
                ...edge.data,
                waypoints: newWaypoints
              }
            };
          }
          return edge;
        })
      );
    };
    
    const onMouseUp = async () => {
      setDraggedSegmentIndex(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      // Re-process after drag
      await processEdgeWithWorker(true);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, sourcePoint, targetPoint, setEdges, screenToFlowPosition, processEdgeWithWorker]);
  
  // Enhanced waypoint dragging
  const onWaypointMouseDown = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();
    
    const onMouseMove = (e) => {
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            const currentWaypoints = edge.data?.waypoints || [];
            const newWaypoints = [...currentWaypoints];
            newWaypoints[index] = position;
            
            return {
              ...edge,
              data: {
                ...edge.data,
                waypoints: newWaypoints
              }
            };
          }
          return edge;
        })
      );
    };
    
    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      // Re-process after waypoint drag
      await processEdgeWithWorker(true);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, setEdges, screenToFlowPosition, processEdgeWithWorker]);
  
  // Waypoint double-click to remove
  const onWaypointDoubleClick = useCallback(async (event, index) => {
    event.stopPropagation();
    event.preventDefault();
    
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          const currentWaypoints = edge.data?.waypoints || [];
          const newWaypoints = [...currentWaypoints];
          newWaypoints.splice(index, 1);
          
          return {
            ...edge,
            data: {
              ...edge.data,
              waypoints: newWaypoints
            }
          };
        }
        return edge;
      })
    );
    
    // Re-process after waypoint removal
    await processEdgeWithWorker(true);
  }, [id, setEdges, processEdgeWithWorker]);
  
  // Calculate label position
  const labelPosition = useMemo(() => {
    const points = [sourcePoint, ...activeWaypoints, targetPoint];
    if (points.length < 2) return { x: (sourcePoint.x + targetPoint.x) / 2, y: (sourcePoint.y + targetPoint.y) / 2 };
    
    const midIndex = Math.floor(points.length / 2);
    const p1 = points[midIndex - 1];
    const p2 = points[midIndex];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }, [sourcePoint, targetPoint, activeWaypoints]);
  
  // Render segments for dragging
  const renderDraggableSegments = () => {
    const points = [sourcePoint, ...activeWaypoints, targetPoint];
    
    return points.slice(0, -1).map((p1, i) => {
      const p2 = points[i + 1];
      if (!p1 || !p2) return null;
      
      const isHorizontal = Math.abs(p1.y - p2.y) < 5;
      const isDragging = draggedSegmentIndex === i;
      const isHovered = hoveredSegmentInfo?.segmentIndex === i;
      
      return (
        <g key={`segment-${i}`}>
          {/* Visible segment line */}
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isDragging ? "rgba(59, 130, 246, 0.8)" : isHovered ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.3)"}
            strokeWidth={isDragging ? 4 : isHovered ? 3 : 2}
            strokeDasharray={isDragging || isHovered ? "5,5" : "none"}
            style={{ cursor: isHorizontal ? 'ns-resize' : 'ew-resize' }}
            onMouseDown={(event) => handleSegmentMouseDown(event, i)}
            onMouseEnter={() => setHoveredSegmentInfo({ segmentIndex: i, distance: 0 })}
            onMouseLeave={() => setHoveredSegmentInfo(null)}
          />
          
          {/* Invisible wider segment for better hit detection */}
          <line
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="transparent"
            strokeWidth={12}
            style={{ cursor: isHorizontal ? 'ns-resize' : 'ew-resize' }}
            onMouseDown={(event) => handleSegmentMouseDown(event, i)}
            onMouseEnter={() => setHoveredSegmentInfo({ segmentIndex: i, distance: 0 })}
            onMouseLeave={() => setHoveredSegmentInfo(null)}
          />
        </g>
      );
    });
  };
  
  // Render virtual bend points
  const renderVirtualBends = () => {
    if (!virtualBends || virtualBends.length === 0) return null;
    
    return virtualBends.map((bend, index) => {
      const isHovered = hoveredVirtualBend === index;
      
      return (
        <g key={`virtual-bend-${index}`}>
          <circle
            cx={bend.x} cy={bend.y} r={isHovered ? 6 : 4}
            fill="rgba(59, 130, 246, 0.4)"
            stroke="rgb(59, 130, 246)"
            strokeWidth={isHovered ? 2 : 1}
            strokeDasharray="3,3"
            style={{ cursor: 'pointer' }}
            onClick={(event) => handleVirtualBendClick(event, bend)}
            onMouseEnter={() => setHoveredVirtualBend(index)}
            onMouseLeave={() => setHoveredVirtualBend(null)}
          />
        </g>
      );
    });
  };
  
  // Render intersection points
  const renderIntersections = () => {
    if (!intersections || intersections.length === 0) return null;
    
    return intersections.map((intersection, index) => (
      <g key={`intersection-${index}`}>
        <circle
          cx={intersection.point.x}
          cy={intersection.point.y}
          r={3}
          fill="rgba(255, 165, 0, 0.8)"
          stroke="rgba(255, 140, 0, 1)"
          strokeWidth={1}
        />
      </g>
    ));
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);
  
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
              values="0;360"
              dur="1s"
              repeatCount="indefinite"
              transformOrigin={`${labelPosition.x} ${labelPosition.y}`}
            />
          </circle>
        </g>
      )}
      
      {/* Edge label */}
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
          {data?.label || ''}
          {selected && performanceMetrics.avgProcessingTime && (
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {Math.round(performanceMetrics.avgProcessingTime)}ms avg
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      
      {/* Draggable segments */}
      {renderDraggableSegments()}
      
      {/* Virtual bend points */}
      {!isProcessing && renderVirtualBends()}
      
      {/* Intersection points */}
      {renderIntersections()}
      
      {/* Waypoints */}
      {activeWaypoints.map((wp, i) => (
        <g key={`waypoint-${i}`} className="react-flow__custom-edge-waypoint">
          <circle
            cx={wp.x} cy={wp.y} r={5}
            fill="rgb(59, 130, 246)"
            stroke="white"
            strokeWidth={2}
            className="cursor-move"
            onMouseDown={(event) => onWaypointMouseDown(event, i)}
            onDoubleClick={(event) => onWaypointDoubleClick(event, i)}
          />
        </g>
      ))}
      
      {/* Hover tooltip */}
      {hoveredSegmentInfo && !draggedSegmentIndex && (
        <foreignObject
          x={labelPosition.x + 10}
          y={labelPosition.y - 20}
          width={120}
          height={40}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Drag to reshape
            {virtualBends.length > 0 && (
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                Click + to add bend
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </>
  );
};

export default EnhancedOrthogonalEdge;