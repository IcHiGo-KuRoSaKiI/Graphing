import React, { useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, useEdges } from 'reactflow';

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

    const control = data?.control || {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
    };

    const intersection = data?.intersection || 'none';

    const edges = useEdges();

    const getIntersections = () => {
        const segs1 = [
            [sourceX, sourceY, control.x, control.y],
            [control.x, control.y, targetX, targetY],
        ];
        const res = [];
        edges.forEach((edge) => {
            if (edge.id === id) return;
            const c2 = edge.data?.control || {
                x: (edge.sourceX + edge.targetX) / 2,
                y: (edge.sourceY + edge.targetY) / 2,
            };
            const segs2 = [
                [edge.sourceX, edge.sourceY, c2.x, c2.y],
                [c2.x, c2.y, edge.targetX, edge.targetY],
            ];
            segs1.forEach((s1) => {
                segs2.forEach((s2) => {
                    const p = segmentIntersect(s1, s2);
                    if (p) res.push(p);
                });
            });
        });
        return res;
    };

    const segmentIntersect = (a, b) => {
        const [x1, y1, x2, y2] = a;
        const [x3, y3, x4, y4] = b;
        const s1_x = x2 - x1;
        const s1_y = y2 - y1;
        const s2_x = x4 - x3;
        const s2_y = y4 - y3;
        const s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = ( s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: x1 + (t * s1_x),
                y: y1 + (t * s1_y),
            };
        }
        return null;
    };

    const intersections = intersection === 'none' ? [] : getIntersections();

    const [smoothPath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        offset: 50,
    });

    const quadraticPath = `M ${sourceX},${sourceY} Q ${control.x},${control.y} ${targetX},${targetY}`;

    const path = intersection === 'arc' ? smoothPath : quadraticPath;

    const labelPosition = intersection === 'arc'
        ? { x: labelX, y: labelY }
        : {
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

    const edgeStyle = intersection === 'sharp'
        ? { ...style, strokeLinejoin: 'miter' }
        : style;

    const label = data?.label || '';

    return (
        <>
            <BaseEdge
                id={id}
                path={path}
                style={edgeStyle}
                markerStart={markerStart}
                markerEnd={markerEnd}
            />
            {intersections.map((p, idx) => (
                intersection === 'arc' ? (
                    <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={6}
                        fill="white"
                        stroke={edgeStyle.stroke || '#555'}
                        strokeWidth={edgeStyle.strokeWidth || 2}
                    />
                ) : (
                    <path
                        key={idx}
                        d={`M ${p.x - 6} ${p.y - 6} L ${p.x + 6} ${p.y + 6} M ${p.x - 6} ${p.y + 6} L ${p.x + 6} ${p.y - 6}`}
                        stroke={edgeStyle.stroke || '#555'}
                        strokeWidth={edgeStyle.strokeWidth || 2}
                    />
                )
            ))}
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
                <circle
                    className="cursor-move fill-white stroke-gray-600"
                    cx={control.x}
                    cy={control.y}
                    r={6}
                    onMouseDown={onMouseDown}
                />
                {selected && (
                    <>
                        <circle
                            cx={sourceX}
                            cy={sourceY}
                            r={5}
                            className="fill-white stroke-indigo-600"
                        />
                        <circle
                            cx={targetX}
                            cy={targetY}
                            r={5}
                            className="fill-white stroke-indigo-600"
                        />
                    </>
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default AdjustableEdge;
