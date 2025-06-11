import React, { useState, useRef, useEffect } from 'react';

const JsonPasteModal = ({ isOpen, title = 'Paste JSON', onConfirm, onCancel }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError(null);
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    try {
      const data = JSON.parse(value);
      if (onConfirm) onConfirm(data);
    } catch (e) {
      setError('Invalid JSON');
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-40 p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Paste JSON here"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="modal-button cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-button confirm" onClick={handleConfirm}>Import</button>
        </div>
      </div>
    </div>
  );
};

export default JsonPasteModal;
