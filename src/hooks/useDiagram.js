import { useState, useCallback } from 'react';

export const useDiagram = (initialDiagram = { containers: [], nodes: [], connections: [] }) => {
  const [diagram, setDiagram] = useState(initialDiagram);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selection, setSelection] = useState({ nodes: [], connections: [] });

  const addToHistory = useCallback((newDiagram) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newDiagram);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const updateDiagram = useCallback((newDiagram) => {
    setDiagram(newDiagram);
    addToHistory(newDiagram);
  }, [addToHistory]);

  const addNode = useCallback((node) => {
    const newNode = {
      id: `node-${Date.now()}`,
      position: { x: 100, y: 100 },
      type: 'component',
      size: { width: 150, height: 80 },
      ...node
    };

    const newDiagram = {
      ...diagram,
      nodes: [...diagram.nodes, newNode]
    };

    updateDiagram(newDiagram);
  }, [diagram, updateDiagram]);

  const updateNode = useCallback((nodeId, changes) => {
    const newDiagram = {
      ...diagram,
      nodes: diagram.nodes.map(node =>
        node.id === nodeId ? { ...node, ...changes } : node
      )
    };

    updateDiagram(newDiagram);
  }, [diagram, updateDiagram]);

  const deleteNode = useCallback((nodeId) => {
    const newDiagram = {
      ...diagram,
      nodes: diagram.nodes.filter(node => node.id !== nodeId),
      connections: diagram.connections.filter(conn =>
        conn.source !== nodeId && conn.target !== nodeId
      )
    };

    updateDiagram(newDiagram);
  }, [diagram, updateDiagram]);

  const addConnection = useCallback((connection) => {
    const newConnection = {
      id: `connection-${Date.now()}`,
      type: 'floating',
      animated: false,
      ...connection
    };

    const newDiagram = {
      ...diagram,
      connections: [...diagram.connections, newConnection]
    };

    updateDiagram(newDiagram);
  }, [diagram, updateDiagram]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDiagram(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDiagram(history[newIndex]);
    }
  }, [history, historyIndex]);

  return {
    diagram,
    setDiagram: updateDiagram,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    selection,
    setSelection,
    clearSelection: () => setSelection({ nodes: [], connections: [] })
  };
};
