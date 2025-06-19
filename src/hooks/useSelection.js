import { useState, useCallback } from 'react';

export const useSelection = (initialSelection = { nodes: [], connections: [] }) => {
  const [selection, setSelection] = useState(initialSelection);

  const clearSelection = useCallback(() => {
    setSelection({ nodes: [], connections: [] });
  }, []);

  return { selection, setSelection, clearSelection };
};
