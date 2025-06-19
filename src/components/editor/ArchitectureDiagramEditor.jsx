import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';
import useThemeStore from '../store/themeStore';

const ArchitectureDiagramEditor = ({
  value,
  defaultValue,
  onChange,
  onNodeChange,
  onConnectionChange,
  onSelectionChange,
  onError,
  style = {},
  className,
  mode = 'light',
  showThemeToggle = false,
  onToggleMini,
  showMiniToggle = false,
  ...restProps
}) => {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const isControlled = value !== undefined;
  const [internalDiagram, setInternalDiagram] = useState(
    defaultValue || { containers: [], nodes: [], connections: [] }
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setTheme(mode);
  }, [mode]);

  const currentDiagram = isControlled ? value : internalDiagram;

  const handleDiagramUpdate = useCallback(
    (newDiagram) => {
      if (!isControlled) {
        setInternalDiagram(newDiagram);
      }
      if (onChange) {
        onChange(newDiagram);
      }
    },
    [isControlled, onChange]
  );

  const handleNodeUpdate = useCallback(
    (nodeId, changes) => {
      const updatedDiagram = {
        ...currentDiagram,
        nodes: currentDiagram.nodes.map((node) =>
          node.id === nodeId ? { ...node, ...changes } : node
        ),
      };
      handleDiagramUpdate(updatedDiagram);
      if (onNodeChange) {
        onNodeChange(nodeId, changes);
      }
    },
    [currentDiagram, handleDiagramUpdate, onNodeChange]
  );

  const handleConnectionUpdate = useCallback(
    (connectionId, changes) => {
      const updatedDiagram = {
        ...currentDiagram,
        connections: currentDiagram.connections.map((conn) =>
          conn.id === connectionId ? { ...conn, ...changes } : conn
        ),
      };
      handleDiagramUpdate(updatedDiagram);
      if (onConnectionChange) {
        onConnectionChange(connectionId, changes);
      }
    },
    [currentDiagram, handleDiagramUpdate, onConnectionChange]
  );

  const handleSelectionUpdate = useCallback(
    (selection) => {
      if (onSelectionChange) {
        onSelectionChange(selection);
      }
    },
    [onSelectionChange]
  );

  const handleError = useCallback(
    (error) => {
      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  const combinedStyle = { width: '100%', height: '100%', ...style };
  const fullscreenStyle = isFullscreen
    ? { position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 1000 }
    : {};
  const modeClass = theme === 'dark' ? 'dark' : '';

  const handleToggleTheme = () => toggleTheme();
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const containerStyle = { ...combinedStyle, ...fullscreenStyle };

  return (
    <div style={containerStyle} className={`graphing ${className || ''}`} {...restProps}>
      <div
        className={`${modeClass} w-full h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative transition-colors`}
      >
        <ReactFlowProvider>
          <ArchitectureDiagramEditorContent
            diagram={currentDiagram}
            onToggleTheme={handleToggleTheme}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            showThemeToggle={showThemeToggle}
            onToggleMini={onToggleMini}
            showMiniToggle={showMiniToggle}
            onNodeChange={handleNodeUpdate}
            onConnectionChange={handleConnectionUpdate}
            onSelectionChange={handleSelectionUpdate}
            onDiagramChange={handleDiagramUpdate}
            onError={handleError}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default ArchitectureDiagramEditor;
