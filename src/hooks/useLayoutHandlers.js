import { useCallback, useState } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { autoLayoutNodes } from '../components/utils/autoLayout';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for layout-related handlers
 * Extracts ~50 lines of layout logic from ArchitectureDiagramEditorContent
 */
export const useLayoutHandlers = (
    saveToHistory,
    reactFlowToJson,
    jsonToReactFlow,
    serviceFactory,
    isServiceInitialized
) => {
    const updateNodeInternals = useUpdateNodeInternals();
    const [currentLayoutAlgorithm, setCurrentLayoutAlgorithm] = useState('circular');

    // Get state from Zustand store
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const setNodes = useDiagramStore(state => state.setNodes);

    // Apply auto-layout with service layer fallback
    const applyAutoLayout = useCallback(async (currentNodes, algorithm = 'circular') => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            const laidOut = autoLayoutNodes(currentNodes, algorithm);
            setNodes(laidOut);
            laidOut.forEach(n => updateNodeInternals(n.id));
            return;
        }

        try {
            const diagramData = reactFlowToJson(currentNodes, edges);
            const result = await serviceFactory.layoutDiagram(diagramData, {
                algorithm: algorithm,
                options: { spacing: 50 }
            });

            if (result && result.success) {
                const { nodes: laidOutNodes } = jsonToReactFlow(result.diagramData);
                setNodes(laidOutNodes);
                laidOutNodes.forEach(n => updateNodeInternals(n.id));
            } else {
                const errorMessage = result?.error || 'Unknown layout error';
                console.error('Auto-layout failed:', errorMessage);
                // Fallback to old method
                const laidOut = autoLayoutNodes(currentNodes, algorithm);
                setNodes(laidOut);
                laidOut.forEach(n => updateNodeInternals(n.id));
            }
        } catch (error) {
            console.error('Error applying auto-layout:', error.message || error);
            // Fallback to old method
            const laidOut = autoLayoutNodes(currentNodes, algorithm);
            setNodes(laidOut);
            laidOut.forEach(n => updateNodeInternals(n.id));
        }
    }, [serviceFactory, isServiceInitialized, reactFlowToJson, edges, jsonToReactFlow, setNodes, updateNodeInternals]);

    // Simple auto-layout trigger
    const autoLayout = useCallback(() => {
        applyAutoLayout(nodes, currentLayoutAlgorithm);
        saveToHistory();
    }, [nodes, currentLayoutAlgorithm, saveToHistory, applyAutoLayout]);

    return {
        applyAutoLayout,
        autoLayout,
        currentLayoutAlgorithm,
        setCurrentLayoutAlgorithm
    };
};
