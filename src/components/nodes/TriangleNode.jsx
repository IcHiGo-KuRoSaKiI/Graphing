import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const handleStyle = {
    background: '#3b82f6',
    border: '2px solid #fff',
    width: 8,
    height: 8,
    borderRadius: '50%',
    zIndex: 10,
    cursor: 'crosshair',
    transition: 'all 0.15s ease',
};

const TriangleNode = ({ data, id, selected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Triangle');

    useEffect(() => {
        setLabel(data.label || 'Triangle');
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
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                    background: data.color || '#FFD54F',
                    border: `2px solid ${data.borderColor || '#ddd'}`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 0 2px #2196F3' : 'none',
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
                            width: '80%'
                        }}
                    />
                ) : (
                    <span style={{ fontSize: '14px' }}>{label}</span>
                )}

                {/* Simplified connection handles - one per position that can act as both source and target */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top"
                    style={handleStyle}
                    isConnectable={true}
                    className="triangle-handle"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right"
                    style={handleStyle}
                    isConnectable={true}
                    className="triangle-handle"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    style={handleStyle}
                    isConnectable={true}
                    className="triangle-handle"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left"
                    style={handleStyle}
                    isConnectable={true}
                    className="triangle-handle"
                />

                {/* Target handles - invisible but active for connections */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={true}
                />
            </div>
        </>
    );
};

export default TriangleNode;