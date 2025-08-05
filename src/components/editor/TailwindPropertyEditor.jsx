// src/components/editor/TailwindPropertyEditor.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import GradientPicker from './GradientPicker';
import ShadowPicker from './ShadowPicker';
import { ensureBackwardCompatibility } from '../utils/gradientUtils';
import { ensureShadowCompatibility } from '../utils/shadowUtils';

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
    
    // Advanced styling state
    const [useAdvancedStyling, setUseAdvancedStyling] = useState(false);
    
    // Store original colors before applying gradients
    const [originalColors, setOriginalColors] = useState({
        background: null,
        headerColor: null,
        contentColor: null
    });
    
    // Shadow state
    const [nodeShadow, setNodeShadow] = useState('none');
    const [originalShadow, setOriginalShadow] = useState(null);

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
            
            // Initialize shadow state
            setNodeShadow(selectedNode.data.boxShadow || selectedNode.style?.boxShadow || 'none');
            
            // Auto-detect advanced styling mode
            const hasAdvancedBackground = selectedNode.data.background && 
                                        (selectedNode.data.background.includes('gradient') || 
                                         typeof selectedNode.data.background === 'object');
            const hasAdvancedHeaderBg = selectedNode.data.headerColor && 
                                      selectedNode.data.headerColor.includes('gradient');
            const hasAdvancedContentBg = selectedNode.data.contentColor && 
                                       selectedNode.data.contentColor.includes('gradient');
            const hasAdvancedShadow = selectedNode.data.boxShadow && 
                                    selectedNode.data.boxShadow !== 'none';
            
            setUseAdvancedStyling(hasAdvancedBackground || hasAdvancedHeaderBg || hasAdvancedContentBg || hasAdvancedShadow);
            
            // Store original simple colors for reversion
            setOriginalColors({
                background: selectedNode.data.color || '#ffffff',
                headerColor: (selectedNode.data.headerColor && !selectedNode.data.headerColor.includes('gradient')) 
                           ? selectedNode.data.headerColor 
                           : '#f9f9f9',
                contentColor: (selectedNode.data.contentColor && !selectedNode.data.contentColor.includes('gradient'))
                            ? selectedNode.data.contentColor 
                            : (selectedNode.data.color || '#ffffff')
            });
            
            // Store original shadow for reversion
            setOriginalShadow((!selectedNode.data.boxShadow || selectedNode.data.boxShadow === 'none') 
                            ? 'none' 
                            : null);
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
    
    // Advanced gradient handlers
    const handleAdvancedBackgroundChange = useCallback((gradientCss) => {
        // Store original color before first gradient application
        if (!selectedNode?.data?.background && originalColors.background === null) {
            setOriginalColors(prev => ({
                ...prev,
                background: nodeColor
            }));
        }
        
        // Store the CSS value - the components will handle rendering
        onElementPropertyChange('node', 'background', gradientCss);
        // Also update the simple color for backward compatibility
        if (typeof gradientCss === 'string' && gradientCss.startsWith('#')) {
            setNodeColor(gradientCss);
            onElementPropertyChange('node', 'color', gradientCss);
        }
    }, [onElementPropertyChange, selectedNode, nodeColor, originalColors.background]);
    
    const handleAdvancedHeaderBackgroundChange = useCallback((gradientCss) => {
        // Store original header color before first gradient application
        if (!selectedNode?.data?.headerColor?.includes('gradient') && originalColors.headerColor === null) {
            setOriginalColors(prev => ({
                ...prev,
                headerColor: containerHeaderColor
            }));
        }
        
        setContainerHeaderColor(gradientCss);
        onElementPropertyChange('node', 'headerColor', gradientCss);
    }, [onElementPropertyChange, selectedNode, containerHeaderColor, originalColors.headerColor]);
    
    const handleAdvancedContentBackgroundChange = useCallback((gradientCss) => {
        // Store original content color before first gradient application
        if (!selectedNode?.data?.contentColor?.includes('gradient') && originalColors.contentColor === null) {
            setOriginalColors(prev => ({
                ...prev,
                contentColor: containerContentColor
            }));
        }
        
        setContainerContentColor(gradientCss);
        onElementPropertyChange('node', 'contentColor', gradientCss);
    }, [onElementPropertyChange, selectedNode, containerContentColor, originalColors.contentColor]);
    
    // Shadow handlers
    const handleShadowChange = useCallback((shadowCss) => {
        // Store original shadow before first shadow application
        if ((!selectedNode?.data?.boxShadow || selectedNode?.data?.boxShadow === 'none') && originalShadow === null) {
            setOriginalShadow('none');
        }
        
        setNodeShadow(shadowCss);
        onElementPropertyChange('node', 'boxShadow', shadowCss);
    }, [onElementPropertyChange, selectedNode, originalShadow]);
    
    // Extract simple color from gradient or advanced background
    const extractSimpleColor = useCallback((background, fallback = '#ffffff') => {
        if (!background) return fallback;
        
        // If it's already a simple hex color, return it
        if (typeof background === 'string' && background.startsWith('#')) {
            return background;
        }
        
        // If it's a gradient string, try to extract the first color
        if (typeof background === 'string' && background.includes('gradient')) {
            const colorMatch = background.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgba?\([^)]+\)/);
            if (colorMatch) {
                return colorMatch[0];
            }
        }
        
        return fallback;
    }, []);

    // Handle advanced styling toggle
    const handleAdvancedStylingToggle = useCallback((enabled) => {
        setUseAdvancedStyling(enabled);
        
        if (!enabled) {
            // Revert to original colors when advanced styling is disabled
            
            // Revert main background to original color
            const originalBg = originalColors.background || nodeColor;
            setNodeColor(originalBg);
            onElementPropertyChange('node', 'color', originalBg);
            
            // Clear any advanced background properties
            onElementPropertyChange('node', 'background', undefined);
            
            // For containers, also revert header/content backgrounds
            if (selectedNode?.type === 'container') {
                const originalHeaderColor = originalColors.headerColor || '#f9f9f9';
                const originalContentColor = originalColors.contentColor || originalColors.background || '#ffffff';
                
                setContainerHeaderColor(originalHeaderColor);
                setContainerContentColor(originalContentColor);
                
                onElementPropertyChange('node', 'headerColor', originalHeaderColor);
                onElementPropertyChange('node', 'contentColor', originalContentColor);
            }
            
            // Revert shadow to original state
            const originalShadowValue = originalShadow || 'none';
            setNodeShadow(originalShadowValue);
            onElementPropertyChange('node', 'boxShadow', originalShadowValue);
            
            // Reset stored values for next time
            setOriginalColors({
                background: null,
                headerColor: null,
                contentColor: null
            });
            setOriginalShadow(null);
        }
    }, [onElementPropertyChange, selectedNode, nodeColor, originalColors, originalShadow]);

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
                                        {/* Advanced Styling Toggle */}
                                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={useAdvancedStyling}
                                                    onChange={(e) => handleAdvancedStylingToggle(e.target.checked)}
                                                    className="rounded"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Advanced Styling (Gradients & Effects)
                                                    </span>
                                                    {useAdvancedStyling && (
                                                        <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                                            Gradients active - toggle off to revert to simple colors
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Style Presets */}
                                        {useAdvancedStyling && (
                                            <div className="mb-4">
                                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Style Presets:
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Elegant */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                                                            handleShadowChange('0 4px 8px rgba(0, 0, 0, 0.12)');
                                                            onElementPropertyChange('node', 'borderRadius', 12);
                                                            onElementPropertyChange('node', 'opacity', 0.95);
                                                        }}
                                                        className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Elegant
                                                    </button>

                                                    {/* Modern */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('linear-gradient(to right, #00c6ff 0%, #0072ff 100%)');
                                                            handleShadowChange('0 8px 16px rgba(0, 114, 255, 0.2)');
                                                            onElementPropertyChange('node', 'borderWidth', 0);
                                                            onElementPropertyChange('node', 'borderRadius', 16);
                                                        }}
                                                        className="p-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Modern
                                                    </button>

                                                    {/* Soft */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('linear-gradient(to bottom right, #ffecd2 0%, #fcb69f 100%)');
                                                            handleShadowChange('0 2px 4px rgba(0, 0, 0, 0.08)');
                                                            onElementPropertyChange('node', 'borderWidth', 1);
                                                            onElementPropertyChange('node', 'borderColor', '#f0f0f0');
                                                        }}
                                                        className="p-3 bg-gradient-to-br from-orange-200 to-pink-200 text-gray-700 text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Soft
                                                    </button>

                                                    {/* Bold */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)');
                                                            handleShadowChange('0 6px 12px rgba(238, 90, 36, 0.3)');
                                                            onElementPropertyChange('node', 'borderWidth', 3);
                                                            onElementPropertyChange('node', 'borderColor', '#c44569');
                                                            onElementPropertyChange('node', 'scale', 1.05);
                                                        }}
                                                        className="p-3 bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Bold
                                                    </button>

                                                    {/* Glass */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('rgba(255, 255, 255, 0.2)');
                                                            handleShadowChange('0 8px 32px rgba(31, 38, 135, 0.37)');
                                                            onElementPropertyChange('node', 'borderWidth', 1);
                                                            onElementPropertyChange('node', 'borderColor', 'rgba(255, 255, 255, 0.18)');
                                                            onElementPropertyChange('node', 'borderRadius', 10);
                                                            onElementPropertyChange('node', 'opacity', 0.9);
                                                        }}
                                                        className="p-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 text-gray-700 text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Glass
                                                    </button>

                                                    {/* Dark */}
                                                    <button
                                                        onClick={() => {
                                                            handleAdvancedBackgroundChange('linear-gradient(135deg, #2c3e50 0%, #34495e 100%)');
                                                            handleShadowChange('0 4px 8px rgba(0, 0, 0, 0.3)');
                                                            onElementPropertyChange('node', 'borderWidth', 1);
                                                            onElementPropertyChange('node', 'borderColor', '#4a5568');
                                                            onElementPropertyChange('node', 'textColor', '#ffffff');
                                                        }}
                                                        className="p-3 bg-gradient-to-br from-gray-700 to-gray-800 text-white text-xs font-medium rounded shadow hover:shadow-md transition-all"
                                                    >
                                                        Dark
                                                    </button>
                                                </div>
                                                
                                                {/* Reset button */}
                                                <button
                                                    onClick={() => {
                                                        // Reset to defaults
                                                        handleAdvancedBackgroundChange(originalColors.background || '#ffffff');
                                                        handleShadowChange('none');
                                                        onElementPropertyChange('node', 'borderWidth', 2);
                                                        onElementPropertyChange('node', 'borderColor', '#dddddd');
                                                        onElementPropertyChange('node', 'borderRadius', 8);
                                                        onElementPropertyChange('node', 'opacity', 1);
                                                        onElementPropertyChange('node', 'scale', 1);
                                                        onElementPropertyChange('node', 'rotation', 0);
                                                        onElementPropertyChange('node', 'textColor', '#000000');
                                                    }}
                                                    className="w-full mt-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                                >
                                                    Reset to Default
                                                </button>
                                            </div>
                                        )}

                                        {/* Background */}
                                        {useAdvancedStyling ? (
                                            <GradientPicker
                                                label="Background"
                                                value={selectedNode.data?.background || nodeColor}
                                                onChange={handleAdvancedBackgroundChange}
                                            />
                                        ) : (
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
                                        )}

                                        {/* Shadow Effects */}
                                        {useAdvancedStyling && (
                                            <ShadowPicker
                                                label="Shadow Effects"
                                                value={selectedNode.data?.boxShadow || nodeShadow}
                                                onChange={handleShadowChange}
                                            />
                                        )}

                                        {/* Opacity Control */}
                                        {useAdvancedStyling && (
                                            <div className="mb-4">
                                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Opacity:
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={Math.round((selectedNode.data?.opacity ?? 1) * 100)}
                                                        onChange={(e) => onElementPropertyChange('node', 'opacity', parseFloat(e.target.value) / 100)}
                                                        className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                    />
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[50px] text-center">
                                                        {Math.round((selectedNode.data?.opacity ?? 1) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    {[0.25, 0.5, 0.75, 1].map(opacity => (
                                                        <button
                                                            key={opacity}
                                                            onClick={() => onElementPropertyChange('node', 'opacity', opacity)}
                                                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                                                Math.abs((selectedNode.data?.opacity ?? 1) - opacity) < 0.01
                                                                    ? 'bg-indigo-500 text-white'
                                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                            }`}
                                                        >
                                                            {Math.round(opacity * 100)}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Transform Effects */}
                                        {useAdvancedStyling && (
                                            <div className="mb-4">
                                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Transform Effects:
                                                </label>
                                                
                                                {/* Rotation */}
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Rotation:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range"
                                                            min="-180"
                                                            max="180"
                                                            value={selectedNode.data?.rotation || 0}
                                                            onChange={(e) => onElementPropertyChange('node', 'rotation', parseInt(e.target.value))}
                                                            className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                        />
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[45px] text-center">
                                                            {selectedNode.data?.rotation || 0}°
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 mt-2">
                                                        {[-90, -45, 0, 45, 90].map(rotation => (
                                                            <button
                                                                key={rotation}
                                                                onClick={() => onElementPropertyChange('node', 'rotation', rotation)}
                                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                                    (selectedNode.data?.rotation || 0) === rotation
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                                }`}
                                                            >
                                                                {rotation}°
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Scale */}
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Scale:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range"
                                                            min="0.25"
                                                            max="2"
                                                            step="0.05"
                                                            value={selectedNode.data?.scale || 1}
                                                            onChange={(e) => onElementPropertyChange('node', 'scale', parseFloat(e.target.value))}
                                                            className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                        />
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[50px] text-center">
                                                            {Math.round((selectedNode.data?.scale || 1) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 mt-2">
                                                        {[0.5, 0.75, 1, 1.25, 1.5].map(scale => (
                                                            <button
                                                                key={scale}
                                                                onClick={() => onElementPropertyChange('node', 'scale', scale)}
                                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                                    Math.abs((selectedNode.data?.scale || 1) - scale) < 0.01
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                                }`}
                                                            >
                                                                {Math.round(scale * 100)}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Reset Transform */}
                                                <button
                                                    onClick={() => {
                                                        onElementPropertyChange('node', 'rotation', 0);
                                                        onElementPropertyChange('node', 'scale', 1);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                                >
                                                    Reset Transform
                                                </button>
                                            </div>
                                        )}

                                        {/* Border Controls */}
                                        {useAdvancedStyling ? (
                                            <div className="mb-4">
                                                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Border Styling:</label>
                                                
                                                {/* Border Width */}
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Width:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="10"
                                                            value={selectedNode.data?.borderWidth || 2}
                                                            onChange={(e) => onElementPropertyChange('node', 'borderWidth', parseInt(e.target.value))}
                                                            className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                        />
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[40px] text-center">
                                                            {selectedNode.data?.borderWidth || 2}px
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Border Style */}
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Style:</label>
                                                    <select
                                                        value={selectedNode.data?.borderStyle || 'solid'}
                                                        onChange={(e) => onElementPropertyChange('node', 'borderStyle', e.target.value)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="solid">Solid</option>
                                                        <option value="dashed">Dashed</option>
                                                        <option value="dotted">Dotted</option>
                                                        <option value="double">Double</option>
                                                        <option value="groove">Groove</option>
                                                        <option value="ridge">Ridge</option>
                                                        <option value="inset">Inset</option>
                                                        <option value="outset">Outset</option>
                                                    </select>
                                                </div>

                                                {/* Border Color */}
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Color:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={nodeBorderColor}
                                                            onChange={handleNodeBorderColorChange}
                                                            className="w-10 h-8 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={nodeBorderColor}
                                                            onChange={handleNodeBorderColorChange}
                                                            placeholder="#dddddd"
                                                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Border Radius for applicable nodes */}
                                                {(selectedNode?.type === 'component' || selectedNode?.type === 'container') && (
                                                    <div className="mb-3">
                                                        <label className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Radius:</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="50"
                                                                value={selectedNode.data?.borderRadius || 8}
                                                                onChange={(e) => onElementPropertyChange('node', 'borderRadius', parseInt(e.target.value))}
                                                                className="flex-1 h-2 bg-gray-300 rounded-full appearance-none"
                                                            />
                                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded min-w-[40px] text-center">
                                                                {selectedNode.data?.borderRadius || 8}px
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
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
                                        )}

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

                                    {/* Header Background */}
                                    {useAdvancedStyling ? (
                                        <GradientPicker
                                            label="Header Background"
                                            value={containerHeaderColor}
                                            onChange={handleAdvancedHeaderBackgroundChange}
                                        />
                                    ) : (
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
                                    )}

                                    {/* Content Area Background */}
                                    {useAdvancedStyling ? (
                                        <GradientPicker
                                            label="Content Background"
                                            value={containerContentColor}
                                            onChange={handleAdvancedContentBackgroundChange}
                                        />
                                    ) : (
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
                                    )}

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