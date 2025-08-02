import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { extractTechnicalDetails, getTechnicalColor } from '../utils/technicalDetailsParser';

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

const ComponentNode = ({ data, id, selected, isConnectable }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label || 'Component');
    const [hoveredHandle, setHoveredHandle] = useState(null);
    
    // Extract technical details for badges
    const technicalDetails = extractTechnicalDetails({ data });
    
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
                onMouseEnter={() => setHoveredHandle('node')}
                onMouseLeave={() => setHoveredHandle(null)}
            >
                <div
                    className="px-2 py-1 flex items-center gap-2 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-t relative"
                    onDoubleClick={handleDoubleClick}
                    style={{ 
                        minHeight: '32px',
                        position: 'relative',
                        zIndex: 2
                    }}
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
                        <span style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            color: data.textColor,
                            flex: 1,
                            paddingRight: '90px' // Space for badges
                        }} className={!data.textColor ? 'text-gray-800 dark:text-white' : ''}>
                            {label}
                        </span>
                    )}
                    
                    {/* Technical Details Badges - Positioned in header but not overlapping */}
                    <div className="technical-badges absolute top-1 right-1 flex gap-1 z-10">
                        {technicalDetails.protocol !== 'N/A' && (
                            <span className={`badge ${getTechnicalColor('protocol', technicalDetails.protocol.split(', ')[0])} text-xs px-1 py-0.5 rounded-full shadow-sm border border-white/20 backdrop-blur-sm`}>
                                {technicalDetails.protocol.split(', ')[0]}
                            </span>
                        )}
                        
                        {technicalDetails.security !== 'N/A' && (
                            <span className={`badge ${getTechnicalColor('security', technicalDetails.security.split(', ')[0])} text-xs px-1 py-0.5 rounded-full shadow-sm border border-white/20 backdrop-blur-sm`}>
                                {technicalDetails.security.split(', ')[0]}
                            </span>
                        )}
                        
                        {technicalDetails.performance.latency && (
                            <span className={`badge ${getTechnicalColor('performance', 'latency')} text-xs px-1 py-0.5 rounded-full shadow-sm border border-white/20 backdrop-blur-sm`}>
                                {technicalDetails.performance.latency}
                            </span>
                        )}
                    </div>
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
            </div>
        </>
    );
};
export default ComponentNode;