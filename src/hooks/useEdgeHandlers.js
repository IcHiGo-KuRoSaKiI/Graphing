import { useCallback, useMemo } from 'react';
import { addEdge, reconnectEdge, useReactFlow } from 'reactflow';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for all edge-related handlers
 * Extracts ~150 lines of edge logic from ArchitectureDiagramEditorContent
 */
export const useEdgeHandlers = (saveToHistory) => {
    const { screenToFlowPosition } = useReactFlow();

    // Get state from Zustand store
    const nodes = useDiagramStore(state => state.nodes);
    const setEdges = useDiagramStore(state => state.setEdges);
    const setSelectedElements = useDiagramStore(state => state.setSelectedElements);
    const technicalDetailsEnabled = useDiagramStore(state => state.technicalDetailsEnabled || false);
    const setTechnicalDetailsPanelOpen = useDiagramStore(state => state.setTechnicalDetailsPanelOpen);
    const setSelectedElementForTechnicalDetails = useDiagramStore(state => state.setSelectedElementForTechnicalDetails);

    // Handle edge updates (reconnecting edges)
    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
    }, [setEdges]);

    // Handle edge update lifecycle
    const onEdgeUpdateStart = useCallback(() => { }, []);

    const onEdgeUpdateEnd = useCallback(() => {
        saveToHistory();
    }, [saveToHistory]);

    // Handle edge double click - adds waypoint at click position
    const onEdgeDoubleClick = useCallback((event, edge) => {
        event.preventDefault();
        event.stopPropagation();

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === edge.id) {
                    const newWaypoints = [...(e.data.waypoints || []), position];
                    return { ...e, data: { ...e.data, waypoints: newWaypoints } };
                }
                return e;
            })
        );
        saveToHistory();
    }, [screenToFlowPosition, setEdges, saveToHistory]);

    // Handle edge click - selects edge and opens panels
    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        setSelectedElements({
            nodes: [],
            edges: [edge],
        });

        // Update technical details only if enabled
        if (technicalDetailsEnabled) {
            setSelectedElementForTechnicalDetails({ ...edge, type: 'edge' });
            setTechnicalDetailsPanelOpen(true);
        }
    }, [technicalDetailsEnabled, setSelectedElements, setSelectedElementForTechnicalDetails, setTechnicalDetailsPanelOpen]);

    // Handle new connections between nodes
    const onConnect = useCallback((params) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        let defaultWaypoint = [];
        if (sourceNode && targetNode) {
            const sourceX = sourceNode.position.x + (sourceNode.width || 150) / 2;
            const sourceY = sourceNode.position.y + (sourceNode.height || 80) / 2;
            const targetX = targetNode.position.x + (targetNode.width || 150) / 2;
            const targetY = targetNode.position.y + (targetNode.height || 80) / 2;

            // Create orthogonal waypoints for step-like routing
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;

            // Create a simple L-shaped path (step routing)
            if (Math.abs(sourceX - targetX) > Math.abs(sourceY - targetY)) {
                // Horizontal routing preference
                defaultWaypoint = [
                    { x: midX, y: sourceY },
                    { x: midX, y: targetY }
                ];
            } else {
                // Vertical routing preference
                defaultWaypoint = [
                    { x: sourceX, y: midY },
                    { x: targetX, y: midY }
                ];
            }
        }

        const newEdge = {
            ...params,
            id: `edge-${Date.now()}`,
            type: 'enhanced',
            animated: true,
            style: {
                strokeWidth: 2,
                stroke: '#2563eb',
                strokeDasharray: '5 5',
                zIndex: 5
            },
            zIndex: 5,
            markerEnd: { type: 'arrow' },
            data: {
                label: '',
                description: '',
                intersection: 'none',
                waypoints: defaultWaypoint
            }
        };
        setEdges((eds) => addEdge(newEdge, eds));
        saveToHistory();
    }, [saveToHistory, nodes, setEdges]);

    // Connection lifecycle handlers
    const onConnectStart = useCallback(() => { }, []);
    const onConnectEnd = useCallback(() => { }, []);

    // Default edge options for new edges
    const defaultEdgeOptions = useMemo(() => ({
        type: 'enhanced',
        animated: true,
        style: { strokeWidth: 2, stroke: '#2563eb', strokeDasharray: '5 5' },
        data: { intersection: 'none' }
    }), []);

    return {
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        onEdgeDoubleClick,
        onEdgeClick,
        onConnect,
        onConnectStart,
        onConnectEnd,
        defaultEdgeOptions
    };
};
