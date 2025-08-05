import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { ensureBackwardCompatibility } from '../utils/gradientUtils';
import { ensureShadowCompatibility } from '../utils/shadowUtils';
import { createTransformStyles } from '../utils/transformUtils';

const handleStyle = {
    background: '#3b82f6',
    border: '2px solid #fff',
    width: 8,
    height: 8,
    borderRadius: '50%',
    zIndex: 10,
    cursor: 'crosshair',
    transition: 'all 0.15s ease',
    opacity: 0.7,
};

const DiamondNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Diamond');

    useEffect(() => {
        setLabel(data.label || 'Diamond');
    }, [data.label]);

    const inputRef = useRef(null);

    const handleDoubleClick = useCallback((e) => {
        e.stopPropagation();
        setIsEditing(true);
    }, []);

    const handleLabelSubmit = useCallback(() => {
        setIsEditing(false);
        if (data.onLabelChange && label !== data.label) {
            data.onLabelChange(id, label);
        }
    }, [id, label, data]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleLabelSubmit();
        }
        if (e.key === 'Escape') {
            setLabel(data.label);
            setIsEditing(false);
        }
    }, [handleLabelSubmit, data.label]);

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={80}
                minHeight={80}
                handleClassName="w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    transform: 'rotate(45deg)',
                    background: ensureBackwardCompatibility(data.background || data.color || '#81D4FA'),
                    border: `${data.borderWidth || 2}px ${data.borderStyle || 'solid'} ${data.borderColor || '#ddd'}`,
                    opacity: data.opacity ?? 1,
                    ...createTransformStyles(data, 'diamond'),
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? `${ensureShadowCompatibility(data.boxShadow || 'none')}, 0 0 0 2px #2196F3` : ensureShadowCompatibility(data.boxShadow || 'none'),
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        transform: 'rotate(-45deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box'
                    }}
                    onDoubleClick={handleDoubleClick}
                >
                    {data.icon && <span style={{ fontSize: '14px' }}>{data.icon}</span>}
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            onBlur={handleLabelSubmit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            style={{
                                fontSize: '14px',
                                border: 'none',
                                borderBottom: '2px solid #2196F3',
                                outline: 'none',
                                background: 'transparent',
                                padding: '4px',
                                textAlign: 'center',
                                width: '100%'
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: '14px' }}>{label}</span>
                    )}
                </div>

                {/* Source handles for creating connections */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-source"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="diamond-handle"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-source"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="diamond-handle"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-source"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="diamond-handle"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-source"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="diamond-handle"
                />

                {/* Hidden target handles for receiving connections */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    style={{ opacity: 0, pointerEvents: 'none', width: 8, height: 8 }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    style={{ opacity: 0, pointerEvents: 'none', width: 8, height: 8 }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    style={{ opacity: 0, pointerEvents: 'none', width: 8, height: 8 }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    style={{ opacity: 0, pointerEvents: 'none', width: 8, height: 8 }}
                    isConnectable={isConnectable}
                />
            </div>
        </>
    );
};

export default DiamondNode;