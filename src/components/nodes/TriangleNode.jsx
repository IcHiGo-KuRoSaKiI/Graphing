import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

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
                handleClassName="w-2.5 h-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow"
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
                <Handle type="source" id="right-source" position={Position.Right} className="handle handle-source" isConnectable={isConnectable} />
                <Handle type="target" id="right-target" position={Position.Right} className="handle handle-target" isConnectable={isConnectable} />
                <Handle type="source" id="left-source" position={Position.Left} className="handle handle-source" isConnectable={isConnectable} />
                <Handle type="target" id="left-target" position={Position.Left} className="handle handle-target" isConnectable={isConnectable} />
                <Handle type="source" id="bottom-source" position={Position.Bottom} className="handle handle-source" isConnectable={isConnectable} />
                <Handle type="target" id="bottom-target" position={Position.Bottom} className="handle handle-target" isConnectable={isConnectable} />
                <Handle type="source" id="top-source" position={Position.Top} className="handle handle-source" isConnectable={isConnectable} />
                <Handle type="target" id="top-target" position={Position.Top} className="handle handle-target" isConnectable={isConnectable} />
            </div>
        </>
    );
};

export default TriangleNode;
