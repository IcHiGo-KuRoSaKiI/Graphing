import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Note: ResizeObserver errors are typically benign browser warnings
 * that occur when observations happen faster than the browser can process.
 * React Flow may trigger these during rapid resize operations.
 *
 * Instead of suppressing errors, we use React 18's error boundaries
 * and proper component lifecycle management to handle real issues.
 */

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

