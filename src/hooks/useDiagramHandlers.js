import { useCallback, useRef } from 'react';
import { addEdge, reconnectEdge, applyNodeChanges, applyEdgeChanges, useUpdateNodeInternals, useReactFlow } from 'reactflow';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook that extracts all diagram handler logic
 * This massively reduces the main component by ~1000 lines
 */
export const useDiagramHandlers = () => {
    const updateNodeInternals = useUpdateNodeInternals();
    const { screenToFlowPosition } = useReactFlow();
    const saveTimeoutRef = useRef(null);

    // Get state from store
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const setNodes = useDiagramStore(state => state.setNodes);
    const setEdges = useDiagramStore(state => state.setEdges);
    const setSelectedElements = useDiagramStore(state => state.setSelectedElements);
    const pushToHistory = useDiagramStore(state => state.pushToHistory);

    const saveToHistory = useCallback(() => {
        pushToHistory({ nodes, edges });
    }, [nodes, edges, pushToHistory]);

    const handleNodesChange = useCallback((changes) => {
        setNodes(applyNodeChanges(changes, nodes));
    }, [nodes, setNodes]);

    const onEdgesChange = useCallback((changes) => {
        setEdges(applyEdgeChanges(changes, edges));
    }, [edges, setEdges]);

    const onConnect = useCallback((connection) => {
        setEdges(addEdge(connection, edges));
        saveToHistory();
    }, [edges, setEdges, saveToHistory]);

    const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
        setSelectedElements({ nodes: selectedNodes, edges: selectedEdges });
    }, [setSelectedElements]);

    const handleNodeLabelChange = useCallback((nodeId, label) => {
        setNodes(nodes.map((node) => {
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
        }));

        // Debounced history save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveToHistory();
        }, 500);
    }, [nodes, setNodes, saveToHistory]);

    return {
        handleNodesChange,
        onEdgesChange,
        onConnect,
        onSelectionChange,
        handleNodeLabelChange,
        saveToHistory,
        updateNodeInternals,
        screenToFlowPosition,
        saveTimeoutRef
    };
};
