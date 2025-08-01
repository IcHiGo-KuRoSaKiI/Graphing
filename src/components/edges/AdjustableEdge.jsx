import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, Position } from 'reactflow';

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

const AdjustableEdge = ({
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
  const [hoveredWaypoint, setHoveredWaypoint] = useState(null);
  const [hoveredSegmentInfo, setHoveredSegmentInfo] = useState(null);
  const [draggedSegmentIndex, setDraggedSegmentIndex] = useState(null);

  // Get node dimensions and positions for source/target
  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === data?.source || n.id === data?.sourceNode || n.id === data?.sourceId);
  const targetNode = nodes.find(n => n.id === data?.target || n.id === data?.targetNode || n.id === data?.targetId);
  const sourcePoint = sourceNode && sourcePosition
    ? getConnectionPoint(sourceNode.position.x, sourceNode.position.y, sourceNode.width, sourceNode.height, sourcePosition)
    : { x: sourceX, y: sourceY };
  const targetPoint = targetNode && targetPosition
    ? getConnectionPoint(targetNode.position.x, targetNode.position.y, targetNode.width, targetNode.height, targetPosition)
    : { x: targetX, y: targetY };

  // Calculate orthogonal bends for new edges - always use connection points
  const calculateOrthogonalBends = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const needsTwoBends = Math.abs(dx) > 50 && Math.abs(dy) > 50;
    if (needsTwoBends) {
      // L or Z shape
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal first
        const midX = source.x + dx / 2;
        return [
          { x: midX, y: source.y },
          { x: midX, y: target.y }
        ];
      } else {
        // Vertical first
        const midY = source.y + dy / 2;
        return [
          { x: source.x, y: midY },
          { x: target.x, y: midY }
        ];
      }
    } else {
      // Single bend
      if (Math.abs(dx) > Math.abs(dy)) {
        const midX = source.x + dx / 2;
        return [{ x: midX, y: source.y }];
      } else {
        const midY = source.y + dy / 2;
        return [{ x: source.x, y: midY }];
      }
    }
  };

  // Use the waypoints from the edge's data, or calculate default orthogonal bends
  const waypoints = useMemo(() => {
    if (data?.waypoints && data.waypoints.length > 0) {
      const validWaypoints = data.waypoints.filter(wp => 
        wp && typeof wp.x === 'number' && typeof wp.y === 'number'
      );
      if (validWaypoints.length > 0) return validWaypoints;
    }
    return calculateOrthogonalBends(sourcePoint, targetPoint);
  }, [data?.waypoints, sourcePoint, targetPoint]);

  // Save waypoints to edge data if they don't exist
  useEffect(() => {
    if (!data?.waypoints && waypoints.length > 0) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === id) {
            return { ...e, data: { ...e.data, waypoints } };
          }
          return e;
        })
      );
    }
  }, [id, data?.waypoints, waypoints, setEdges]);

  // This function generates the SVG path string for the edge.
  const path = useMemo(() => {
    const points = [sourcePoint, ...waypoints, targetPoint];
    let pathString = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathString += ` L ${points[i].x},${points[i].y}`;
    }
    return pathString;
  }, [sourcePoint, targetPoint, waypoints]);

  // Draw.io-style segment dragging - moves the entire segment orthogonally
  const handleSegmentMouseDown = useCallback((event, segmentIndex) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Segment mouse down triggered:', segmentIndex);
    setDraggedSegmentIndex(segmentIndex);

    const initialEdges = getEdges();
    const clickedEdge = initialEdges.find(e => e.id === id);
    if (!clickedEdge) return;

    // Get current waypoints or create them if they don't exist
    let currentWaypoints = clickedEdge.data?.waypoints || [];
    
    // If no waypoints exist, create them based on the orthogonal path
    if (currentWaypoints.length === 0) {
      const dx = targetPoint.x - sourcePoint.x;
      const dy = targetPoint.y - sourcePoint.y;
      const needsTwoBends = Math.abs(dx) > 50 && Math.abs(dy) > 50;
      
      if (needsTwoBends) {
        const maxDistance = Math.max(Math.abs(dx), Math.abs(dy)) / 2;
        const bendDistance = Math.min(maxDistance, Math.abs(dx) / 2);
        const midX = sourcePoint.x + (dx > 0 ? bendDistance : -bendDistance);
        const midY = targetPoint.y + (dy > 0 ? -bendDistance : bendDistance);
        
        currentWaypoints = [
          { x: midX, y: sourcePoint.y },
          { x: midX, y: targetPoint.y }
        ];
      } else {
        const midX = sourcePoint.x + dx / 2;
        const midY = sourcePoint.y + dy / 2;
        currentWaypoints = [{ x: midX, y: midY }];
      }
    }

    const points = [sourcePoint, ...currentWaypoints, targetPoint];
    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1];
    
    if (!p1 || !p2) return;
    
    // Determine if this is a horizontal or vertical segment
    const isHorizontal = Math.abs(p1.y - p2.y) < 10;
    const isVertical = Math.abs(p1.x - p2.x) < 10;

    console.log('Dragging segment:', segmentIndex, 'isHorizontal:', isHorizontal, 'isVertical:', isVertical, 'points:', points);

    const onMouseMove = (moveEvent) => {
      const position = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      console.log('Mouse position:', position);

      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === id) {
            // Get waypoints from multiple possible sources
            let currentWaypoints = e.data?.waypoints || [];
            
            // If waypoints are empty but we have points, extract waypoints from the points
            if (currentWaypoints.length === 0 && points && points.length > 2) {
              // Extract waypoints from points (skip first and last which are source and target)
              currentWaypoints = points.slice(1, -1);
              console.log('Extracted waypoints from points:', currentWaypoints);
            }
            
            console.log('Current waypoints:', currentWaypoints);
            
            const newWaypoints = [...currentWaypoints];

            if (isHorizontal) {
              // Move horizontal segment vertically - maintain orthogonality
              const newY = position.y;
              console.log('Moving horizontal segment to Y:', newY);
              
              // Update the waypoint before this segment (if it exists)
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                newWaypoints[segmentIndex - 1] = { ...newWaypoints[segmentIndex - 1], y: newY };
                console.log('Updated waypoint', segmentIndex - 1, 'to Y:', newY);
              }
              
              // Update the waypoint after this segment (if it exists)
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                newWaypoints[segmentIndex] = { ...newWaypoints[segmentIndex], y: newY };
                console.log('Updated waypoint', segmentIndex, 'to Y:', newY);
              }
              
              // Maintain orthogonality by ensuring adjacent segments are perpendicular
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                // Keep the previous waypoint's X coordinate to maintain vertical segment
                const prevWaypoint = newWaypoints[segmentIndex - 1];
                newWaypoints[segmentIndex - 1] = { x: prevWaypoint.x, y: newY };
              }
              
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                // Keep the next waypoint's X coordinate to maintain vertical segment
                const nextWaypoint = newWaypoints[segmentIndex];
                newWaypoints[segmentIndex] = { x: nextWaypoint.x, y: newY };
              }
            } else if (isVertical) {
              // Move vertical segment horizontally - maintain orthogonality
              const newX = position.x;
              console.log('Moving vertical segment to X:', newX);
              
              // Update the waypoint before this segment (if it exists)
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                newWaypoints[segmentIndex - 1] = { ...newWaypoints[segmentIndex - 1], x: newX };
                console.log('Updated waypoint', segmentIndex - 1, 'to X:', newX);
              }
              
              // Update the waypoint after this segment (if it exists)
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                newWaypoints[segmentIndex] = { ...newWaypoints[segmentIndex], x: newX };
                console.log('Updated waypoint', segmentIndex, 'to X:', newX);
              }
              
              // Maintain orthogonality by ensuring adjacent segments are perpendicular
              if (segmentIndex > 0 && newWaypoints[segmentIndex - 1]) {
                // Keep the previous waypoint's Y coordinate to maintain horizontal segment
                const prevWaypoint = newWaypoints[segmentIndex - 1];
                newWaypoints[segmentIndex - 1] = { x: newX, y: prevWaypoint.y };
              }
              
              if (segmentIndex < newWaypoints.length && newWaypoints[segmentIndex]) {
                // Keep the next waypoint's Y coordinate to maintain horizontal segment
                const nextWaypoint = newWaypoints[segmentIndex];
                newWaypoints[segmentIndex] = { x: newX, y: nextWaypoint.y };
              }
            }
            
            console.log('New waypoints:', newWaypoints);
            return { ...e, data: { ...e.data, waypoints: newWaypoints } };
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
  }, [id, sourcePoint, targetPoint, getEdges, setEdges, screenToFlowPosition]);

  // Draw.io-style waypoint dragging - maintains orthogonality
  const onWaypointMouseDown = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Waypoint mouse down triggered:', index);

    const onMouseMove = (e) => {
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            let currentWaypoints = edge.data?.waypoints || [];
            
            // If waypoints are empty but we have points, extract waypoints from the points
            if (currentWaypoints.length === 0) {
              const points = [sourcePoint, ...(edge.data?.waypoints || []), targetPoint];
              if (points && points.length > 2) {
                currentWaypoints = points.slice(1, -1);
                console.log('Extracted waypoints for dragging:', currentWaypoints);
              }
            }
            
            if (!currentWaypoints || currentWaypoints.length === 0 || index >= currentWaypoints.length) {
              return edge;
            }
            
            const newWaypoints = [...currentWaypoints];
            
            // Move the waypoint
            newWaypoints[index] = position;
            
            // Maintain orthogonality by adjusting adjacent waypoints
            if (index > 0) {
              const prevWaypoint = newWaypoints[index - 1];
              const currentWaypoint = newWaypoints[index];
              
              // Determine if the segment to the left is horizontal or vertical
              const isPrevHorizontal = Math.abs(prevWaypoint.y - currentWaypoint.y) < 5;
              
              if (isPrevHorizontal) {
                // Keep the previous waypoint at the same Y level
                newWaypoints[index - 1] = { ...prevWaypoint, y: currentWaypoint.y };
              } else {
                // Keep the previous waypoint at the same X level
                newWaypoints[index - 1] = { ...prevWaypoint, x: currentWaypoint.x };
              }
            }
            
            if (index < newWaypoints.length - 1) {
              const nextWaypoint = newWaypoints[index + 1];
              const currentWaypoint = newWaypoints[index];
              
              // Determine if the segment to the right is horizontal or vertical
              const isNextHorizontal = Math.abs(currentWaypoint.y - nextWaypoint.y) < 5;
              
              if (isNextHorizontal) {
                // Keep the next waypoint at the same Y level
                newWaypoints[index + 1] = { ...nextWaypoint, y: currentWaypoint.y };
              } else {
                // Keep the next waypoint at the same X level
                newWaypoints[index + 1] = { ...nextWaypoint, x: currentWaypoint.x };
              }
            }
            
            return { ...edge, data: { ...edge.data, waypoints: newWaypoints } };
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
  }, [id, setEdges, screenToFlowPosition, sourcePoint, targetPoint]);

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

  // Edge click handler
  const handleEdgeClick = useCallback((event) => {
    event.stopPropagation();
    console.log('Edge clicked:', id);
  }, [id]);

  // Edge mouse move handler for hover effects
  const handleEdgeMouseMove = useCallback((event) => {
    // Calculate which segment is being hovered
    const points = [sourcePoint, ...waypoints, targetPoint];
    const flowBounds = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - flowBounds.left;
    const mouseY = event.clientY - flowBounds.top;
    
    // Find the closest segment
    let closestSegment = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      if (!p1 || !p2) continue;
      
      // Calculate distance from mouse to line segment
      const A = mouseX - p1.x;
      const B = mouseY - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;
      
      let xx, yy;
      if (param < 0) {
        xx = p1.x;
        yy = p1.y;
      } else if (param > 1) {
        xx = p2.x;
        yy = p2.y;
      } else {
        xx = p1.x + param * C;
        yy = p1.y + param * D;
      }
      
      const dx = mouseX - xx;
      const dy = mouseY - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSegment = i;
      }
    }
    
    if (minDistance < 20) {
      setHoveredSegmentInfo({ segmentIndex: closestSegment, distance: minDistance });
    } else {
      setHoveredSegmentInfo(null);
    }
  }, [sourcePoint, targetPoint, waypoints]);

  // Edge mouse leave handler
  const handleEdgeMouseLeave = useCallback(() => {
    setHoveredSegmentInfo(null);
  }, []);

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

      {/* Draggable segments - Draw.io style */}
      {(() => {
        const points = [sourcePoint, ...waypoints, targetPoint];
        return points.slice(0, -1).map((p1, i) => {
          const p2 = points[i+1];
          if (!p1 || !p2) return null;
          
          const isHorizontal = Math.abs(p1.y - p2.y) < 5;
          const isVertical = Math.abs(p1.x - p2.x) < 5;
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

      {/* Hover waypoint preview */}
      {hoveredWaypoint && (
        <g className="react-flow__custom-edge-hover">
          <circle 
            cx={hoveredWaypoint.x} 
            cy={hoveredWaypoint.y} 
            r={4}
            fill="rgba(59, 130, 246, 0.5)" 
            stroke="rgb(59, 130, 246)" 
            strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}
    </>
  );
};

export default AdjustableEdge; 