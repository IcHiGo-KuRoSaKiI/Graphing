import React, { useState, useRef, useEffect } from 'react';

const JsonValidatorModal = ({ isOpen, title = 'JSON Schema Validator', onValidate, onClose }) => {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setResult(null);
      if (textareaRef.current) textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleValidate = () => {
    if (!onValidate) return;
    try {
      const data = JSON.parse(value);
      const { valid, errors } = onValidate(data);
      setResult(valid ? 'Valid JSON' : `Invalid: ${errors.join(', ')}`);
    } catch {
      setResult('Invalid JSON');
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
          {result && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{result}</p>}
        </div>
        <div className="modal-footer">
          <button className="modal-button cancel" onClick={onClose}>Close</button>
          <button className="modal-button confirm" onClick={handleValidate}>Validate</button>
        </div>
      </div>
    </div>
  );
};

export default JsonValidatorModal;
