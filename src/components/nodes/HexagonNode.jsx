import React, { useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const HexagonNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Hexagon');
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
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    background: data.color || '#FFCC80',
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

                {/* Connection handles */}
                <Handle type="source" position={Position.Right} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" position={Position.Left} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 6, height: 6 }} />
                <Handle type="target" position={Position.Top} style={{ background: '#555', width: 6, height: 6 }} />
            </div>
        </>
    );
};

export default HexagonNode;