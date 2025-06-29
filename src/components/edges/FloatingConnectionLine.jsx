import React from 'react';
import { getBezierPath } from 'reactflow';
import { getEdgeParams } from './floatingUtils';

const FloatingConnectionLine = ({ fromX, fromY, toX, toY, fromPosition, toPosition, fromNode }) => {
  if (!fromNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    position: { x: toX, y: toY },
    positionAbsolute: { x: toX, y: toY },
    width: 1,
    height: 1,
  };

  const { sx, sy } = getEdgeParams(fromNode, targetNode);

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: fromPosition,
    targetPosition: toPosition,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} className="animated" d={path} />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

export default FloatingConnectionLine;
