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

const ContainerNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Container');

    useEffect(() => {
        setLabel(data.label || 'Container');
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
                minWidth={200}
                minHeight={150}
                handleClassName="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    background: data.color || '#f5f5f5',
                    border: `2px solid ${data.borderColor || '#ddd'}`,
                    borderRadius: '8px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 0 2px #2196F3' : '0 2px 4px rgba(0,0,0,0.1)',
                    boxSizing: 'border-box',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        padding: '8px',
                        borderBottom: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
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
                                width: '100%'
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</span>
                    )}
                </div>
                <div
                    style={{
                        flex: 1,
                        padding: '8px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {data.description && (
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '8px'
                            }}
                        >
                            {data.description}
                        </div>
                    )}
                </div>

                {/* Simplified connection handles - one per position that can act as both source and target */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="container-handle"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="container-handle"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="container-handle"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="container-handle"
                />

                {/* Target handles - invisible but active for connections */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={isConnectable}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    style={{ opacity: 0, pointerEvents: 'none' }}
                    isConnectable={isConnectable}
                />
            </div>
        </>
    );
};

export default ContainerNode;