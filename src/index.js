import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Enhanced ResizeObserver error suppression
const originalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class SafeResizeObserver extends originalResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      try {
        callback(entries, observer);
      } catch (error) {
        // Silently ignore ResizeObserver errors
        if (!error.message.includes('ResizeObserver')) {
          console.error('ResizeObserver error:', error);
        }
      }
    });
  }
};

// Comprehensive error suppression
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args[0];
  if (typeof errorMessage === 'string' && 
      (errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
       errorMessage.includes('ResizeObserver loop') ||
       errorMessage.includes('ResizeObserver'))) {
    return;
  }
  originalError.apply(console, args);
};

// Global error event listeners
window.addEventListener('error', (event) => {
  const errorMessage = event.error?.message || event.message || '';
  if (errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
      errorMessage.includes('ResizeObserver loop') ||
      errorMessage.includes('ResizeObserver')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || '';
  if (errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
      errorMessage.includes('ResizeObserver loop') ||
      errorMessage.includes('ResizeObserver')) {
    event.preventDefault();
    return false;
  }
});

// Additional React-specific error handler
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('bundle.js') && 
      event.message && event.message.includes('ResizeObserver')) {
    event.preventDefault();
    return false;
  }
});

// Suppress console warnings about ResizeObserver
const originalWarn = console.warn;
console.warn = (...args) => {
  const warningMessage = args[0];
  if (typeof warningMessage === 'string' && 
      (warningMessage.includes('ResizeObserver') || 
       warningMessage.includes('ResizeObserver loop'))) {
    return;
  }
  originalWarn.apply(console, args);
};

// Additional global error handler for any ResizeObserver related errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('ResizeObserver')) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Temporarily disabled StrictMode to reduce ResizeObserver issues
  <App />
);

