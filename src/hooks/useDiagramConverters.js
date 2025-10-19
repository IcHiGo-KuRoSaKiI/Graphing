import { useCallback } from 'react';

/**
 * Custom hook for diagram format conversion (ReactFlow <-> JSON)
 * Extracts ~160 lines of conversion logic from ArchitectureDiagramEditorContent
 */
export const useDiagramConverters = (handleNodeLabelChange) => {
    // Convert ReactFlow format to JSON format
    const reactFlowToJson = useCallback((reactFlowNodes, reactFlowEdges) => {
        return {
            containers: reactFlowNodes
                .filter((node) => node.type === 'container')
                .map((container) => ({
                    id: container.id,
                    label: container.data.label,
                    position: container.position,
                    size: {
                        width: container.style?.width || 400,
                        height: container.style?.height || 300,
                    },
                    color: container.data.color,
                    bgColor: container.data.bgColor,
                    borderColor: container.data.borderColor,
                    icon: container.data.icon,
                    description: container.data.description,
                    zIndex: container.zIndex || 1
                })),
            nodes: reactFlowNodes
                .filter((node) => node.type !== 'container')
                .map((node) => ({
                    id: node.id,
                    label: node.data.label,
                    type: node.type,
                    position: node.position,
                    parentContainer: node.parentNode,
                    size: {
                        width: node.style?.width || 150,
                        height: node.style?.height || 80,
                    },
                    color: node.data.color,
                    borderColor: node.data.borderColor,
                    icon: node.data.icon,
                    description: node.data.description,
                    zIndex: node.zIndex || 10
                })),
            connections: reactFlowEdges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.data?.label,
                type: edge.type,
                animated: edge.animated,
                description: edge.data?.description,
                waypoints: edge.data?.waypoints,
                markerStart: edge.markerStart,
                markerEnd: edge.markerEnd,
                intersection: edge.data?.intersection,
                style: {
                    strokeWidth: edge.style?.strokeWidth || 2,
                    strokeDasharray: edge.style?.strokeDasharray,
                },
                zIndex: edge.zIndex || 5
            }))
        };
    }, []);

    // Convert JSON format to ReactFlow format
    const jsonToReactFlow = useCallback((data) => {
        const reactFlowNodes = [];
        const reactFlowEdges = [];

        // Convert containers
        if (data.containers) {
            data.containers.forEach(container => {
                reactFlowNodes.push({
                    id: container.id,
                    type: 'container',
                    position: container.position,
                    data: {
                        label: container.label,
                        color: container.color || '#f5f5f5',
                        bgColor: container.bgColor || '#f5f5f5',
                        borderColor: container.borderColor || '#ddd',
                        icon: container.icon,
                        description: container.description,
                        onLabelChange: handleNodeLabelChange
                    },
                    style: {
                        width: container.size?.width || 400,
                        height: container.size?.height || 300,
                        zIndex: container.zIndex || 1,
                    },
                    draggable: true,
                    selectable: true,
                    zIndex: container.zIndex || 1
                });
            });
        }

        // Convert nodes
        if (data.nodes) {
            data.nodes.forEach(node => {
                reactFlowNodes.push({
                    id: node.id,
                    type: 'component',
                    position: node.position,
                    parentNode: node.parentContainer,
                    data: {
                        label: node.label,
                        color: node.color || '#E3F2FD',
                        borderColor: node.borderColor || '#90CAF9',
                        icon: node.icon,
                        description: node.description,
                        onLabelChange: handleNodeLabelChange
                    },
                    style: {
                        width: node.size?.width || 150,
                        height: node.size?.height || 80,
                        zIndex: node.zIndex || 10,
                    },
                    draggable: true,
                    selectable: true,
                    zIndex: node.zIndex || 10
                });
            });
        }

        // Convert connections
        if (data.connections) {
            data.connections.forEach(connection => {
                // Convert old control points to waypoints and ensure we use adjustable edge type
                let waypoints = [];
                if (connection.waypoints) {
                    waypoints = connection.waypoints;
                } else if (connection.control) {
                    // Migrate old single control point to waypoints array
                    waypoints = [connection.control];
                }

                reactFlowEdges.push({
                    id: connection.id,
                    source: connection.source,
                    target: connection.target,
                    type: 'enhanced', // Use enhanced type for Draw.io-style functionality
                    animated: connection.animated || false,
                    style: {
                        strokeWidth: connection.style?.strokeWidth || 2,
                        stroke: connection.style?.stroke || '#2563eb',
                        zIndex: connection.zIndex || 5
                    },
                    zIndex: connection.zIndex || 5,
                    markerStart: connection.markerStart,
                    markerEnd: connection.markerEnd || { type: 'arrow' },
                    data: {
                        label: connection.label,
                        description: connection.description || '',
                        waypoints: waypoints,
                        intersection: connection.intersection || 'none'
                    }
                });
            });
        }

        return { nodes: reactFlowNodes, edges: reactFlowEdges };
    }, [handleNodeLabelChange]);

    return {
        reactFlowToJson,
        jsonToReactFlow
    };
};
