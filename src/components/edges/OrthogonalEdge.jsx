import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, Position } from 'reactflow';
import OrthogonalRouter from '../../services/OrthogonalRouter';

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

const OrthogonalEdge = ({
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
  const [hoveredSegmentInfo, setHoveredSegmentInfo] = useState(null);
  const [draggedSegmentIndex, setDraggedSegmentIndex] = useState(null);
  const [router] = useState(() => new OrthogonalRouter());

  // Get node dimensions and positions for source/target
  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === data?.source || n.id === data?.sourceNode || n.id === data?.sourceId);
  const targetNode = nodes.find(n => n.id === data?.target || n.id === data?.targetNode || n.id === data?.targetId);
  
  const sourcePoint = useMemo(() => {
    return sourceNode && sourcePosition
      ? getConnectionPoint(sourceNode.position.x, sourceNode.position.y, sourceNode.width, sourceNode.height, sourcePosition)
      : { x: sourceX, y: sourceY };
  }, [sourceNode, sourcePosition, sourceX, sourceY]);
  
  const targetPoint = useMemo(() => {
    return targetNode && targetPosition
      ? getConnectionPoint(targetNode.position.x, targetNode.position.y, targetNode.width, targetNode.height, targetPosition)
      : { x: targetX, y: targetY };
  }, [targetNode, targetPosition, targetX, targetY]);

  // Auto-calculate route when source or target changes
  const autoCalculatedRoute = useMemo(() => {
    if (!sourceNode || !targetNode) return { waypoints: [] };
    
    // Get all nodes as obstacles (excluding source and target)
    const obstacles = nodes
      .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
      .map(node => ({
        x: node.position.x,
        y: node.position.y,
        width: node.width || 100,
        height: node.height || 100
      }));
    
    // Calculate optimal route
    return router.calculateOptimalRoute(sourceNode, targetNode, obstacles);
  }, [sourceNode, targetNode, nodes, router]);

  // Use existing waypoints or auto-calculated route
  const waypoints = useMemo(() => {
    if (data?.waypoints && data.waypoints.length > 0) {
      const validWaypoints = data.waypoints.filter(wp => 
        wp && typeof wp.x === 'number' && typeof wp.y === 'number' && 
        !isNaN(wp.x) && !isNaN(wp.y) && isFinite(wp.x) && isFinite(wp.y)
      );
      return validWaypoints;
    }
    
    // Use auto-calculated route
    return autoCalculatedRoute.waypoints || [];
  }, [data?.waypoints, autoCalculatedRoute.waypoints]);

  // This function generates the SVG path string for the edge.
  const path = useMemo(() => {
    const points = [sourcePoint, ...waypoints, targetPoint];
    let pathString = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathString += ` L ${points[i].x},${points[i].y}`;
    }
    return pathString;
  }, [sourcePoint, targetPoint, waypoints]);

  // Enhanced segment dragging with collision avoidance
  const handleSegmentMouseDown = useCallback((event, segmentIndex) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Segment mouse down triggered:', segmentIndex);
    setDraggedSegmentIndex(segmentIndex);

    const initialEdges = getEdges();
    const clickedEdge = initialEdges.find(e => e.id === id);
    if (!clickedEdge) return;

    // Get current waypoints
    let currentWaypoints = clickedEdge.data?.waypoints || [];
    
    // If no waypoints exist, use auto-calculated route
    if (currentWaypoints.length === 0) {
      currentWaypoints = autoCalculatedRoute.waypoints || [];
    }

    const points = [sourcePoint, ...currentWaypoints, targetPoint];
    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1];
    
    if (!p1 || !p2) return;
    
    // Determine if this is a horizontal or vertical segment
    const isHorizontal = Math.abs(p1.y - p2.y) < 10;
    const isVertical = Math.abs(p1.x - p2.x) < 10;

    console.log('Dragging segment:', segmentIndex, 'isHorizontal:', isHorizontal, 'isVertical:', isVertical);

    const onMouseMove = (moveEvent) => {
      const position = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      console.log('Mouse position:', position);

      // Get obstacles for collision avoidance
      const obstacles = nodes
        .filter(node => node.id !== sourceNode?.id && node.id !== targetNode?.id)
        .map(node => ({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 100,
          height: node.height || 100
        }));

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === id) {
            let currentWaypoints = e.data?.waypoints || [];
            
            // If waypoints are empty, use auto-calculated route
            if (currentWaypoints.length === 0) {
              currentWaypoints = autoCalculatedRoute.waypoints || [];
            }
            
            // Adjust path for obstacles during dragging
            const adjustedWaypoints = router.adjustPathForObstacles(
              currentWaypoints, 
              obstacles, 
              segmentIndex - 1, // Adjust for source point offset
              position
            );
            
            console.log('Adjusted waypoints:', adjustedWaypoints);
            return { ...e, data: { ...e.data, waypoints: adjustedWaypoints } };
          }
          return e;
        })
      );
    };

    const onMouseUp = () => {
      console.log('Mouse up - stopping drag');
      setDraggedSegmentIndex(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    // Add event listeners to window
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, sourcePoint, targetPoint, getEdges, setEdges, screenToFlowPosition, nodes, sourceNode, targetNode, router, autoCalculatedRoute]);

  // Enhanced waypoint dragging with collision avoidance
  const onWaypointMouseDown = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Waypoint mouse down triggered:', index);

    const onMouseMove = (e) => {
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      
      // Get obstacles for collision avoidance
      const obstacles = nodes
        .filter(node => node.id !== sourceNode?.id && node.id !== targetNode?.id)
        .map(node => ({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 100,
          height: node.height || 100
        }));
      
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            let currentWaypoints = edge.data?.waypoints || [];
            
            // If waypoints are empty, use auto-calculated route
            if (currentWaypoints.length === 0) {
              currentWaypoints = autoCalculatedRoute.waypoints || [];
            }
            
            if (!currentWaypoints || currentWaypoints.length === 0 || index >= currentWaypoints.length) {
              return edge;
            }
            
            // Adjust path for obstacles during waypoint dragging
            const adjustedWaypoints = router.adjustPathForObstacles(
              currentWaypoints, 
              obstacles, 
              index, 
              position
            );
            
            return { ...edge, data: { ...edge.data, waypoints: adjustedWaypoints } };
          }
          return edge;
        })
      );
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [id, setEdges, screenToFlowPosition, nodes, sourceNode, targetNode, router, autoCalculatedRoute]);

  // Waypoint double-click handler - removes waypoint
  const onWaypointDoubleClick = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Waypoint double-click triggered:', index);
    
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const currentWaypoints = edge.data?.waypoints || [];
          if (!currentWaypoints || currentWaypoints.length === 0 || index >= currentWaypoints.length) {
            return edge;
          }
          
          const newWaypoints = [...currentWaypoints];
          newWaypoints.splice(index, 1);
          
          return { ...edge, data: { ...edge.data, waypoints: newWaypoints } };
        }
        return edge;
      })
    );
  }, [id, setEdges]);

  // Calculate label position
  const labelPosition = useMemo(() => {
    const points = [sourcePoint, ...waypoints, targetPoint];
    if (points.length < 2) return { x: (sourcePoint.x + targetPoint.x) / 2, y: (sourcePoint.y + targetPoint.y) / 2 };
    
    const midIndex = Math.floor(points.length / 2);
    const p1 = points[midIndex - 1];
    const p2 = points[midIndex];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }, [sourcePoint, targetPoint, waypoints]);

  // Auto-reroute when nodes move
  useEffect(() => {
    if (sourceNode && targetNode && !data?.waypoints) {
      // Auto-reroute only if no manual waypoints exist
      const obstacles = nodes
        .filter(node => node.id !== sourceNode.id && node.id !== targetNode.id)
        .map(node => ({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 100,
          height: node.height || 100
        }));
      
      const newRoute = router.calculateOptimalRoute(sourceNode, targetNode, obstacles);
      
      if (newRoute.waypoints.length > 0) {
        setEdges((eds) =>
          eds.map((edge) => {
            if (edge.id === id && (!edge.data?.waypoints || edge.data.waypoints.length === 0)) {
              return { ...edge, data: { ...edge.data, waypoints: newRoute.waypoints } };
            }
            return edge;
          })
        );
      }
    }
  }, [sourceNode?.position, targetNode?.position, nodes, router, id, setEdges, data?.waypoints]);

  return (
    <>
      {/* The base edge path */}
      <BaseEdge
        id={id}
        path={path}
        style={style}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      
      {/* EdgeLabelRenderer for displaying labels */}
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
        </div>
      </EdgeLabelRenderer>

      {/* Draggable segments - Enhanced with collision avoidance */}
      {(() => {
        const points = [sourcePoint, ...waypoints, targetPoint];
        return points.slice(0, -1).map((p1, i) => {
          const p2 = points[i+1];
          if (!p1 || !p2) return null;
          
          const isHorizontal = Math.abs(p1.y - p2.y) < 5;
          const isDragging = draggedSegmentIndex === i;
          const isHovered = hoveredSegmentInfo?.segmentIndex === i;
          
          return (
            <g key={`segment-${i}`}>
              {/* Single clean segment for dragging */}
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
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
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
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
      })()}

      {/* Segment tooltip when hovering */}
      {hoveredSegmentInfo && !draggedSegmentIndex && (() => {
        const points = [sourcePoint, ...waypoints, targetPoint];
        const p1 = points[hoveredSegmentInfo.segmentIndex];
        const p2 = points[hoveredSegmentInfo.segmentIndex + 1];
        
        if (!p1 || !p2) return null;
        
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        return (
          <foreignObject
            x={midX + 10}
            y={midY - 20}
            width={80}
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
                zIndex: 1000,
              }}
            >
              {Math.round(midX)}, {Math.round(midY)}
            </div>
          </foreignObject>
        );
      })()}

      {/* Waypoints */}
      {waypoints.map((wp, i) => (
        <g key={i} className="react-flow__custom-edge-waypoint">
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

      {/* Auto-routing indicator */}
      {(!data?.waypoints || data.waypoints.length === 0) && (
        <g>
          <circle
            cx={labelPosition.x}
            cy={labelPosition.y - 20}
            r={3}
            fill="rgba(34, 197, 94, 0.8)"
            stroke="rgba(34, 197, 94, 1)"
            strokeWidth={1}
          />
        </g>
      )}
    </>
  );
};

export default OrthogonalEdge; 