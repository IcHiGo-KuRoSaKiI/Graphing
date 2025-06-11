import React, { useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const DiamondNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Diamond');
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
                handleClassName="custom-resize-handle"
                lineClassName="custom-resize-line"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    transform: 'rotate(45deg)',
                    background: data.color || '#81D4FA',
                    border: `2px solid ${data.borderColor || '#ddd'}`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 0 2px #2196F3' : '0 2px 4px rgba(0,0,0,0.1)',
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

                {/* Connection handles */}
                <Handle type="source" position={Position.Right} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" position={Position.Left} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" position={Position.Top} style={{ background: '#555', width: 6, height: 6 }} />
            </div>
        </>
    );
};

export default DiamondNode;