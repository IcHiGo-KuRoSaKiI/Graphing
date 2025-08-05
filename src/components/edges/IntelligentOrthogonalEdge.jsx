import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import PathfindingEngine from '../../services/PathfindingEngine';
import GridSystem from '../../services/GridSystem';
import CollisionDetector from '../../services/CollisionDetector';

/**
 * Create a simple orthogonal path between two points
 */
const createSimpleOrthogonalPath = (start, end) => {
    const path = [start];
    
    // Create L-shaped path (horizontal first, then vertical)
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    
    if (dx > 10 && dy > 10) {
        const midX = start.x + (end.x - start.x) * 0.7; // 70% of the way
        path.push({ x: midX, y: start.y });
        path.push({ x: midX, y: end.y });
    } else if (dx > 10) {
        // Only horizontal movement needed
        const midX = start.x + (end.x - start.x) * 0.5;
        path.push({ x: midX, y: start.y });
    } else if (dy > 10) {
        // Only vertical movement needed
        const midY = start.y + (end.y - start.y) * 0.5;
        path.push({ x: start.x, y: midY });
    }
    
    path.push(end);
    return path;
};

/**
 * IntelligentOrthogonalEdge - Automatic orthogonal routing like draw.io
 * Provides intelligent pathfinding with collision avoidance and grid alignment
 */
const IntelligentOrthogonalEdge = ({
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
    const { getNodes, getEdges, setEdges } = useReactFlow();
    const [pathfindingEngine] = useState(() => new PathfindingEngine({ gridSize: 20, jettySize: 20 }));
    const [gridSystem] = useState(() => new GridSystem({ gridSize: 20 }));
    const [collisionDetector] = useState(() => new CollisionDetector({ gridSize: 20, nodeMargin: 20 }));
    const [isRoutingActive, setIsRoutingActive] = useState(true);

    // Get current nodes and edges for pathfinding
    const nodes = getNodes();
    const edges = getEdges();

    // Find source and target nodes
    const currentEdge = useMemo(() => {
        return edges.find(e => e.id === id);
    }, [edges, id]);

    const sourceNode = useMemo(() => {
        const sourceId = currentEdge?.source || data?.source;
        return nodes.find(n => n.id === sourceId);
    }, [nodes, currentEdge, data?.source]);

    const targetNode = useMemo(() => {
        const targetId = currentEdge?.target || data?.target;
        return nodes.find(n => n.id === targetId);
    }, [nodes, currentEdge, data?.target]);

    // Calculate optimal path using intelligent routing
    const optimalPath = useMemo(() => {
        if (!sourceNode || !targetNode || !isRoutingActive) {
            // Fallback to simple path if routing is disabled or nodes not found
            if (process.env.NODE_ENV === 'development') {
                console.warn('IntelligentOrthogonalEdge: Missing nodes or routing disabled', {
                    edgeId: id,
                    sourceNodeFound: !!sourceNode,
                    targetNodeFound: !!targetNode,
                    sourceId: currentEdge?.source || data?.source,
                    targetId: currentEdge?.target || data?.target,
                    isRoutingActive,
                    availableNodes: nodes.map(n => n.id)
                });
            }
            return [
                { x: sourceX, y: sourceY },
                { x: targetX, y: targetY }
            ];
        }

        try {
            // Get actual connection points from nodes with intelligent defaults
            const sourceHandle = currentEdge?.sourceHandle || 'right-source';
            const targetHandle = currentEdge?.targetHandle || 'left-target';
            
            const sourcePoint = pathfindingEngine.getConnectionPoint(sourceNode, sourceHandle);
            const targetPoint = pathfindingEngine.getConnectionPoint(targetNode, targetHandle);
            
            // Connection points calculated successfully

            // Update collision detection with current state
            collisionDetector.updateCollisionMap(
                nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id),
                edges.filter(e => e.id !== id)
            );

            // Try to find optimal orthogonal path
            let path;
            try {
                path = pathfindingEngine.findPath(
                    sourcePoint,
                    targetPoint,
                    [],
                    nodes.filter(n => n.id !== sourceNode.id && n.id !== targetNode.id)
                );
                
                // If pathfinding returns a valid path, use it
                if (path && path.length >= 2) {
                    const orthogonalPath = gridSystem.enforceOrthogonalPath(path);
                    if (orthogonalPath && orthogonalPath.length >= 2) {
                        return orthogonalPath;
                    }
                }
            } catch (pathError) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Pathfinding failed, using simple routing', pathError);
                }
            }
            
            // Fallback to simple orthogonal routing
            return createSimpleOrthogonalPath(sourcePoint, targetPoint);

        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('IntelligentOrthogonalEdge: Pathfinding failed, using fallback', error);
            }
            
            // Create simple orthogonal fallback using actual node positions if available
            let start, end;
            
            if (sourceNode && targetNode) {
                // Use node centers as fallback
                start = {
                    x: sourceNode.position.x + (sourceNode.width || 150) / 2,
                    y: sourceNode.position.y + (sourceNode.height || 100) / 2
                };
                end = {
                    x: targetNode.position.x + (targetNode.width || 150) / 2,
                    y: targetNode.position.y + (targetNode.height || 100) / 2
                };
            } else {
                // Final fallback to provided coordinates
                start = { x: sourceX, y: sourceY };
                end = { x: targetX, y: targetY };
            }
            
            const snappedStart = gridSystem.snapToGrid(start);
            const snappedEnd = gridSystem.snapToGrid(end);
            
            // Create a simple L-shaped path as final fallback
            const fallbackPath = [snappedStart];
            const dx = Math.abs(snappedEnd.x - snappedStart.x);
            const dy = Math.abs(snappedEnd.y - snappedStart.y);
            
            if (dx > 20 || dy > 20) {
                if (dx > dy) {
                    // Horizontal first
                    const midX = snappedStart.x + (snappedEnd.x - snappedStart.x) * 0.7;
                    fallbackPath.push({ x: midX, y: snappedStart.y });
                    fallbackPath.push({ x: midX, y: snappedEnd.y });
                } else {
                    // Vertical first
                    const midY = snappedStart.y + (snappedEnd.y - snappedStart.y) * 0.7;
                    fallbackPath.push({ x: snappedStart.x, y: midY });
                    fallbackPath.push({ x: snappedEnd.x, y: midY });
                }
            }
            
            fallbackPath.push(snappedEnd);
            return fallbackPath;
        }
    }, [
        sourceNode, targetNode, sourcePosition, targetPosition,
        sourceX, sourceY, targetX, targetY,
        nodes, edges, id, isRoutingActive,
        pathfindingEngine, gridSystem, collisionDetector,
        currentEdge?.source, currentEdge?.sourceHandle, currentEdge?.target, currentEdge?.targetHandle,
        data?.source, data?.target
    ]);

    // Auto-update edge data with calculated waypoints
    useEffect(() => {
        if (optimalPath.length > 2 && data && !data.manuallyEdited) {
            const waypoints = optimalPath.slice(1, -1); // Remove start and end points
            
            // Only update if waypoints have changed significantly
            const existingWaypoints = data.waypoints || [];
            const hasSignificantChange = waypoints.length !== existingWaypoints.length || 
                waypoints.some((wp, i) => {
                    const existing = existingWaypoints[i];
                    return !existing || Math.abs(wp.x - existing.x) > 5 || Math.abs(wp.y - existing.y) > 5;
                });

            if (hasSignificantChange) {
                setEdges(edges => edges.map(edge => {
                    if (edge.id === id) {
                        return {
                            ...edge,
                            data: {
                                ...edge.data,
                                waypoints,
                                autoRouted: true,
                                lastUpdated: Date.now()
                            }
                        };
                    }
                    return edge;
                }));
            }
        }
    }, [optimalPath, data, id, setEdges]);

    // Generate SVG path from optimal route - CRITICAL FIX
    const pathString = useMemo(() => {
        if (optimalPath.length < 2) {
            // If no path is available, create a simple direct line
            return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
        }
        
        let path = `M ${optimalPath[0].x},${optimalPath[0].y}`;
        
        for (let i = 1; i < optimalPath.length; i++) {
            path += ` L ${optimalPath[i].x},${optimalPath[i].y}`;
        }
        
        return path;
    }, [optimalPath, sourceX, sourceY, targetX, targetY]);

    // Final fallback - ensure we always have a valid path
    const finalPathString = useMemo(() => {
        if (pathString && pathString.length > 0) {
            return pathString;
        }
        // Ultimate fallback - direct line
        return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    }, [pathString, sourceX, sourceY, targetX, targetY]);

    // Calculate label position (center of path)
    const labelPosition = useMemo(() => {
        if (optimalPath.length < 2) {
            return { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };
        }
        
        const midIndex = Math.floor(optimalPath.length / 2);
        const midPoint = optimalPath[midIndex];
        
        return {
            x: midPoint.x,
            y: midPoint.y
        };
    }, [optimalPath, sourceX, sourceY, targetX, targetY]);

    // Handle manual routing toggle
    const toggleManualRouting = useCallback(() => {
        setIsRoutingActive(!isRoutingActive);
        
        setEdges(edges => edges.map(edge => {
            if (edge.id === id) {
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        manuallyEdited: isRoutingActive, // If turning off routing, mark as manually edited
                        autoRouted: !isRoutingActive
                    }
                };
            }
            return edge;
        }));
    }, [id, isRoutingActive, setEdges]);

    return (
        <>
            {/* Main edge path */}
            <BaseEdge
                id={id}
                path={finalPathString}
                style={{
                    ...style,
                    strokeWidth: selected ? 3 : 2,
                    stroke: selected ? '#2563eb' : (style.stroke || '#6b7280'),
                    strokeDasharray: data?.autoRouted ? 'none' : '5,5'
                }}
                markerStart={markerStart}
                markerEnd={markerEnd}
            />

            {/* Waypoint indicators for debugging */}
            {selected && optimalPath.length > 2 && (
                <g className="intelligent-waypoints">
                    {optimalPath.slice(1, -1).map((point, index) => (
                        <circle
                            key={`waypoint-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r={3}
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth={1}
                            className="waypoint-indicator"
                        />
                    ))}
                </g>
            )}

            {/* Grid alignment indicators */}
            {selected && gridSystem.showGrid && (
                <g className="grid-indicators">
                    {optimalPath.map((point, index) => (
                        <rect
                            key={`grid-${index}`}
                            x={point.x - 1}
                            y={point.y - 1}
                            width={2}
                            height={2}
                            fill="#ef4444"
                            className="grid-alignment-indicator"
                        />
                    ))}
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
                        color: '#374151',
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
                    className="nodrag nopan intelligent-edge-label"
                >
                    {data?.label || ''}
                    {selected && (
                        <button
                            onClick={toggleManualRouting}
                            style={{
                                marginLeft: '8px',
                                padding: '2px 4px',
                                fontSize: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '2px',
                                background: isRoutingActive ? '#10b981' : '#6b7280',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                            title={isRoutingActive ? 'Switch to manual routing' : 'Switch to automatic routing'}
                        >
                            {isRoutingActive ? 'AUTO' : 'MANUAL'}
                        </button>
                    )}
                </div>
            </EdgeLabelRenderer>

            {/* Path quality indicator */}
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            left: labelPosition.x + 100,
                            top: labelPosition.y - 20,
                            fontSize: '10px',
                            padding: '2px 4px',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            borderRadius: '2px',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                        }}
                        className="path-quality-indicator"
                    >
                        Segments: {optimalPath.length - 1} | 
                        Grid: {gridSystem.validateOrthogonalPath(optimalPath) ? '✓' : '✗'} |
                        Length: {Math.round(optimalPath.reduce((sum, point, i) => {
                            if (i === 0) return sum;
                            const prev = optimalPath[i - 1];
                            return sum + Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y);
                        }, 0))}px
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default IntelligentOrthogonalEdge;