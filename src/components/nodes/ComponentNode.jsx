import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

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
                handleClassName="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow"
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
                    style={{
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
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
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: data.textColor || '#000' }}>{label}</span>
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

                {/* Connection handles */}
                <Handle type="source" id="right-source" position={Position.Right} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" id="right-target" position={Position.Right} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="source" id="left-source" position={Position.Left} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" id="left-target" position={Position.Left} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="source" id="bottom-source" position={Position.Bottom} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" id="bottom-target" position={Position.Bottom} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="source" id="top-source" position={Position.Top} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" id="top-target" position={Position.Top} style={{ background: '#555', width: 6, height: 6 }} />
            </div>
        </>
    );
};

export default ComponentNode;