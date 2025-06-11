import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

const sourceHandleStyle = {
    background: '#3b82f6',
    border: '2px solid #fff',
    width: 8,
    height: 8,
    borderRadius: '50%',
    zIndex: 10,
};

const targetHandleStyle = {
    background: '#1e40af',
    border: '2px solid #fff',
    width: 8,
    height: 8,
    borderRadius: '50%',
    zIndex: 10,
};

const CircleNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Circle');

    useEffect(() => {
        setLabel(data.label || 'Circle');
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
                    background: data.color || '#C5E1A5',
                    border: `2px solid ${data.borderColor || '#ddd'}`,
                    borderRadius: '50%',
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
                <Handle className="custom-handle" type="source" id="right-source" position={Position.Right} style={sourceHandleStyle} />
                <Handle className="custom-handle" type="target" id="right-target" position={Position.Right} style={targetHandleStyle} />
                <Handle className="custom-handle" type="source" id="left-source" position={Position.Left} style={sourceHandleStyle} />
                <Handle className="custom-handle" type="target" id="left-target" position={Position.Left} style={targetHandleStyle} />
                <Handle className="custom-handle" type="source" id="bottom-source" position={Position.Bottom} style={sourceHandleStyle} />
                <Handle className="custom-handle" type="target" id="bottom-target" position={Position.Bottom} style={targetHandleStyle} />
                <Handle className="custom-handle" type="source" id="top-source" position={Position.Top} style={sourceHandleStyle} />
                <Handle className="custom-handle" type="target" id="top-target" position={Position.Top} style={targetHandleStyle} />
            </div>
        </>
    );
};

export default CircleNode;