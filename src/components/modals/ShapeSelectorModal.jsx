import React from 'react';

const ShapeSelectorModal = ({ isOpen, onSelect, onCancel }) => {
    if (!isOpen) return null;

    const shapes = [
        { id: 'component', label: 'Rectangle', icon: '🔹' },
        { id: 'circle', label: 'Circle', icon: '⭕' },
        { id: 'diamond', label: 'Diamond', icon: '♦️' },
        { id: 'hexagon', label: 'Hexagon', icon: '⬢' },
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Select Shape</h3>
                </div>
                <div className="modal-body">
                    <div className="shape-grid">
                        {shapes.map((shape) => (
                            <div
                                key={shape.id}
                                className="shape-item"
                                onClick={() => onSelect(shape.id)}
                            >
                                <div className="shape-icon">{shape.icon}</div>
                                <div className="shape-label">{shape.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="modal-button cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShapeSelectorModal;