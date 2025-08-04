import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { getShapeDefinition } from '../../config/ShapeDefinitions';

// Draw.io-style connection point styles (consistent with other nodes)
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
    boxShadow: 'none',
};

const UniversalShapeNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || '');
    const [hoveredHandle, setHoveredHandle] = useState(null);
    
    const shapeDefinition = getShapeDefinition(data.shapeType);
    
    const inputRef = useRef(null);

    // All hooks must be called before any conditional returns
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
            setLabel(data.label || shapeDefinition?.name || 'Shape');
            setIsEditing(false);
        }
    }, [handleLabelSubmit, data.label, shapeDefinition?.name]);

    const handleConnectionPointMouseEnter = useCallback((position) => {
        setHoveredHandle(position);
    }, []);

    const handleConnectionPointMouseLeave = useCallback(() => {
        setHoveredHandle(null);
    }, []);

    useEffect(() => {
        setLabel(data.label || shapeDefinition?.name || 'Shape');
    }, [data.label, shapeDefinition?.name]);

    // If shape definition not found, render error state
    if (!shapeDefinition) {
        console.warn(`Unknown shape type: ${data.shapeType}`);
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffebee',
                    border: '2px solid #f44336',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d32f2f',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '8px'
                }}
            >
                Unknown Shape: {data.shapeType}
            </div>
        );
    }

    // Render shape based on renderType
    const renderShape = () => {
        const mergedStyle = {
            ...shapeDefinition.style,
            ...data.style
        };

        switch (shapeDefinition.renderType) {
            case 'svg':
                return renderSVGShape(mergedStyle);
            case 'icon':
                return renderIconShape(mergedStyle);
            case 'custom':
                return renderCustomShape(mergedStyle);
            default:
                return renderDefaultShape(mergedStyle);
        }
    };

    const renderSVGShape = (style) => (
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${shapeDefinition.defaultSize.width} ${shapeDefinition.defaultSize.height}`}
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
        >
            <path
                d={shapeDefinition.svgPath}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                style={{ vectorEffect: 'non-scaling-stroke' }}
            />
        </svg>
    );

    const renderIconShape = (style) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: style.fill,
                border: `${style.strokeWidth}px solid ${style.stroke}`,
                borderRadius: style.borderRadius || '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            {shapeDefinition.icon && (
                <span style={{ 
                    fontSize: Math.min(data.width || 80, data.height || 80) * 0.4 + 'px',
                    lineHeight: '1'
                }}>
                    {shapeDefinition.icon}
                </span>
            )}
        </div>
    );

    const renderCustomShape = (style) => {
        // Handle special custom shapes like UML class
        if (shapeDefinition.id === 'uml-class') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: style.fill,
                        border: `${style.strokeWidth}px solid ${style.stroke}`,
                        borderRadius: style.borderRadius || '4px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Class name section */}
                    <div style={{
                        padding: '8px',
                        borderBottom: `1px solid ${style.stroke}`,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px'
                    }}>
                        {label || 'ClassName'}
                    </div>
                    {/* Attributes section */}
                    <div style={{
                        padding: '4px 8px',
                        borderBottom: `1px solid ${style.stroke}`,
                        fontSize: '10px',
                        minHeight: '20px'
                    }}>
                        {/* Placeholder for attributes */}
                    </div>
                    {/* Methods section */}
                    <div style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        flex: 1
                    }}>
                        {/* Placeholder for methods */}
                    </div>
                </div>
            );
        }

        // Default custom rendering
        return renderDefaultShape(style);
    };

    const renderDefaultShape = (style) => (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: style.fill,
                border: `${style.strokeWidth}px solid ${style.stroke}`,
                borderRadius: style.borderRadius || '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            {shapeDefinition.icon && !label && (
                <span style={{ fontSize: '24px' }}>{shapeDefinition.icon}</span>
            )}
        </div>
    );

    // Render connection points
    const renderConnectionPoints = () => {
        return shapeDefinition.connectionPoints.map(position => (
            <React.Fragment key={position}>
                <Handle
                    type="source"
                    position={Position[position.charAt(0).toUpperCase() + position.slice(1)]}
                    id={`${position}-source`}
                    style={hoveredHandle === position ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter(position)}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
                <Handle
                    type="target"
                    position={Position[position.charAt(0).toUpperCase() + position.slice(1)]}
                    id={`${position}-target`}
                    style={hoveredHandle === position ? drawioHandleHoverStyle : drawioHandleStyle}
                    isConnectable={isConnectable}
                    className="drawio-connection-point"
                    onMouseEnter={() => handleConnectionPointMouseEnter(position)}
                    onMouseLeave={handleConnectionPointMouseLeave}
                />
            </React.Fragment>
        ));
    };

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={shapeDefinition.defaultSize.width / 2}
                minHeight={shapeDefinition.defaultSize.height / 2}
                handleClassName="w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white"
                lineClassName="border-2 border-dashed border-indigo-500 opacity-60"
                nodeWidth={data.width}
                nodeHeight={data.height}
            />
            
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 0 2px #2196F3' : 'none',
                }}
                onMouseEnter={() => setHoveredHandle('node')}
                onMouseLeave={() => setHoveredHandle(null)}
                onDoubleClick={handleDoubleClick}
            >
                {renderShape()}
                
                {/* Text Label Overlay - only for shapes that need external labels */}
                {(label && shapeDefinition.renderType !== 'custom') && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: isEditing ? 'auto' : 'none',
                            zIndex: 10,
                            maxWidth: '90%',
                            textAlign: 'center'
                        }}
                    >
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                onBlur={handleLabelSubmit}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                style={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '2px solid #2196F3',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    minWidth: '60px'
                                }}
                            />
                        ) : (
                            <span style={{ 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: '#333',
                                background: 'rgba(255, 255, 255, 0.8)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                                lineHeight: '1.2'
                            }}>
                                {label}
                            </span>
                        )}
                    </div>
                )}
                
                {renderConnectionPoints()}
            </div>
        </>
    );
};

export default UniversalShapeNode;