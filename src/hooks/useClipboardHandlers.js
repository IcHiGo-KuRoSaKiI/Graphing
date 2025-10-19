import { useCallback } from 'react';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for clipboard operations (copy/paste/delete)
 * Extracts ~150 lines of clipboard logic from ArchitectureDiagramEditorContent
 */
export const useClipboardHandlers = (saveToHistory) => {
    // Get state from Zustand store
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const setNodes = useDiagramStore(state => state.setNodes);
    const setEdges = useDiagramStore(state => state.setEdges);
    const selectedElements = useDiagramStore(state => state.selectedElements);
    const setSelectedElements = useDiagramStore(state => state.setSelectedElements);
    const clipboardData = useDiagramStore(state => state.clipboardData);
    const setClipboardData = useDiagramStore(state => state.setClipboardData);

    // Simple copy selected elements
    const copySelected = useCallback(() => {
        if (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) {
            setClipboardData({
                nodes: selectedElements.nodes,
                edges: selectedElements.edges
            });
        }
    }, [selectedElements, setClipboardData]);

    // Enhanced copy function that includes connected edges
    const copySelectedWithLinks = useCallback(() => {
        if (selectedElements.nodes.length === 0) return;

        const selectedNodeIds = selectedElements.nodes.map(n => n.id);
        const copiedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
        const connectedEdges = edges.filter(
            edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
        );

        setClipboardData({
            nodes: copiedNodes,
            edges: connectedEdges
        });
    }, [selectedElements, edges, nodes, setClipboardData]);

    // Simple paste elements (with offset)
    const pasteElements = useCallback(() => {
        if (clipboardData) {
            const newNodes = clipboardData.nodes.map(node => ({
                ...node,
                id: `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50
                },
                selected: false
            }));

            const newEdges = clipboardData.edges.map(edge => ({
                ...edge,
                id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                selected: false
            }));

            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
            saveToHistory();
        }
    }, [clipboardData, saveToHistory, setNodes, setEdges]);

    // Enhanced paste function that preserves links between pasted elements
    const pasteElementsWithLinks = useCallback(() => {
        if (!clipboardData || clipboardData.nodes.length === 0) return;

        // Create a mapping from old IDs to new IDs
        const idMapping = {};

        // Create new nodes with new IDs
        const newNodes = clipboardData.nodes.map(node => {
            const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            idMapping[node.id] = newId;

            return {
                ...node,
                id: newId,
                parentNode: node.parentNode ? (idMapping[node.parentNode] || node.parentNode) : undefined,
                position: {
                    x: node.position.x + 50,
                    y: node.position.y + 50
                },
                selected: false
            };
        });

        // Create new edges with updated source and target IDs
        const newEdges = clipboardData.edges.map(edge => {
            const newSource = idMapping[edge.source];
            const newTarget = idMapping[edge.target];

            // Only create edges if both source and target nodes were copied
            if (newSource && newTarget) {
                return {
                    ...edge,
                    id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    source: newSource,
                    target: newTarget,
                    selected: false
                };
            }
            return null;
        }).filter(Boolean); // Filter out null edges

        setNodes((nds) => [...nds, ...newNodes]);
        setEdges(eds => [...eds, ...newEdges]);
        saveToHistory();
    }, [clipboardData, saveToHistory, setNodes, setEdges]);

    // Delete selected elements
    const deleteSelected = useCallback(() => {
        if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) return;

        const selectedNodeIds = selectedElements.nodes.map((node) => node.id);

        const edgesToKeep = edges.filter(
            (edge) =>
                !selectedNodeIds.includes(edge.source) &&
                !selectedNodeIds.includes(edge.target) &&
                !selectedElements.edges.map((e) => e.id).includes(edge.id)
        );

        const nodesToKeep = nodes.filter((node) => {
            return (
                !selectedNodeIds.includes(node.id) &&
                (!node.parentNode || !selectedNodeIds.includes(node.parentNode))
            );
        });

        setNodes(nodesToKeep);
        setEdges(edgesToKeep);
        setSelectedElements({ nodes: [], edges: [] });
        saveToHistory();
    }, [selectedElements, nodes, edges, saveToHistory, setNodes, setEdges, setSelectedElements]);

    return {
        copySelected,
        copySelectedWithLinks,
        pasteElements,
        pasteElementsWithLinks,
        deleteSelected,
        hasClipboard: clipboardData !== null && clipboardData.nodes.length > 0
    };
};
