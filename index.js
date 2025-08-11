// Automatically include the bundled styles when the library is imported
import './graphing.css';

export * from './components/index.js';

// Export a function to configure the library
export const configureGraphing = (options = {}) => {
  // Configure EdgeWorkerService globally
  if (options.workerPath) {
    // You could set this globally or pass it to components that need it
    window.__GRAPHING_WORKER_PATH__ = options.workerPath;
  }
};
