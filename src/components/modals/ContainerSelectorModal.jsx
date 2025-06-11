import React from 'react';

const ContainerSelectorModal = ({ isOpen, title, message, containers, onSelect, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                    <div className="container-list">
                        {containers.length > 0 ? (
                            containers.map((container) => (
                                <div
                                    key={container.id}
                                    className="container-item"
                                    onClick={() => onSelect(container.id)}
                                >
                                    <div className="container-icon">{container.data.icon}</div>
                                    <div className="container-label">{container.data.label}</div>
                                </div>
                            ))
                        ) : (
                            <p>No containers available</p>
                        )}
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

export default ContainerSelectorModal;