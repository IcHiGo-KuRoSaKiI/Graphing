import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';

// Draw.io-style connection point styles
const drawioHandleStyle = {
    background: '#3b82f6',
    border: '2px solid #ffffff',
    width: 12,
    height: 12,
    borderRadius: '50%',
    zIndex: 10,
    cursor: 'crosshair',
    transition: 'all 0.2s ease',
    opacity: 0,
    transform: 'scale(0.8)',
};

const drawioHandleHoverStyle = {
    ...drawioHandleStyle,
    opacity: 1,
    transform: 'scale(1.2)',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
};

const ContainerNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Container');
    const [hoveredHandle, setHoveredHandle] = useState(null);

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

    // Draw.io-style connection point handlers
    const handleConnectionPointMouseEnter = useCallback((position) => {
        setHoveredHandle(position);
    }, []);

    const handleConnectionPointMouseLeave = useCallback(() => {
        setHoveredHandle(null);
    }, []);

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={200}
                minHeight={150}
                handleClassName="w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white shadow"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    background: data.color || '#f9f9f9',
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
                onMouseEnter={() => setHoveredHandle('node')}
                onMouseLeave={() => setHoveredHandle(null)}
            >
                <div
                    className="px-2 py-1 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-t-lg flex items-center gap-2"
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

                {/* Draw.io-style connection points - visible on hover */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top"
                    style={hoveredHandle === 'top' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('top')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right"
                    style={hoveredHandle === 'right' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('right')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom"
                    style={hoveredHandle === 'bottom' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('bottom')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left"
                    style={hoveredHandle === 'left' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('left')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Target handles for receiving connections */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    style={hoveredHandle === 'top' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('top')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    style={hoveredHandle === 'right' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('right')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    style={hoveredHandle === 'bottom' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('bottom')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    style={hoveredHandle === 'left' ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('left')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Show all connection points when node is hovered */}
                {hoveredHandle === 'node' && (
                    <>
                        <div
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '12px',
                                background: '#3b82f6',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                opacity: 0.6,
                                pointerEvents: 'none',
                                zIndex: 5,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                right: '-6px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '12px',
                                height: '12px',
                                background: '#3b82f6',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                opacity: 0.6,
                                pointerEvents: 'none',
                                zIndex: 5,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '-6px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '12px',
                                background: '#3b82f6',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                opacity: 0.6,
                                pointerEvents: 'none',
                                zIndex: 5,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: '-6px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '12px',
                                height: '12px',
                                background: '#3b82f6',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                opacity: 0.6,
                                pointerEvents: 'none',
                                zIndex: 5,
                            }}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default ContainerNode;