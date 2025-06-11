import React, { useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';

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
}) => {
    const { project, setEdges } = useReactFlow();

    const control = data?.control || {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
    };

    const intersection = data?.intersection || 'none';

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

    const path = intersection === 'curve' ? smoothPath : quadraticPath;

    const labelPosition = intersection === 'curve'
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

    const edgeStyle = intersection === 'join'
        ? { ...style, strokeLinejoin: 'round' }
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
            </EdgeLabelRenderer>
        </>
    );
};

export default AdjustableEdge;
