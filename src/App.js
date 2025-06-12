import React from 'react';

import { ArchitectureDiagramEditor } from './components';

function App() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <ArchitectureDiagramEditor showThemeToggle />
    </div>
  );
}

export default App;