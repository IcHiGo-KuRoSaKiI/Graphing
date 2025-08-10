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
 * - Draw.io-style connection point calculation
 * - Smart debouncing for optimal performance
 */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, Position } from 'reactflow';
import edgeWorkerService from '../../services/EdgeWorkerService';

// Draw.io-style connection point calculation
const calculateOptimalConnectionPoint = (node, targetPoint, sourcePoint) => {
  if (!node) return null;
  
  const bounds = {
    x: node.position.x,
    y: node.position.y,
    width: node.width || 150,
    height: node.height || 60,
    right: node.position.x + (node.width || 150),
    bottom: node.position.y + (node.height || 60)
  };
  
  const center = { 
    x: bounds.x + bounds.width / 2, 
    y: bounds.y + bounds.height / 2 
  };
  
  // Calculate which side is closest to the target
  const dx = targetPoint.x - center.x;
  const dy = targetPoint.y - center.y;
  
  // Add margin for better visual appearance (draw.io style)
  const margin = 5;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      return { x: bounds.right + margin, y: center.y };
    } else {
      return { x: bounds.x - margin, y: center.y };
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      return { x: center.x, y: bounds.bottom + margin };
    } else {
      return { x: center.x, y: bounds.y - margin };
    }
  }
};

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

// Smart debouncing hook
const useSmartDebouncing = (id, processEdgeWithWorker) => {
  const debounceTimers = useRef(new Map());
  
  const debouncedProcess = useCallback((operation, delay) => {
    const key = `${id}-${operation}`;
    
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key));
    }
    
    const timer = setTimeout(() => {
      processEdgeWithWorker(true);
      debounceTimers.current.delete(key);
    }, delay);
    
    debounceTimers.current.set(key, timer);
  }, [id, processEdgeWithWorker]);
  
  // Different delays for different operations (optimized for performance)
  const processOptimization = useCallback(() => debouncedProcess('optimize', 150), [debouncedProcess]);
  const processVirtualBends = useCallback(() => debouncedProcess('virtual_bends', 100), [debouncedProcess]);
  const processIntersections = useCallback(() => debouncedProcess('intersections', 200), [debouncedProcess]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);
  
  return { processOptimization, processVirtualBends, processIntersections };
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
  const isVisibleRef = useRef(true);
  
  // Get node information
  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === data?.source || n.id === data?.sourceNode || n.id === data?.sourceId);
  const targetNode = nodes.find(n => n.id === data?.target || n.id === data?.targetNode || n.id === data?.targetId);
  
  // Calculate connection points with draw.io-style logic
  const sourcePoint = useMemo(() => {
    if (sourceNode && sourcePosition) {
      // Use draw.io-style connection point calculation
      const targetPoint = targetNode ? 
        { x: targetNode.position.x + (targetNode.width || 150) / 2, y: targetNode.position.y + (targetNode.height || 60) / 2 } :
        { x: targetX, y: targetY };
      
      return calculateOptimalConnectionPoint(sourceNode, targetPoint, { x: sourceX, y: sourceY }) ||
             getConnectionPoint(sourceNode.position.x, sourceNode.position.y, sourceNode.width || 150, sourceNode.height || 60, sourcePosition);
    }
    return { x: sourceX, y: sourceY };
  }, [sourceNode, sourcePosition, sourceX, sourceY, targetNode, targetX, targetY]);
  
  const targetPoint = useMemo(() => {
    if (targetNode && targetPosition) {
      // Use draw.io-style connection point calculation
      const sourcePoint = sourceNode ? 
        { x: sourceNode.position.x + (sourceNode.width || 150) / 2, y: sourceNode.position.y + (sourceNode.height || 60) / 2 } :
        { x: sourceX, y: sourceY };
      
      return calculateOptimalConnectionPoint(targetNode, sourcePoint, { x: targetX, y: targetY }) ||
             getConnectionPoint(targetNode.position.x, targetNode.position.y, targetNode.width || 150, targetNode.height || 60, targetPosition);
    }
    return { x: targetX, y: targetY };
  }, [targetNode, targetPosition, targetX, targetY, sourceNode, sourceX, sourceY]);
  
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
  
  // Debounced processing function with smart optimization
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
      // Process multiple operations in parallel for maximum performance
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
  
  // Smart debouncing
  const { processOptimization, processVirtualBends, processIntersections } = useSmartDebouncing(id, processEdgeWithWorker);
  
  // Effect to trigger processing when edge or nodes change
  useEffect(() => {
    processEdgeWithWorker();
  }, [processEdgeWithWorker]);
  
  // Use optimized waypoints or fallback to original
  const activeWaypoints = useMemo(() => {
    return optimizedWaypoints.length > 0 ? optimizedWaypoints : (data?.waypoints || []);
  }, [optimizedWaypoints, data?.waypoints]);
  
  // Generate SVG path with draw.io-style optimization
  const path = useMemo(() => {
    // Use the calculated optimal connection points instead of original coordinates
    const points = [sourcePoint, ...activeWaypoints, targetPoint];
    let pathString = `M ${points[0].x},${points[0].y}`;
    
    // Draw.io-style path generation with smooth transitions
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      
      // Check if we need a smooth curve or straight line
      const isOrthogonal = Math.abs(prev.x - current.x) < 5 || Math.abs(prev.y - current.y) < 5;
      
      if (isOrthogonal) {
        pathString += ` L ${current.x},${current.y}`;
      } else {
        // Smooth curve for non-orthogonal segments
        const midX = (prev.x + current.x) / 2;
        const midY = (prev.y + current.y) / 2;
        pathString += ` Q ${midX},${midY} ${current.x},${current.y}`;
      }
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
      
      // Re-process after drag with optimization
      processOptimization();
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, sourcePoint, targetPoint, setEdges, screenToFlowPosition, processOptimization]);
  
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
      
      // Re-process after waypoint drag with optimization
      processOptimization();
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, setEdges, screenToFlowPosition, processOptimization]);
  
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
    
    // Re-process after waypoint removal with optimization
    processOptimization();
  }, [id, setEdges, processOptimization]);
  
  // Calculate label position with draw.io-style positioning
  const labelPosition = useMemo(() => {
    const points = [sourcePoint, ...activeWaypoints, targetPoint];
    if (points.length < 2) return { x: (sourcePoint.x + targetPoint.x) / 2, y: (sourcePoint.y + targetPoint.y) / 2 };
    
    // Find the longest segment for better label placement
    let maxLength = 0;
    let bestSegment = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      
      if (length > maxLength) {
        maxLength = length;
        bestSegment = i;
      }
    }
    
    const p1 = points[bestSegment];
    const p2 = points[bestSegment + 1];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }, [sourcePoint, targetPoint, activeWaypoints]);
  
  // Render segments for dragging with enhanced visual feedback
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
  
  // Render virtual bend points with enhanced styling
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
          {/* Plus sign for better UX */}
          {isHovered && (
            <text
              x={bend.x}
              y={bend.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgb(59, 130, 246)"
              fontSize="12"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              +
            </text>
          )}
        </g>
      );
    });
  };
  
  // Render intersection points with enhanced styling
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
              values={`0 ${labelPosition.x} ${labelPosition.y};360 ${labelPosition.x} ${labelPosition.y}`}
              dur="1s"
              repeatCount="indefinite"
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