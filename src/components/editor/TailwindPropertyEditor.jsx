// src/components/editor/TailwindPropertyEditor.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';

// Container preview component
const ContainerPreview = ({ 
    width, height, padding, borderRadius, borderWidth, 
    headerHeight, headerColor, contentColor, borderColor,
    headerFontSize, fontSize 
}) => {
    return (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</label>
            <div 
                style={{
                    width: Math.min(width * 0.4, 120),
                    height: Math.min(height * 0.4, 80),
                    border: `${borderWidth}px solid ${borderColor}`,
                    borderRadius: `${borderRadius}px`,
                    overflow: 'hidden',
                    backgroundColor: contentColor,
                    margin: '0 auto'
                }}
            >
                <div 
                    style={{
                        height: `${headerHeight * 0.4}px`,
                        backgroundColor: headerColor,
                        padding: `${padding * 0.4}px`,
                        fontSize: `${Math.max(headerFontSize * 0.4, 8)}px`,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: headerHeight > 0 ? `1px solid ${borderColor}` : 'none'
                    }}
                >
                    Sample Container
                </div>
                <div 
                    style={{
                        padding: `${padding * 0.4}px`,
                        fontSize: `${Math.max(fontSize * 0.4, 6)}px`,
                        color: '#666'
                    }}
                >
                    Content area
                </div>
            </div>
        </div>
    );
};

// Simple preview for the different intersection styles
const IntersectionStylePreview = ({ style, size = 40, className = '' }) => {
    const cx = size / 2;
    const cy = size / 2;
    const line = size * 0.7;
    const jump = 8;

    switch (style) {
        case 'arc':
            return (
                <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
                    <line x1={cx - line / 2} y1={cy} x2={cx + line / 2} y2={cy} stroke="#94a3b8" strokeWidth="2" />
                    <path d={`M ${cx} ${cy - line / 2} L ${cx} ${cy - jump / 2} Q ${cx + jump / 2} ${cy} ${cx} ${cy + jump / 2} L ${cx} ${cy + line / 2}`} stroke="#3b82f6" strokeWidth="2" fill="none" />
                </svg>
            );
        case 'sharp':
            return (
                <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
                    <line x1={cx - line / 2} y1={cy} x2={cx + line / 2} y2={cy} stroke="#94a3b8" strokeWidth="2" />
                    <path d={`M ${cx} ${cy - line / 2} L ${cx} ${cy - jump / 2} L ${cx + jump / 2} ${cy - jump / 2} L ${cx + jump / 2} ${cy + jump / 2} L ${cx} ${cy + jump / 2} L ${cx} ${cy + line / 2}`} stroke="#3b82f6" strokeWidth="2" fill="none" />
                </svg>
            );
        default:
            return (
                <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
                    <line x1={cx - line / 2} y1={cy} x2={cx + line / 2} y2={cy} stroke="#94a3b8" strokeWidth="2" />
                    <line x1={cx} y1={cy - line / 2} x2={cx} y2={cy + line / 2} stroke="#3b82f6" strokeWidth="2" />
                </svg>
            );
    }
};

// Small selector embedded in this file to avoid extra components
const IntersectionStyleSelector = ({ value, onChange, disabled = false }) => {
    const options = [
        { value: 'none', label: 'None' },
        { value: 'arc', label: 'Arc' },
        { value: 'sharp', label: 'Sharp' },
    ];

    const handleClick = (val) => {
        if (disabled) return;
        onChange({ target: { value: val } });
    };

    return (
        <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Intersections:</label>
            <div className="flex gap-2">
                {options.map((opt) => (
                    <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleClick(opt.value)}
                        className={`p-1 border rounded ${value === opt.value ? 'border-indigo-500' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400'}`}
                    >
                        <IntersectionStylePreview style={opt.value} size={32} />
                    </button>
                ))}
            </div>
        </div>
    );
};


const TailwindPropertyEditor = ({
    selectedNode,
    selectedEdge,
    onElementPropertyChange,
    minimized = false,
    onToggleMinimized = () => {},
    onClose = () => {}
}) => {
    // Node properties
    const [nodeLabel, setNodeLabel] = useState('');
    const [nodeIcon, setNodeIcon] = useState('');
    const [nodeTextColor, setNodeTextColor] = useState('#000000');
    const [nodeDescription, setNodeDescription] = useState('');
    const [nodeColor, setNodeColor] = useState('#ffffff');
    const [nodeBorderColor, setNodeBorderColor] = useState('#dddddd');
    const [nodeZIndex, setNodeZIndex] = useState(1);
    
    // Container-specific properties
    const [containerWidth, setContainerWidth] = useState(200);
    const [containerHeight, setContainerHeight] = useState(150);
    const [containerPadding, setContainerPadding] = useState(8);
    const [containerBorderRadius, setContainerBorderRadius] = useState(8);
    const [containerBorderWidth, setContainerBorderWidth] = useState(2);
    const [containerHeaderHeight, setContainerHeaderHeight] = useState(32);
    const [containerHeaderColor, setContainerHeaderColor] = useState('#f9f9f9');
    const [containerContentColor, setContainerContentColor] = useState('#ffffff');
    const [containerFontSize, setContainerFontSize] = useState(14);
    const [containerHeaderFontSize, setContainerHeaderFontSize] = useState(14);

    // Edge properties
    const [edgeLabel, setEdgeLabel] = useState('');
    const [edgeDescription, setEdgeDescription] = useState('');
    const [edgeType, setEdgeType] = useState('smoothstep');
    const [edgeAnimated, setEdgeAnimated] = useState(false);
    const [edgeStrokeWidth, setEdgeStrokeWidth] = useState(2);
    const [edgeStrokeColor, setEdgeStrokeColor] = useState('#999999');
    const [edgeStrokeDasharray, setEdgeStrokeDasharray] = useState('');
    const [edgeZIndex, setEdgeZIndex] = useState(5);
    const [edgeMarkerOption, setEdgeMarkerOption] = useState('end');
    const [edgeIntersection, setEdgeIntersection] = useState('none');

    // UI State
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        style: true,
        layout: false,
        container: false,
        advanced: false
    });

    // Common emojis with categories
    const emojiCategories = {
        'Tech': ['💻', '🖥️', '📱', '⌚', '📡', '🛰️', '💾', '💿', '📀', '🔌', '🔋', '🖨️', '⌨️', '🖱️', '💽'],
        'Network': ['🌐', '📶', '📡', '🔗', '⛓️', '🔒', '🔓', '🔐', '🔑', '🗝️', '📊', '📈', '📉', '📋', '📌'],
        'Data': ['📁', '📂', '🗂️', '📄', '📃', '📑', '📊', '📈', '📉', '📝', '📔', '📕', '📗', '📘', '📙'],
        'Tools': ['🔧', '🔨', '⚙️', '🛠️', '🗜️', '⚒️', '🧰', '🔩', '⚖️', '🧲', '⚗️', '🧪', '🧬', '🔬', '🔭'],
        'Shapes': ['🔷', '🔶', '🔵', '🟢', '🟡', '🟠', '🔴', '🟣', '⚫', '⚪', '🟤', '⭐', '✨', '💫', '🌟']
    };

    // Update local state when selection changes
    useEffect(() => {
        if (selectedNode?.data) {
            setNodeLabel(selectedNode.data.label || '');
            setNodeIcon(selectedNode.data.icon || '');
            setNodeTextColor(selectedNode.data.textColor || '#000000');
            setNodeDescription(selectedNode.data.description || '');
            setNodeColor(selectedNode.data.color || '#ffffff');
            setNodeBorderColor(selectedNode.data.borderColor || '#dddddd');
            setNodeZIndex(selectedNode.zIndex || selectedNode.style?.zIndex || 1);
            
            // Container-specific properties
            setContainerWidth(selectedNode.data.width || selectedNode.width || 200);
            setContainerHeight(selectedNode.data.height || selectedNode.height || 150);
            setContainerPadding(selectedNode.data.padding || 8);
            setContainerBorderRadius(selectedNode.data.borderRadius || 8);
            setContainerBorderWidth(selectedNode.data.borderWidth || 2);
            setContainerHeaderHeight(selectedNode.data.headerHeight || 32);
            setContainerHeaderColor(selectedNode.data.headerColor || '#f9f9f9');
            setContainerContentColor(selectedNode.data.contentColor || '#ffffff');
            setContainerFontSize(selectedNode.data.fontSize || 14);
            setContainerHeaderFontSize(selectedNode.data.headerFontSize || 14);
        }

        if (selectedEdge) {
            setEdgeLabel(selectedEdge.data?.label || selectedEdge.label || '');
            setEdgeDescription(selectedEdge.data?.description || '');
            setEdgeType(selectedEdge.type || 'smoothstep');
            setEdgeAnimated(selectedEdge.animated || false);
            setEdgeStrokeWidth(selectedEdge.style?.strokeWidth || 2);
            setEdgeStrokeColor(selectedEdge.style?.stroke || '#999999');
            setEdgeStrokeDasharray(selectedEdge.style?.strokeDasharray || '');
            setEdgeZIndex(selectedEdge.zIndex || selectedEdge.style?.zIndex || 5);
            const start = selectedEdge.markerStart?.type !== undefined ? selectedEdge.markerStart.type : 'none';
            const end = selectedEdge.markerEnd?.type !== undefined ? selectedEdge.markerEnd.type : 'none';
            if (start !== 'none' && end !== 'none') setEdgeMarkerOption('both');
            else if (start !== 'none') setEdgeMarkerOption('start');
            else if (end !== 'none') setEdgeMarkerOption('end');
            else setEdgeMarkerOption('none');
            setEdgeIntersection(selectedEdge.data?.intersection || 'none');
        }
    }, [selectedNode, selectedEdge]);

    // Toggle section expansion
    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    // Node property handlers
    const handleNodeLabelChange = useCallback((e) => {
        const value = e.target.value;
        setNodeLabel(value);
        onElementPropertyChange('node', 'label', value);
    }, [onElementPropertyChange]);

    const handleNodeIconChange = useCallback((e) => {
        const value = e.target.value;
        setNodeIcon(value);
        onElementPropertyChange('node', 'icon', value);
    }, [onElementPropertyChange]);

    const handleEmojiClick = useCallback((emoji) => {
        setNodeIcon(emoji);
        onElementPropertyChange('node', 'icon', emoji);
    }, [onElementPropertyChange]);

    // Quick style presets
    const applyEdgePreset = useCallback((preset) => {
        switch (preset) {
            case 'solid':
                setEdgeStrokeDasharray('');
                setEdgeStrokeWidth(2);
                onElementPropertyChange('edge', 'style.strokeDasharray', undefined);
                onElementPropertyChange('edge', 'style.strokeWidth', 2);
                break;
            case 'dashed':
                setEdgeStrokeDasharray('5,5');
                onElementPropertyChange('edge', 'style.strokeDasharray', '5,5');
                break;
            case 'dotted':
                setEdgeStrokeDasharray('2,2');
                onElementPropertyChange('edge', 'style.strokeDasharray', '2,2');
                break;
            case 'thick':
                setEdgeStrokeWidth(4);
                onElementPropertyChange('edge', 'style.strokeWidth', 4);
                break;
            default:
                break;
        }
    }, [onElementPropertyChange]);

    // Node handlers
    const handleNodeDescriptionChange = useCallback((e) => {
        const value = e.target.value;
        setNodeDescription(value);
        onElementPropertyChange('node', 'description', value);
    }, [onElementPropertyChange]);

    const handleNodeZIndexChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setNodeZIndex(value);
        onElementPropertyChange('node', 'zIndex', value);
    }, [onElementPropertyChange]);

    const handleNodeColorChange = useCallback((e) => {
        const value = e.target.value;
        setNodeColor(value);
        onElementPropertyChange('node', 'color', value);
    }, [onElementPropertyChange]);

    const handleNodeBorderColorChange = useCallback((e) => {
        const value = e.target.value;
        setNodeBorderColor(value);
        onElementPropertyChange('node', 'borderColor', value);
    }, [onElementPropertyChange]);

    const handleNodeTextColorChange = useCallback((e) => {
        const value = e.target.value;
        setNodeTextColor(value);
        onElementPropertyChange('node', 'textColor', value);
    }, [onElementPropertyChange]);
    
    // Container property handlers
    const handleContainerWidthChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 200;
        setContainerWidth(value);
        onElementPropertyChange('node', 'width', value);
    }, [onElementPropertyChange]);
    
    const handleContainerHeightChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 150;
        setContainerHeight(value);
        onElementPropertyChange('node', 'height', value);
    }, [onElementPropertyChange]);
    
    const handleContainerPaddingChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setContainerPadding(value);
        onElementPropertyChange('node', 'padding', value);
    }, [onElementPropertyChange]);
    
    const handleContainerBorderRadiusChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setContainerBorderRadius(value);
        onElementPropertyChange('node', 'borderRadius', value);
    }, [onElementPropertyChange]);
    
    const handleContainerBorderWidthChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 1;
        setContainerBorderWidth(value);
        onElementPropertyChange('node', 'borderWidth', value);
    }, [onElementPropertyChange]);
    
    const handleContainerHeaderHeightChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 20;
        setContainerHeaderHeight(value);
        onElementPropertyChange('node', 'headerHeight', value);
    }, [onElementPropertyChange]);
    
    const handleContainerHeaderColorChange = useCallback((e) => {
        const value = e.target.value;
        setContainerHeaderColor(value);
        onElementPropertyChange('node', 'headerColor', value);
    }, [onElementPropertyChange]);
    
    const handleContainerContentColorChange = useCallback((e) => {
        const value = e.target.value;
        setContainerContentColor(value);
        onElementPropertyChange('node', 'contentColor', value);
    }, [onElementPropertyChange]);
    
    const handleContainerFontSizeChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 12;
        setContainerFontSize(value);
        onElementPropertyChange('node', 'fontSize', value);
    }, [onElementPropertyChange]);
    
    const handleContainerHeaderFontSizeChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 12;
        setContainerHeaderFontSize(value);
        onElementPropertyChange('node', 'headerFontSize', value);
    }, [onElementPropertyChange]);

    // Edge handlers
    const handleEdgeLabel = useCallback((e) => {
        const value = e.target.value;
        setEdgeLabel(value);
        onElementPropertyChange('edge', 'label', value);
    }, [onElementPropertyChange]);

    const handleEdgeDescriptionChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeDescription(value);
        onElementPropertyChange('edge', 'description', value);
    }, [onElementPropertyChange]);

    const handleEdgeZIndexChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setEdgeZIndex(value);
        onElementPropertyChange('edge', 'zIndex', value);
    }, [onElementPropertyChange]);

    const handleEdgeTypeChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeType(value);
        onElementPropertyChange('edge', 'type', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeColorChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeStrokeColor(value);
        onElementPropertyChange('edge', 'style.stroke', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeWidthChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10) || 1;
        setEdgeStrokeWidth(value);
        onElementPropertyChange('edge', 'style.strokeWidth', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeDasharrayChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeStrokeDasharray(value);
        onElementPropertyChange('edge', 'style.strokeDasharray', value);
    }, [onElementPropertyChange]);

    const handleEdgeAnimatedChange = useCallback((e) => {
        const checked = e.target.checked;
        setEdgeAnimated(checked);
        onElementPropertyChange('edge', 'animated', checked);
    }, [onElementPropertyChange]);

    const handleEdgeMarkerChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeMarkerOption(value);
        switch (value) {
            case 'both':
                onElementPropertyChange('edge', 'markerStart', { type: 'arrow' });
                onElementPropertyChange('edge', 'markerEnd', { type: 'arrow' });
                break;
            case 'start':
                onElementPropertyChange('edge', 'markerStart', { type: 'arrow' });
                onElementPropertyChange('edge', 'markerEnd', undefined);
                break;
            case 'end':
                onElementPropertyChange('edge', 'markerStart', undefined);
                onElementPropertyChange('edge', 'markerEnd', { type: 'arrow' });
                break;
            default:
                onElementPropertyChange('edge', 'markerStart', undefined);
                onElementPropertyChange('edge', 'markerEnd', undefined);
                break;
        }
    }, [onElementPropertyChange]);

    // 👈 UPDATED: This handler now works with the new component
    const handleEdgeIntersectionChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeIntersection(value);
        onElementPropertyChange('edge', 'intersection', value);
    }, [onElementPropertyChange]);
    
    // Container preset functions
    const applyContainerPreset = useCallback((preset) => {
        switch (preset) {
            case 'small':
                setContainerWidth(150);
                setContainerHeight(100);
                onElementPropertyChange('node', 'width', 150);
                onElementPropertyChange('node', 'height', 100);
                break;
            case 'medium':
                setContainerWidth(200);
                setContainerHeight(150);
                onElementPropertyChange('node', 'width', 200);
                onElementPropertyChange('node', 'height', 150);
                break;
            case 'large':
                setContainerWidth(300);
                setContainerHeight(200);
                onElementPropertyChange('node', 'width', 300);
                onElementPropertyChange('node', 'height', 200);
                break;
            case 'wide':
                setContainerWidth(400);
                setContainerHeight(150);
                onElementPropertyChange('node', 'width', 400);
                onElementPropertyChange('node', 'height', 150);
                break;
            case 'tall':
                setContainerWidth(200);
                setContainerHeight(300);
                onElementPropertyChange('node', 'width', 200);
                onElementPropertyChange('node', 'height', 300);
                break;
            default:
                break;
        }
    }, [onElementPropertyChange]);

    if (!selectedNode && !selectedEdge) {
        return (
            <div className={`w-72 max-w-[90vw] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg ${minimized ? 'overflow-hidden' : 'h-full overflow-y-auto'}`}> 
                <div className="flex items-center justify-between py-3 px-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-semibold rounded-t-lg">
                    <span>Properties</span>
                    <div className="flex items-center space-x-1">
                        <button
                            className="p-1 hover:bg-white/10 rounded"
                            onClick={onToggleMinimized}
                            title={minimized ? 'Expand' : 'Minimize'}
                        >
                            {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button
                            className="p-1 hover:bg-white/10 rounded"
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                {!minimized && (
                <div className="p-4">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                        <p>Select an element to edit its properties</p>
                        <div className="mt-4 text-left text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <strong>Tips:</strong>
                            <ul className="mt-2 pl-5 list-disc">
                                <li className="mb-1">Click nodes or edges to select them</li>
                                <li className="mb-1">Use Ctrl+C/V to copy/paste</li>
                                <li className="mb-1">Use Delete key to remove elements</li>
                                <li className="mb-1">Double-click to edit labels inline</li>
                            </ul>
                        </div>
                    </div>
                </div>
                )}
            </div>
        );
    }

    return (
        <div className={`w-72 max-w-[90vw] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg ${minimized ? 'overflow-hidden' : 'h-full overflow-y-auto'}`}>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-semibold rounded-t-lg">
                <span>{selectedNode ? `${selectedNode.type || 'Node'} Properties` : 'Edge Properties'}</span>
                <div className="flex items-center space-x-1">
                    <button
                        className="p-1 hover:bg-white/10 rounded"
                        onClick={onToggleMinimized}
                        title={minimized ? 'Expand' : 'Minimize'}
                    >
                        {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                        className="p-1 hover:bg-white/10 rounded"
                        onClick={onClose}
                        title="Close"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
            {!minimized && (
                <div className="p-4">

                    {/* Basic Properties Section */}
                    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                            onClick={() => toggleSection('basic')}
                        >
                            <ChevronRight className={`mr-2 text-gray-500 transition-transform ${expandedSections.basic ? 'rotate-90' : ''}`} size={16} />
                            <span className="font-medium text-gray-700 dark:text-gray-200">Basic Properties</span>
                        </div>
                        {expandedSections.basic && (
                            <div className="p-4">
                                {/* Label/Name */}
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name/Label:</label>
                                    <input
                                        type="text"
                                        value={selectedNode ? nodeLabel : edgeLabel}
                                        onChange={selectedNode ? handleNodeLabelChange : handleEdgeLabel}
                                        placeholder={selectedNode ? "Enter node name" : "Enter edge label"}
                                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                                    <textarea
                                        value={selectedNode ? nodeDescription : edgeDescription}
                                        onChange={selectedNode ? handleNodeDescriptionChange : handleEdgeDescriptionChange}
                                        placeholder="Enter description"
                                        rows={3}
                                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                                    />
                                </div>

                                {/* Z-Index */}
                                <div className="mb-4">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Layer (Z-Index):</label>
                                    <div className="flex flex-col">
                                        <input
                                            type="number"
                                            value={selectedNode ? nodeZIndex : edgeZIndex}
                                            onChange={selectedNode ? handleNodeZIndexChange : handleEdgeZIndexChange}
                                            min="0"
                                            max="1000"
                                            className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Higher numbers appear on top</span>
                                    </div>
                                </div>

                                {/* Node-specific: Icon */}
                                {selectedNode && (
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Icon:</label>
                                        <input
                                            type="text"
                                            value={nodeIcon}
                                            onChange={handleNodeIconChange}
                                            placeholder="Enter emoji or icon"
                                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                {/* Edge-specific: Type */}
                                {selectedEdge && (
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Connection Type:</label>
                                        <select
                                            value={edgeType}
                                            onChange={handleEdgeTypeChange}
                                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="adjustable">Adjustable</option>
                                            <option value="default">Straight</option>
                                            <option value="step">Step</option>
                                            <option value="smoothstep">Smooth Step</option>
                                            <option value="straight">Direct</option>
                                        </select>
                                    </div>
                                )}
                                {selectedEdge && (
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Arrowheads:</label>
                                        <select
                                            value={edgeMarkerOption}
                                            onChange={handleEdgeMarkerChange}
                                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="end">Pointing to Target</option>
                                            <option value="start">Pointing from Target</option>
                                            <option value="both">Both Ends</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                )}

                                {selectedEdge && (
                                    <IntersectionStyleSelector
                                        value={edgeIntersection}
                                        onChange={handleEdgeIntersectionChange}
                                    />
                                )}

                            </div>
                        )}
                    </div>

                    {/* Style Properties Section */}
                    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                            onClick={() => toggleSection('style')}
                        >
                            <ChevronRight className={`mr-2 text-gray-500 transition-transform ${expandedSections.style ? 'rotate-90' : ''}`} size={16} />
                            <span className="font-medium text-gray-700 dark:text-gray-200">Style Properties</span>
                        </div>
                        {expandedSections.style && (
                            <div className="p-4">
                                {selectedNode && (
                                    <>
                                        {/* Node Colors */}
                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Background Color:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={nodeColor}
                                                    onChange={handleNodeColorChange}
                                                    className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={nodeColor}
                                                    onChange={handleNodeColorChange}
                                                    placeholder="#ffffff"
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Border Color:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={nodeBorderColor}
                                                    onChange={handleNodeBorderColorChange}
                                                    className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={nodeBorderColor}
                                                    onChange={handleNodeBorderColorChange}
                                                    placeholder="#dddddd"
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Text Color:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={nodeTextColor}
                                                    onChange={handleNodeTextColorChange}
                                                    className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={nodeTextColor}
                                                    onChange={handleNodeTextColorChange}
                                                    placeholder="#000000"
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedEdge && (
                                    <>
                                        {/* Edge Colors and Style */}
                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Line Color:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={edgeStrokeColor}
                                                    onChange={handleEdgeStrokeColorChange}
                                                    className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={edgeStrokeColor}
                                                    onChange={handleEdgeStrokeColorChange}
                                                    placeholder="#999999"
                                                    className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Line Width:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={edgeStrokeWidth}
                                                    onChange={handleEdgeStrokeWidthChange}
                                                    className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                />
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded">{edgeStrokeWidth}px</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Line Style:</label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => applyEdgePreset('solid')}
                                                    className={`px-3 py-1.5 text-sm border-2 rounded-md transition-all ${!edgeStrokeDasharray ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                >
                                                    Solid
                                                </button>
                                                <button
                                                    onClick={() => applyEdgePreset('dashed')}
                                                    className={`px-3 py-1.5 text-sm border-2 rounded-md transition-all ${edgeStrokeDasharray === '5,5' ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                >
                                                    Dashed
                                                </button>
                                                <button
                                                    onClick={() => applyEdgePreset('dotted')}
                                                    className={`px-3 py-1.5 text-sm border-2 rounded-md transition-all ${edgeStrokeDasharray === '2,2' ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                >
                                                    Dotted
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Custom Dash Pattern:</label>
                                            <input
                                                type="text"
                                                value={edgeStrokeDasharray}
                                                onChange={handleEdgeStrokeDasharrayChange}
                                                placeholder="e.g., 5,5 or 10,5,2,5"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">Comma-separated values</span>
                                        </div>

                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={edgeAnimated}
                                                        onChange={handleEdgeAnimatedChange}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-10 h-5 ${edgeAnimated ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'} rounded-full transition-colors`}></div>
                                                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${edgeAnimated ? 'transform translate-x-5' : ''}`}></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Animated</span>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Layout Properties Section - Container Specific */}
                    {selectedNode && selectedNode.type === 'container' && (
                        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                                onClick={() => toggleSection('layout')}
                            >
                                <ChevronRight className={`mr-2 text-gray-500 transition-transform ${expandedSections.layout ? 'rotate-90' : ''}`} size={16} />
                                <span className="font-medium text-gray-700 dark:text-gray-200">Layout & Dimensions</span>
                            </div>
                            {expandedSections.layout && (
                                <div className="p-4">
                                    {/* Size Presets */}
                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Size Presets:</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['small', 'medium', 'large', 'wide', 'tall'].map((preset) => (
                                                <button
                                                    key={preset}
                                                    onClick={() => applyContainerPreset(preset)}
                                                    className="px-3 py-1.5 text-sm border-2 rounded-md transition-all bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 capitalize"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Dimensions */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Width:</label>
                                            <input
                                                type="number"
                                                value={containerWidth}
                                                onChange={handleContainerWidthChange}
                                                min="50"
                                                max="1000"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Height:</label>
                                            <input
                                                type="number"
                                                value={containerHeight}
                                                onChange={handleContainerHeightChange}
                                                min="50"
                                                max="1000"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Padding */}
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Padding:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                value={containerPadding}
                                                onChange={handleContainerPaddingChange}
                                                className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                            />
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[45px] text-center">{containerPadding}px</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Container Style Properties */}
                    {selectedNode && selectedNode.type === 'container' && (
                        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                                onClick={() => toggleSection('container')}
                            >
                                <ChevronRight className={`mr-2 text-gray-500 transition-transform ${expandedSections.container ? 'rotate-90' : ''}`} size={16} />
                                <span className="font-medium text-gray-700 dark:text-gray-200">Container Styling</span>
                            </div>
                            {expandedSections.container && (
                                <div className="p-4">
                                    {/* Preview */}
                                    <ContainerPreview
                                        width={containerWidth}
                                        height={containerHeight}
                                        padding={containerPadding}
                                        borderRadius={containerBorderRadius}
                                        borderWidth={containerBorderWidth}
                                        headerHeight={containerHeaderHeight}
                                        headerColor={containerHeaderColor}
                                        contentColor={containerContentColor}
                                        borderColor={nodeBorderColor}
                                        headerFontSize={containerHeaderFontSize}
                                        fontSize={containerFontSize}
                                    />
                                    
                                    {/* Border Properties */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Border Radius:</label>
                                            <input
                                                type="number"
                                                value={containerBorderRadius}
                                                onChange={handleContainerBorderRadiusChange}
                                                min="0"
                                                max="50"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Border Width:</label>
                                            <input
                                                type="number"
                                                value={containerBorderWidth}
                                                onChange={handleContainerBorderWidthChange}
                                                min="0"
                                                max="10"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Header Properties */}
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Header Height:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="range"
                                                min="20"
                                                max="80"
                                                value={containerHeaderHeight}
                                                onChange={handleContainerHeaderHeightChange}
                                                className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                            />
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[45px] text-center">{containerHeaderHeight}px</span>
                                        </div>
                                    </div>

                                    {/* Header Color */}
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Header Color:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={containerHeaderColor}
                                                onChange={handleContainerHeaderColorChange}
                                                className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={containerHeaderColor}
                                                onChange={handleContainerHeaderColorChange}
                                                placeholder="#f9f9f9"
                                                className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Content Area Color */}
                                    <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Content Color:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={containerContentColor}
                                                onChange={handleContainerContentColorChange}
                                                className="w-12 h-10 p-0 border-2 border-gray-200 dark:border-gray-600 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={containerContentColor}
                                                onChange={handleContainerContentColorChange}
                                                placeholder="#ffffff"
                                                className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Typography */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Header Font Size:</label>
                                            <input
                                                type="number"
                                                value={containerHeaderFontSize}
                                                onChange={handleContainerHeaderFontSizeChange}
                                                min="8"
                                                max="32"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Content Font Size:</label>
                                            <input
                                                type="number"
                                                value={containerFontSize}
                                                onChange={handleContainerFontSizeChange}
                                                min="8"
                                                max="24"
                                                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Advanced Properties Section - Icon Library */}
                    {selectedNode && (
                        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                                onClick={() => toggleSection('advanced')}
                            >
                                <ChevronRight className={`mr-2 text-gray-500 transition-transform ${expandedSections.advanced ? 'rotate-90' : ''}`} size={16} />
                                <span className="font-medium text-gray-700 dark:text-gray-200">Icon Library</span>
                            </div>
                            {expandedSections.advanced && (
                                <div className="p-4">
                                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                                        <div key={category} className="mb-4">
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{category}</div>
                                            <div className="grid grid-cols-8 gap-1">
                                                {emojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        className={`w-8 h-8 flex items-center justify-center text-lg border-2 rounded transition-all ${nodeIcon === emoji
                                                            ? 'bg-indigo-500 border-indigo-600 transform scale-110 shadow-md'
                                                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:scale-110'
                                                            }`}
                                                        onClick={() => handleEmojiClick(emoji)}
                                                        title={emoji}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TailwindPropertyEditor;