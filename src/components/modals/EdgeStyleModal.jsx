import React, { useState, useEffect } from 'react';

const EdgeStyleModal = ({ isOpen, edge, onConfirm, onCancel }) => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('default');
    const [animated, setAnimated] = useState(false);
    const [style, setStyle] = useState('solid');
    const [strokeWidth, setStrokeWidth] = useState(1);
    const [markerStart, setMarkerStart] = useState('none');
    const [markerEnd, setMarkerEnd] = useState('arrow');

    useEffect(() => {
        if (edge && isOpen) {
            setLabel(edge.data?.label || '');
            setType(edge.type || 'default');
            setAnimated(edge.animated || false);
            setStyle(edge.style?.strokeDasharray ? 'dashed' : 'solid');
            setStrokeWidth(edge.style?.strokeWidth || 1);
            setMarkerStart(edge.markerStart?.type || 'none');
            setMarkerEnd(edge.markerEnd?.type || 'arrow');
        }
    }, [edge, isOpen]);

    const handleConfirm = () => {
        const updatedEdge = {
            ...edge,
            data: { ...edge.data, label },
            type,
            animated,
            style: {
                ...edge.style,
                strokeWidth,
                strokeDasharray: style === 'dashed' ? '5,5' : undefined,
            },
            markerStart: markerStart !== 'none' ? { type: markerStart } : undefined,
            markerEnd: markerEnd !== 'none' ? { type: markerEnd } : undefined,
        };
        onConfirm(updatedEdge);
    };

    if (!isOpen || !edge) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Edge Style</h3>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Label:</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Edge Label"
                        />
                    </div>

                    <div className="form-group">
                        <label>Type:</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="default">Default</option>
                            <option value="step">Step</option>
                            <option value="smoothstep">Smooth Step</option>
                            <option value="straight">Straight</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Line Style:</label>
                        <select value={style} onChange={(e) => setStyle(e.target.value)}>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Line Width:</label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        />
                        <span>{strokeWidth}px</span>
                    </div>

                    <div className="form-group">
                        <label>Start Arrow:</label>
                        <select value={markerStart} onChange={(e) => setMarkerStart(e.target.value)}>
                            <option value="none">None</option>
                            <option value="arrow">Arrow</option>
                            <option value="arrowclosed">Filled Arrow</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>End Arrow:</label>
                        <select value={markerEnd} onChange={(e) => setMarkerEnd(e.target.value)}>
                            <option value="none">None</option>
                            <option value="arrow">Arrow</option>
                            <option value="arrowclosed">Filled Arrow</option>
                        </select>
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={animated}
                                onChange={(e) => setAnimated(e.target.checked)}
                            />
                            Animated
                        </label>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="modal-button cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="modal-button confirm" onClick={handleConfirm}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EdgeStyleModal;