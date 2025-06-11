import React, { useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from 'reactflow';

const AdjustableEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
    const { project, setEdges } = useReactFlow();

    const control = data?.control || {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2,
    };

    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        offset: 50,
    });

    const path = `M ${sourceX},${sourceY} Q ${control.x},${control.y} ${targetX},${targetY}`;

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

    return (
        <>
            <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
            <EdgeLabelRenderer>
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
