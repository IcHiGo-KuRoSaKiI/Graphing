import React from 'react';
import { useReactFlow } from 'reactflow';

const ConnectionPreview = ({ connectionPreview, isVisible }) => {
  const { project } = useReactFlow();

  if (!isVisible || !connectionPreview) {
    return null;
  }

  const { source, target, isValid } = connectionPreview;

  // Project coordinates to screen space
  const sourceScreen = project({ x: source.x, y: source.y });
  const targetScreen = project({ x: target.x, y: target.y });

  const previewStyle = {
    stroke: isValid ? '#10b981' : '#ef4444',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    opacity: 0.8,
    pointerEvents: 'none',
    zIndex: 1000
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <line
        x1={sourceScreen.x}
        y1={sourceScreen.y}
        x2={targetScreen.x}
        y2={targetScreen.y}
        style={previewStyle}
      />
      
      {/* Connection point indicators */}
      <circle
        cx={sourceScreen.x}
        cy={sourceScreen.y}
        r={4}
        fill={isValid ? '#10b981' : '#ef4444'}
        opacity={0.8}
      />
      <circle
        cx={targetScreen.x}
        cy={targetScreen.y}
        r={4}
        fill={isValid ? '#10b981' : '#ef4444'}
        opacity={0.8}
      />
    </svg>
  );
};

export default ConnectionPreview; 