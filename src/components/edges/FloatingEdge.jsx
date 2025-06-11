import React from 'react';
import { BaseEdge, getBezierPath, useStore } from 'reactflow';
import { getEdgeParams } from './floatingUtils';

const FloatingEdge = ({ id, source, target, style }) => {
  const { sourceNode, targetNode } = useStore((s) => {
    const sourceNode = s.nodeLookup.get(source);
    const targetNode = s.nodeLookup.get(target);
    return { sourceNode, targetNode };
  });

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <BaseEdge id={id} path={path} style={style} />
  );
};

export default FloatingEdge;
