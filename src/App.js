import React, { useState } from 'react';

import { ArchitectureDiagramEditor } from './components';

function App() {
  const [mini, setMini] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleMini = () => setMini((m) => !m);

  return (
    <div className={`w-full h-screen overflow-hidden relative ${dark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>\
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
          <div className="w-80 h-64 border rounded shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            <ArchitectureDiagramEditor
              mode={dark ? 'dark' : 'light'}
              onToggleMini={toggleMini}
              showMiniToggle
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
