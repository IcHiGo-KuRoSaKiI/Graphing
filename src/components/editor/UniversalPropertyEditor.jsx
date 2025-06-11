import React, { useState, useEffect, useCallback } from 'react';

const UniversalPropertyEditor = ({ selectedNode, selectedEdge, onElementPropertyChange }) => {
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

    // UI State
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        style: true,
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

    const handleNodeTextColorChange = useCallback((e) => {
        const value = e.target.value;
        setNodeTextColor(value);
        onElementPropertyChange('node', 'textColor', value);
    }, [onElementPropertyChange]);

    const handleNodeDescriptionChange = useCallback((e) => {
        const value = e.target.value;
        setNodeDescription(value);
        onElementPropertyChange('node', 'description', value);
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

    const handleNodeZIndexChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 1;
        setNodeZIndex(value);
        onElementPropertyChange('node', 'zIndex', value);
    }, [onElementPropertyChange]);

    // Edge property handlers
    const handleEdgeLabelChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeLabel(value);
        onElementPropertyChange('edge', 'label', value);
    }, [onElementPropertyChange]);

    const handleEdgeDescriptionChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeDescription(value);
        onElementPropertyChange('edge', 'description', value);
    }, [onElementPropertyChange]);

    const handleEdgeTypeChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeType(value);
        onElementPropertyChange('edge', 'type', value);
    }, [onElementPropertyChange]);

    const handleEdgeAnimatedChange = useCallback((e) => {
        const value = e.target.checked;
        setEdgeAnimated(value);
        onElementPropertyChange('edge', 'animated', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeWidthChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 1;
        setEdgeStrokeWidth(value);
        onElementPropertyChange('edge', 'style.strokeWidth', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeColorChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeStrokeColor(value);
        onElementPropertyChange('edge', 'style.stroke', value);
    }, [onElementPropertyChange]);

    const handleEdgeStrokeDasharrayChange = useCallback((e) => {
        const value = e.target.value;
        setEdgeStrokeDasharray(value);
        onElementPropertyChange('edge', 'style.strokeDasharray', value || undefined);
    }, [onElementPropertyChange]);

    const handleEdgeZIndexChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 1;
        setEdgeZIndex(value);
        onElementPropertyChange('edge', 'zIndex', value);
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

    if (!selectedNode && !selectedEdge) {
        return (
            <div className="universal-property-editor">
                <div className="property-editor-header">Properties</div>
                <div className="property-editor-content">
                    <div className="no-selection">
                        <p>Select an element to edit its properties</p>
                        <div className="help-text">
                            <strong>Tips:</strong>
                            <ul>
                                <li>Click nodes or edges to select them</li>
                                <li>Use Ctrl+C/V to copy/paste</li>
                                <li>Use Delete key to remove elements</li>
                                <li>Double-click to edit labels inline</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="universal-property-editor">
            <div className="property-editor-header">
                {selectedNode ? `${selectedNode.type || 'Node'} Properties` : 'Edge Properties'}
            </div>
            <div className="property-editor-content">

                {/* Basic Properties Section */}
                <div className="property-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('basic')}
                    >
                        <span className={`section-arrow ${expandedSections.basic ? 'expanded' : ''}`}>▶</span>
                        Basic Properties
                    </div>
                    {expandedSections.basic && (
                        <div className="section-content">
                            {/* Label/Name */}
                            <div className="property-group">
                                <label>Name/Label:</label>
                                <input
                                    type="text"
                                    value={selectedNode ? nodeLabel : edgeLabel}
                                    onChange={selectedNode ? handleNodeLabelChange : handleEdgeLabelChange}
                                    placeholder={selectedNode ? "Enter node name" : "Enter edge label"}
                                    className="enhanced-input"
                                />
                            </div>

                            {/* Description */}
                            <div className="property-group">
                                <label>Description:</label>
                                <textarea
                                    value={selectedNode ? nodeDescription : edgeDescription}
                                    onChange={selectedNode ? handleNodeDescriptionChange : handleEdgeDescriptionChange}
                                    placeholder="Enter description"
                                    rows={3}
                                    className="enhanced-textarea"
                                />
                            </div>

                            {/* Z-Index */}
                            <div className="property-group">
                                <label>Layer (Z-Index):</label>
                                <div className="input-with-controls">
                                    <input
                                        type="number"
                                        value={selectedNode ? nodeZIndex : edgeZIndex}
                                        onChange={selectedNode ? handleNodeZIndexChange : handleEdgeZIndexChange}
                                        min="0"
                                        max="1000"
                                        className="number-input"
                                    />
                                    <span className="input-help">Higher numbers appear on top</span>
                                </div>
                            </div>

                            {/* Node-specific: Icon */}
                            {selectedNode && (
                                <div className="property-group">
                                    <label>Icon:</label>
                                    <input
                                        type="text"
                                        value={nodeIcon}
                                        onChange={handleNodeIconChange}
                                        placeholder="Enter emoji or icon"
                                        className="enhanced-input"
                                    />
                                </div>
                            )}

                            {/* Edge-specific: Type */}
                            {selectedEdge && (
                                <div className="property-group">
                                    <label>Connection Type:</label>
                                    <select
                                        value={edgeType}
                                        onChange={handleEdgeTypeChange}
                                        className="enhanced-select"
                                    >
                                        <option value="default">Straight</option>
                                        <option value="step">Step</option>
                                        <option value="smoothstep">Smooth Step</option>
                                        <option value="straight">Direct</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Style Properties Section */}
                <div className="property-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('style')}
                    >
                        <span className={`section-arrow ${expandedSections.style ? 'expanded' : ''}`}>▶</span>
                        Style Properties
                    </div>
                    {expandedSections.style && (
                        <div className="section-content">
                            {selectedNode && (
                                <>
                                    {/* Node Colors */}
                                    <div className="property-group">
                                        <label>Background Color:</label>
                                        <div className="color-input-wrapper">
                                            <input
                                                type="color"
                                                value={nodeColor}
                                                onChange={handleNodeColorChange}
                                                className="color-picker"
                                            />
                                            <input
                                                type="text"
                                                value={nodeColor}
                                                onChange={handleNodeColorChange}
                                                placeholder="#ffffff"
                                                className="color-text"
                                            />
                                        </div>
                                    </div>

                                    <div className="property-group">
                                        <label>Border Color:</label>
                                        <div className="color-input-wrapper">
                                            <input
                                                type="color"
                                                value={nodeBorderColor}
                                                onChange={handleNodeBorderColorChange}
                                                className="color-picker"
                                            />
                                            <input
                                                type="text"
                                                value={nodeBorderColor}
                                                onChange={handleNodeBorderColorChange}
                                                placeholder="#dddddd"
                                                className="color-text"
                                            />
                                        </div>
                                    </div>

                                    <div className="property-group">
                                        <label>Text Color:</label>
                                        <div className="color-input-wrapper">
                                            <input
                                                type="color"
                                                value={nodeTextColor}
                                                onChange={handleNodeTextColorChange}
                                                className="color-picker"
                                            />
                                            <input
                                                type="text"
                                                value={nodeTextColor}
                                                onChange={handleNodeTextColorChange}
                                                placeholder="#000000"
                                                className="color-text"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedEdge && (
                                <>
                                    {/* Edge Colors and Style */}
                                    <div className="property-group">
                                        <label>Line Color:</label>
                                        <div className="color-input-wrapper">
                                            <input
                                                type="color"
                                                value={edgeStrokeColor}
                                                onChange={handleEdgeStrokeColorChange}
                                                className="color-picker"
                                            />
                                            <input
                                                type="text"
                                                value={edgeStrokeColor}
                                                onChange={handleEdgeStrokeColorChange}
                                                placeholder="#999999"
                                                className="color-text"
                                            />
                                        </div>
                                    </div>

                                    <div className="property-group">
                                        <label>Line Width:</label>
                                        <div className="range-input-wrapper">
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={edgeStrokeWidth}
                                                onChange={handleEdgeStrokeWidthChange}
                                                className="range-input"
                                            />
                                            <span className="range-value">{edgeStrokeWidth}px</span>
                                        </div>
                                    </div>

                                    <div className="property-group">
                                        <label>Line Style:</label>
                                        <div className="button-group">
                                            <button
                                                onClick={() => applyEdgePreset('solid')}
                                                className={`preset-button ${!edgeStrokeDasharray ? 'active' : ''}`}
                                            >
                                                Solid
                                            </button>
                                            <button
                                                onClick={() => applyEdgePreset('dashed')}
                                                className={`preset-button ${edgeStrokeDasharray === '5,5' ? 'active' : ''}`}
                                            >
                                                Dashed
                                            </button>
                                            <button
                                                onClick={() => applyEdgePreset('dotted')}
                                                className={`preset-button ${edgeStrokeDasharray === '2,2' ? 'active' : ''}`}
                                            >
                                                Dotted
                                            </button>
                                        </div>
                                    </div>

                                    <div className="property-group">
                                        <label>Custom Dash Pattern:</label>
                                        <input
                                            type="text"
                                            value={edgeStrokeDasharray}
                                            onChange={handleEdgeStrokeDasharrayChange}
                                            placeholder="e.g., 5,5 or 10,5,2,5"
                                            className="enhanced-input"
                                        />
                                        <span className="input-help">Comma-separated values</span>
                                    </div>

                                    <div className="property-group checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={edgeAnimated}
                                                onChange={handleEdgeAnimatedChange}
                                            />
                                            <span className="checkmark"></span>
                                            Animated
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Advanced Properties Section */}
                {selectedNode && (
                    <div className="property-section">
                        <div
                            className="section-header"
                            onClick={() => toggleSection('advanced')}
                        >
                            <span className={`section-arrow ${expandedSections.advanced ? 'expanded' : ''}`}>▶</span>
                            Icon Library
                        </div>
                        {expandedSections.advanced && (
                            <div className="section-content">
                                {Object.entries(emojiCategories).map(([category, emojis]) => (
                                    <div key={category} className="emoji-category">
                                        <div className="category-label">{category}</div>
                                        <div className="emoji-grid">
                                            {emojis.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    className={`emoji-button ${nodeIcon === emoji ? 'selected' : ''}`}
                                                    onClick={() => handleEmojiClick(emoji)}
                                                    type="button"
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
        </div>
    );
};

export default UniversalPropertyEditor;