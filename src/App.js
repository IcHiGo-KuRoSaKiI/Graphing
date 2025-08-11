import React, { useState } from 'react';

import { ArchitectureDiagramEditor } from './components';
import DrawIoStyleTest from './components/test/DrawIoStyleTest';

function App() {
  const [mini, setMini] = useState(false);
  const [dark, setDark] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const toggleMini = () => setMini((m) => !m);
  const toggleTestMode = () => setTestMode((t) => !t);

  // Show test component if in test mode
  if (testMode) {
    return (
      <div className={`w-full h-screen overflow-hidden relative ${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={toggleTestMode}
          >
            🎨 Back to Editor
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <DrawIoStyleTest />
      </div>
    );
  }

  return (
    <div className={`w-full h-screen overflow-hidden relative ${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Test Mode Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
          onClick={toggleTestMode}
        >
          🧪 Test Mode
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {!mini && (
        <ArchitectureDiagramEditor
          mode={dark ? 'dark' : 'light'}
          showThemeToggle
          onToggleMini={toggleMini}
          showMiniToggle
          className="h-full"
        />
      )}

      {mini && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative border rounded shadow-lg overflow-hidden bg-white dark:bg-gray-800 w-[900px] h-[1200px]">
            <button
              className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700"
              onClick={toggleMini}
            >
              Full Editor
            </button>
            <button
              className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            <ArchitectureDiagramEditor
              mode={dark ? 'dark' : 'light'}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
