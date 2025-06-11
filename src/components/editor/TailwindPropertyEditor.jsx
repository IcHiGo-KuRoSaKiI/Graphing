// src/components/editor/TailwindPropertyEditor.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';

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


const TailwindPropertyEditor = ({ selectedNode, selectedEdge, onElementPropertyChange }) => {
    // Node properties
    const [nodeLabel, setNodeLabel] = useState('');
    const [nodeIcon, setNodeIcon] = useState('');
    const [nodeTextColor, setNodeTextColor] = useState('#000000');
    const [nodeDescription, setNodeDescription] = useState('');
    const [nodeColor, setNodeColor] = useState('#ffffff');
    const [nodeBorderColor, setNodeBorderColor] = useState('#dddddd');
    const [nodeZIndex, setNodeZIndex] = useState(1);

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
        advanced: false
    });
    const [minimized, setMinimized] = useState(false);

    const toggleMinimized = useCallback(() => {
        setMinimized((prev) => !prev);
    }, []);

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

    if (!selectedNode && !selectedEdge) {
        return (
            <div className="w-72 max-h-[calc(100vh-200px)] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-t-lg">
                    Properties
                </div>
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
            </div>
        );
    }

    return (
        <div className={`w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${minimized ? 'overflow-hidden' : 'max-h-[calc(100vh-200px)] overflow-y-auto'}`}>
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-t-lg">
                <span>{selectedNode ? `${selectedNode.type || 'Node'} Properties` : 'Edge Properties'}</span>
                <button className="text-xs" onClick={toggleMinimized}>{minimized ? 'Expand' : 'Minimize'}</button>
            </div>
            {!minimized && (
                <div className="p-4">

                    {/* Basic Properties Section */}
                    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 cursor-pointer"
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
                            className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 cursor-pointer"
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
                                                    className="flex-1 h-2 bg-gradient-to-r from-gray-300 to-indigo-500 rounded-full appearance-none"
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

                    {/* Advanced Properties Section - Icon Library */}
                    {selectedNode && (
                        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 cursor-pointer"
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