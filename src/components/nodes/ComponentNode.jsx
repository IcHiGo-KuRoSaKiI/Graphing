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

const ComponentNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Component');

    useEffect(() => {
        setLabel(data.label || 'Component');
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
                minWidth={100}
                minHeight={50}
                handleClassName="w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white shadow"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    background: data.color || '#E3F2FD',
                    border: `2px solid ${data.borderColor || '#ddd'}`,
                    borderRadius: '4px',
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
                    className="px-2 py-1 flex items-center gap-2 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-t"
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
                        <span
                            style={{ fontSize: '14px', fontWeight: 'bold', color: data.textColor }}
                            className={!data.textColor ? 'text-gray-800 dark:text-white' : ''}
                        >
                            {label}
                        </span>
                    )}
                </div>
                {data.description && (
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#666',
                            padding: '0 8px 8px 8px'
                        }}
                    >
                        {data.description}
                    </div>
                )}

                {/* Simplified connection handles - one per position that can act as both source and target */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="component-handle"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="component-handle"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="component-handle"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left"
                    style={handleStyle}
                    isConnectable={isConnectable}
                    className="component-handle"
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

export default ComponentNode;