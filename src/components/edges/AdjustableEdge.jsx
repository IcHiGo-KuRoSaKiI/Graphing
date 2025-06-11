import React, { useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow, useNodes, useEdges } from 'reactflow';



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
    const { project, setEdges } = useReactFlow();

    // Get all edges and nodes to check for intersections
    const edges = useEdges();
    const nodes = useNodes();

    const control = data?.control || {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
    };

    const intersection = data?.intersection || 'none';

    // Helper function to get edge coordinates
    const getEdgeCoordinates = useCallback((edge) => {
        if (!nodes || nodes.length === 0) return null;

        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return null;

        const sourcePos = sourceNode.positionAbsolute || sourceNode.position;
        const targetPos = targetNode.positionAbsolute || targetNode.position;

        if (!sourcePos || !targetPos) return null;

        // Calculate center points of nodes
        const sourceWidth = sourceNode.measured?.width || sourceNode.style?.width || 150;
        const sourceHeight = sourceNode.measured?.height || sourceNode.style?.height || 80;
        const targetWidth = targetNode.measured?.width || targetNode.style?.width || 150;
        const targetHeight = targetNode.measured?.height || targetNode.style?.height || 80;

        return {
            sourceX: sourcePos.x + sourceWidth / 2,
            sourceY: sourcePos.y + sourceHeight / 2,
            targetX: targetPos.x + targetWidth / 2,
            targetY: targetPos.y + targetHeight / 2,
            control: edge.data?.control || {
                x: (sourcePos.x + sourceWidth / 2 + targetPos.x + targetWidth / 2) / 2,
                y: (sourcePos.y + sourceHeight / 2 + targetPos.y + targetHeight / 2) / 2,
            }
        };
    }, [nodes]);

    // Line-line intersection function
    const lineIntersection = useCallback((line1, line2) => {
        const [x1, y1, x2, y2] = line1;
        const [x3, y3, x4, y4] = line2;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-10) return null; // Lines are parallel

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1),
                t: t // Parameter along the first line
            };
        }
        return null;
    }, []);

    // Get intersections with other edges
    const intersections = useMemo(() => {
        if (intersection === 'none' || !edges || edges.length === 0) return [];

        const currentSegments = [
            [sourceX, sourceY, control.x, control.y],
            [control.x, control.y, targetX, targetY],
        ];

        const result = [];
        const seen = new Set();

        edges.forEach((edge) => {
            if (edge.id === id) return;

            const coords = getEdgeCoordinates(edge);
            if (!coords) return;

            const otherSegments = [
                [coords.sourceX, coords.sourceY, coords.control.x, coords.control.y],
                [coords.control.x, coords.control.y, coords.targetX, coords.targetY],
            ];

            currentSegments.forEach((currentSeg, segIndex) => {
                otherSegments.forEach((otherSeg) => {
                    const intersectionPoint = lineIntersection(currentSeg, otherSeg);
                    if (intersectionPoint) {
                        const key = `${segIndex}-${intersectionPoint.x.toFixed(1)}-${intersectionPoint.y.toFixed(1)}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            result.push({
                                ...intersectionPoint,
                                segmentIndex: segIndex
                            });
                        }
                    }
                });
            });
        });

        return result;
    }, [edges, id, sourceX, sourceY, targetX, targetY, control, intersection, getEdgeCoordinates, lineIntersection]);

    // Generate path with intersections
    const generatePathWithIntersections = useCallback(() => {
        if (intersection === 'none' || intersections.length === 0) {
            return `M ${sourceX},${sourceY} Q ${control.x},${control.y} ${targetX},${targetY}`;
        }

        const segments = [
            { start: { x: sourceX, y: sourceY }, end: { x: control.x, y: control.y } },
            { start: { x: control.x, y: control.y }, end: { x: targetX, y: targetY } }
        ];

        let pathParts = [];

        segments.forEach((segment, segIndex) => {
            const segmentIntersections = intersections
                .filter(int => int.segmentIndex === segIndex)
                .sort((a, b) => a.t - b.t);

            if (segmentIntersections.length === 0) {
                // No intersections, draw normal line
                if (segIndex === 0) {
                    pathParts.push(`M ${segment.start.x},${segment.start.y} L ${segment.end.x},${segment.end.y}`);
                } else {
                    pathParts.push(`L ${segment.end.x},${segment.end.y}`);
                }
                return;
            }

            // Draw segment with intersections
            let lastPoint = segment.start;

            if (segIndex === 0) {
                pathParts.push(`M ${lastPoint.x},${lastPoint.y}`);
            }

            segmentIntersections.forEach((int) => {
                const jumpSize = 12; // Size of the jump

                // Calculate direction vector
                const dx = segment.end.x - segment.start.x;
                const dy = segment.end.y - segment.start.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / length;
                const unitY = dy / length;

                // Calculate perpendicular vector
                const perpX = -unitY;
                const perpY = unitX;

                // Points before and after the intersection
                const beforeInt = {
                    x: int.x - unitX * jumpSize / 2,
                    y: int.y - unitY * jumpSize / 2
                };
                const afterInt = {
                    x: int.x + unitX * jumpSize / 2,
                    y: int.y + unitY * jumpSize / 2
                };

                // Draw line to before intersection
                pathParts.push(`L ${beforeInt.x},${beforeInt.y}`);

                if (intersection === 'arc') {
                    // Arc jump - create a semicircle
                    const controlPoint = {
                        x: int.x + perpX * jumpSize / 2,
                        y: int.y + perpY * jumpSize / 2
                    };
                    pathParts.push(`Q ${controlPoint.x},${controlPoint.y} ${afterInt.x},${afterInt.y}`);
                } else if (intersection === 'sharp') {
                    // Sharp jump - create an angular bridge
                    const peak1 = {
                        x: beforeInt.x + perpX * jumpSize / 2,
                        y: beforeInt.y + perpY * jumpSize / 2
                    };
                    const peak2 = {
                        x: afterInt.x + perpX * jumpSize / 2,
                        y: afterInt.y + perpY * jumpSize / 2
                    };
                    pathParts.push(`L ${peak1.x},${peak1.y} L ${peak2.x},${peak2.y} L ${afterInt.x},${afterInt.y}`);
                }

                lastPoint = afterInt;
            });

            // Draw remaining part of segment
            pathParts.push(`L ${segment.end.x},${segment.end.y}`);
        });

        return pathParts.join(' ');
    }, [sourceX, sourceY, targetX, targetY, control, intersection, intersections]);

    const path = generatePathWithIntersections();

    const labelPosition = {
        x: 0.25 * sourceX + 0.5 * control.x + 0.25 * targetX,
        y: 0.25 * sourceY + 0.5 * control.y + 0.25 * targetY,
    };

    const updateControl = useCallback((event) => {
        const flowBounds = document.querySelector('.react-flow');
        if (!flowBounds) return;
        const position = project({
            x: event.clientX - flowBounds.getBoundingClientRect().left,
            y: event.clientY - flowBounds.getBoundingClientRect().top,
        });
        setEdges((eds) =>
            eds.map((e) => (e.id === id ? { ...e, data: { ...e.data, control: position } } : e))
        );
    }, [id, project, setEdges]);

    const onMouseDown = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        const onMouseMove = (e) => updateControl(e);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [updateControl]);

    const label = data?.label || '';

    return (
        <>
            <BaseEdge
                id={id}
                path={path}
                style={style}
                markerStart={markerStart}
                markerEnd={markerEnd}
            />

            <EdgeLabelRenderer>
                {label && (
                    <div
                        style={{
                            position: 'absolute',
                            pointerEvents: 'none',
                            transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)`,
                            fontSize: 12,
                            padding: '2px 4px',
                            background: 'white',
                            border: '1px solid #999',
                            borderRadius: 4,
                            color: '#333',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {label}
                    </div>
                )}

                {/* Control point for adjusting the curve */}
                <circle
                    className="cursor-move fill-white stroke-gray-600 hover:stroke-indigo-500"
                    cx={control.x}
                    cy={control.y}
                    r={6}
                    strokeWidth={2}
                    onMouseDown={onMouseDown}
                    style={{ pointerEvents: 'all' }}
                />

                {/* Selection indicators */}
                {selected && (
                    <>
                        <circle
                            cx={sourceX}
                            cy={sourceY}
                            r={5}
                            className="fill-white stroke-indigo-600"
                            strokeWidth={2}
                        />
                        <circle
                            cx={targetX}
                            cy={targetY}
                            r={5}
                            className="fill-white stroke-indigo-600"
                            strokeWidth={2}
                        />
                    </>
                )}

                {/* Debug: Show intersection points */}
                {intersection !== 'none' && intersections.map((int, idx) => (
                    <circle
                        key={idx}
                        cx={int.x}
                        cy={int.y}
                        r={3}
                        className="fill-red-500 opacity-50"
                        style={{ pointerEvents: 'none' }}
                    />
                ))}
            </EdgeLabelRenderer>
        </>
    );
};

export default AdjustableEdge;