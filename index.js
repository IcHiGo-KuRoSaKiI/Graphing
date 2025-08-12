// Automatically include the bundled styles when the library is imported
import './graphing.css';

export * from './components/index.js';

// Export a function to configure the library
export const configureGraphing = (options = {}) => {
  // Configure worker behavior globally
  if (options.useWorker !== undefined) {
    window.__GRAPHING_USE_WORKER__ = options.useWorker;
  }
  
  // Configure worker path if provided
  if (options.workerPath) {
    window.__GRAPHING_WORKER_PATH__ = options.workerPath;
  }
  
  console.log('🔧 Graphing: Library configured', {
    useWorker: window.__GRAPHING_USE_WORKER__,
    workerPath: window.__GRAPHING_WORKER_PATH__
  });
};
