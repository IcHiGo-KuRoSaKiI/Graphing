import React, { useState } from 'react';

import { ArchitectureDiagramEditor } from './components';

function App() {
  const [mini, setMini] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <div className={`w-full h-screen overflow-hidden relative ${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>\
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <button
          className="px-3 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          className="px-3 py-1 rounded border bg-white dark:bg-gray-800 dark:border-gray-700"
          onClick={() => setMini((m) => !m)}
        >
          {mini ? 'Hide Mini' : 'Show Mini'}
        </button>
      </div>

      <ArchitectureDiagramEditor mode={dark ? 'dark' : 'light'} showThemeToggle className="h-full" />

      {mini && (
        <div className="absolute bottom-4 right-4 w-80 h-64 border rounded shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <ArchitectureDiagramEditor mode={dark ? 'dark' : 'light'} />
        </div>
      )}
    </div>
  );
}

export default App;