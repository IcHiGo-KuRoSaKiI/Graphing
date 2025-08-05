import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { ensureBackwardCompatibility } from '../utils/gradientUtils';
import { ensureShadowCompatibility } from '../utils/shadowUtils';
import { createTransformStyles } from '../utils/transformUtils';

// Draw.io-style connection point styles
const drawioHandleStyle = {
    background: '#3b82f6',
    border: '2px solid #ffffff',
    width: 14,
    height: 14,
    borderRadius: '50%',
    zIndex: 10,
    cursor: 'crosshair',
    transition: 'all 0.2s ease',
    opacity: 1,
    transform: 'scale(1)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

const drawioHandleHoverStyle = {
    ...drawioHandleStyle,
    opacity: 1,
    transform: 'scale(1.3)',
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.4)',
    background: '#2563eb',
};

const drawioHandleActiveStyle = {
    ...drawioHandleHoverStyle,
    background: '#10b981',
    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.4)',
};

const hiddenTargetHandleStyle = {
    opacity: 0,
    pointerEvents: 'none',
    width: 1,
    height: 1,
    background: 'transparent',
    border: 'none',
};

const ContainerNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Container');
    const [hoveredHandle, setHoveredHandle] = useState(null);
    const [activeHandle, setActiveHandle] = useState(null);

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

    // Enhanced connection point handlers
    const handleConnectionPointMouseEnter = useCallback((position) => {
        setHoveredHandle(position);
    }, []);

    const handleConnectionPointMouseLeave = useCallback(() => {
        setHoveredHandle(null);
    }, []);



    const getHandleStyle = useCallback((position) => {
        const baseStyle = { ...drawioHandleStyle };
        
        // Always show handles more prominently when node is selected or hovered
        if (selected || hoveredHandle === 'node') {
            baseStyle.opacity = 1;
            baseStyle.transform = 'scale(1.1)';
        }
        
        if (activeHandle === position) {
            return { ...baseStyle, ...drawioHandleActiveStyle };
        }
        if (hoveredHandle === position) {
            return { ...baseStyle, ...drawioHandleHoverStyle };
        }
        return baseStyle;
    }, [hoveredHandle, activeHandle, selected]);

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={200}
                minHeight={150}
                handleClassName="w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            <div
                style={{
                    background: ensureBackwardCompatibility(
                        data.background || data.contentColor || data.color || '#ffffff'
                    ),
                    border: `${data.borderWidth || 2}px ${data.borderStyle || 'solid'} ${data.borderColor || '#ddd'}`,
                    borderRadius: `${data.borderRadius || 8}px`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected 
                        ? `${ensureShadowCompatibility(data.boxShadow || 'none')}, 0 0 0 2px #2196F3`
                        : ensureShadowCompatibility(data.boxShadow || 'none'),
                    boxSizing: 'border-box',
                    position: 'relative',
                    fontSize: `${data.fontSize || 14}px`,
                    opacity: data.opacity ?? 1,
                    ...createTransformStyles(data, 'container')
                }}
                onMouseEnter={() => setHoveredHandle('node')}
                onMouseLeave={() => setHoveredHandle(null)}
            >
                <div
                    className="border-b border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 flex items-center gap-2"
                    style={{
                        background: ensureBackwardCompatibility(data.headerColor || '#f9f9f9'),
                        height: `${data.headerHeight || 32}px`,
                        padding: `${data.padding || 8}px`,
                        borderRadius: `${(data.borderRadius || 8) - 1}px ${(data.borderRadius || 8) - 1}px 0 0`,
                        fontSize: `${data.headerFontSize || 14}px`,
                        minHeight: '24px',
                        alignItems: 'center'
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
                                fontSize: `${data.headerFontSize || 14}px`,
                                border: 'none',
                                borderBottom: '2px solid #2196F3',
                                outline: 'none',
                                background: 'transparent',
                                padding: '4px',
                                width: '100%',
                                color: data.textColor || '#000000'
                            }}
                        />
                    ) : (
                        <span style={{ 
                            fontSize: `${data.headerFontSize || 14}px`, 
                            fontWeight: 'bold',
                            color: data.textColor || '#000000'
                        }}>{label}</span>
                    )}
                </div>
                <div
                    style={{
                        flex: 1,
                        padding: `${data.padding || 8}px`,
                        overflow: 'hidden',
                        position: 'relative',
                        fontSize: `${data.fontSize || 14}px`
                    }}
                >
                    {data.description && (
                        <div
                            style={{
                                fontSize: `${Math.max((data.fontSize || 14) - 2, 10)}px`,
                                color: data.textColor || '#666',
                                marginBottom: '8px',
                                lineHeight: '1.4'
                            }}
                        >
                            {data.description}
                        </div>
                    )}
                </div>

                {/* Draw.io-style connection points - Multiple points per side */}
                
                {/* Top connection points */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-left-source"
                    style={{...getHandleStyle('top'), left: '25%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('top')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-center-source"
                    style={{...getHandleStyle('top'), left: '50%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('top')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-right-source"
                    style={{...getHandleStyle('top'), left: '75%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('top')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Right connection points */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-top-source"
                    style={{...getHandleStyle('right'), top: '25%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('right')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-center-source"
                    style={{...getHandleStyle('right'), top: '50%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('right')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-bottom-source"
                    style={{...getHandleStyle('right'), top: '75%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('right')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Bottom connection points */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-left-source"
                    style={{...getHandleStyle('bottom'), left: '25%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('bottom')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-center-source"
                    style={{...getHandleStyle('bottom'), left: '50%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('bottom')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-right-source"
                    style={{...getHandleStyle('bottom'), left: '75%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('bottom')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Left connection points */}
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-top-source"
                    style={{...getHandleStyle('left'), top: '25%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('left')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-center-source"
                    style={{...getHandleStyle('left'), top: '50%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('left')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-bottom-source"
                    style={{...getHandleStyle('left'), top: '75%'}}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter('left')}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />

                {/* Hidden target handles for receiving connections */}
                {/* Top targets */}
                <Handle type="target" position={Position.Top} id="top-left-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Top} id="top-center-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Top} id="top-right-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                
                {/* Right targets */}
                <Handle type="target" position={Position.Right} id="right-top-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Right} id="right-center-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Right} id="right-bottom-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                
                {/* Bottom targets */}
                <Handle type="target" position={Position.Bottom} id="bottom-left-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Bottom} id="bottom-center-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Bottom} id="bottom-right-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                
                {/* Left targets */}
                <Handle type="target" position={Position.Left} id="left-top-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Left} id="left-center-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />
                <Handle type="target" position={Position.Left} id="left-bottom-target" style={hiddenTargetHandleStyle} isConnectable={isConnectable} />

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