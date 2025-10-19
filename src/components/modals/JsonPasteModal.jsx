import React, { useState, useRef, useEffect } from 'react';

const JsonPasteModal = ({ isOpen, title = 'Paste JSON', onConfirm, onCancel }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError(null);
      setIsImporting(false);
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      setError(null);
      setIsImporting(true);
      const data = JSON.parse(value);
      if (onConfirm) await onConfirm(data);
      // Success - reset state (modal will close via parent)
      setIsImporting(false);
    } catch (e) {
      setError(e.message || 'Invalid JSON');
      setIsImporting(false);
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
          <button className="modal-button cancel" onClick={onCancel} disabled={isImporting}>Cancel</button>
          <button className="modal-button confirm" onClick={handleConfirm} disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonPasteModal;
