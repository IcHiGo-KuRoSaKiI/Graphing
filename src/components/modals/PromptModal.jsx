import React, { useState, useEffect, useRef } from 'react';

const PromptModal = ({ isOpen, title, message, defaultValue, onConfirm, onCancel }) => {
    const [value, setValue] = useState(defaultValue || '');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        setValue(defaultValue || '');
    }, [isOpen, defaultValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(value);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="modal-input"
                        />
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="modal-button cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="modal-button confirm"
                        onClick={() => onConfirm(value)}
                        disabled={!value.trim()}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;