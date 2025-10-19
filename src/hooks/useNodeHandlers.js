import { useCallback, useRef } from 'react';
import { applyNodeChanges } from 'reactflow';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for all node-related handlers
 * Extracts node manipulation logic from ArchitectureDiagramEditorContent
 */
export const useNodeHandlers = (saveToHistory) => {
    const saveTimeoutRef = useRef(null);

    // Get state from Zustand store
    const setNodes = useDiagramStore(state => state.setNodes);
    const pushToHistory = useDiagramStore(state => state.pushToHistory);

    // Handle node changes (position, selection, etc.)
    const handleNodesChange = useCallback((changes) => {
        setNodes((nds) => {
            const updated = applyNodeChanges(changes, nds);
            return updated;
        });
    }, [setNodes]);

    // Handle node drag stop - save to history
    const onNodeDragStop = useCallback((event, node) => {
        const updatedNode = { ...node, position: node.position };
        setNodes(prevNodes =>
            prevNodes.map(n => n.id === node.id ? updatedNode : n)
        );
        saveToHistory();
    }, [saveToHistory, setNodes]);

    // Handle node label changes with debounced history save
    const handleNodeLabelChange = useCallback((nodeId, label) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label,
                        },
                    };
                }
                return node;
            })
        );

        // Debounced history save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            const store = useDiagramStore.getState();
            pushToHistory({ nodes: store.nodes, edges: store.edges });
        }, 500);
    }, [setNodes, pushToHistory]);

    return {
        handleNodesChange,
        onNodeDragStop,
        handleNodeLabelChange
    };
};
