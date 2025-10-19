import { useCallback } from 'react';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for node creation
 * Extracted from ArchitectureDiagramEditorContent
 */
export const useNodeCreation = ({
    handleNodeLabelChange,
    saveToHistory,
    showPromptModal,
    showContainerSelectorModal,
    screenToFlowPosition,
    reactFlowWrapper
}) => {
    const nodes = useDiagramStore(state => state.nodes);
    const setNodes = useDiagramStore(state => state.setNodes);

    /**
     * Add new container node
     */
    const addContainerNode = useCallback(() => {
        showPromptModal('Add Container', 'Enter container name:', 'New Container', (name) => {
            let position = { x: 0, y: 0 };
            if (reactFlowWrapper.current) {
                const { left, top, width, height } = reactFlowWrapper.current.getBoundingClientRect();
                const center = { x: left + width / 2, y: top + height / 2 };
                position = screenToFlowPosition({ x: center.x, y: center.y });
            }

            const newNode = {
                id: `container-${Date.now()}`,
                type: 'container',
                position,
                data: {
                    label: name,
                    icon: '📦',
                    color: '#f5f5f5',
                    borderColor: '#ddd',
                    description: '',
                    onLabelChange: handleNodeLabelChange,
                },
                style: {
                    width: 400,
                    height: 300,
                    zIndex: 1,
                },
                draggable: true,
                selectable: true,
                zIndex: 1
            };

            setNodes((nds) => [...nds, newNode]);
            saveToHistory();
        });
    }, [handleNodeLabelChange, saveToHistory, showPromptModal, screenToFlowPosition, reactFlowWrapper, setNodes]);

    /**
     * Add new component node
     */
    const addComponentNode = useCallback(() => {
        const containerNodes = nodes.filter(node => node.type === 'container');

        if (containerNodes.length > 0) {
            showContainerSelectorModal(
                'Select Container',
                'Choose a container for this component:',
                containerNodes,
                (containerId) => {
                    showPromptModal('Add Component', 'Enter component name:', 'New Component', (name) => {
                        const container = nodes.find(node => node.id === containerId);
                        let position = { x: 50, y: 50 };

                        if (container) {
                            const componentsInContainer = nodes.filter(
                                node => node.parentNode === containerId
                            ).length;

                            position = {
                                x: 50 + (componentsInContainer % 2) * 170,
                                y: 50 + Math.floor(componentsInContainer / 2) * 100
                            };
                        }

                        const newNode = {
                            id: `component-${Date.now()}`,
                            type: 'component',
                            position,
                            parentNode: containerId,
                            data: {
                                label: name,
                                icon: '🔹',
                                color: '#E3F2FD',
                                borderColor: '#90CAF9',
                                description: '',
                                onLabelChange: handleNodeLabelChange,
                            },
                            style: {
                                width: 150,
                                height: 80,
                                zIndex: 10,
                            },
                            draggable: true,
                            selectable: true,
                            zIndex: 10
                        };

                        setNodes((nds) => [...nds, newNode]);
                        saveToHistory();
                    });
                }
            );
        } else {
            showPromptModal('Add Component', 'Enter component name:', 'New Component', (name) => {
                const newNode = {
                    id: `component-${Date.now()}`,
                    type: 'component',
                    position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
                    data: {
                        label: name,
                        icon: '🔹',
                        color: '#E3F2FD',
                        borderColor: '#90CAF9',
                        description: '',
                        onLabelChange: handleNodeLabelChange,
                    },
                    style: {
                        width: 150,
                        height: 80,
                        zIndex: 10,
                    },
                    draggable: true,
                    selectable: true,
                    zIndex: 10
                };

                setNodes((nds) => [...nds, newNode]);
                saveToHistory();
            });
        }
    }, [nodes, handleNodeLabelChange, saveToHistory, showContainerSelectorModal, showPromptModal, setNodes]);

    /**
     * Add new shape node
     */
    const addShapeNode = useCallback((shapeType) => {
        showPromptModal('Add Shape', 'Enter shape name:', 'New Shape', (name) => {
            const newNode = {
                id: `${shapeType}-${Date.now()}`,
                type: shapeType,
                position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
                data: {
                    label: name,
                    icon: shapeType === 'diamond' ? '♦️' : shapeType === 'circle' ? '⭕' : shapeType === 'triangle' ? '🔺' : '⬢',
                    color: shapeType === 'diamond' ? '#81D4FA' : shapeType === 'circle' ? '#C5E1A5' : shapeType === 'triangle' ? '#FFD54F' : '#FFCC80',
                    borderColor: '#ddd',
                    description: '',
                    onLabelChange: handleNodeLabelChange,
                },
                style: {
                    width: 100,
                    height: 100,
                    zIndex: 15,
                },
                draggable: true,
                selectable: true,
                zIndex: 15
            };

            setNodes((nds) => [...nds, newNode]);
            saveToHistory();
        });
    }, [handleNodeLabelChange, saveToHistory, showPromptModal, setNodes]);

    /**
     * Handle shape selection from shape selector modal
     */
    const handleShapeSelect = useCallback((shapeData) => {
        addShapeNode(shapeData.type);
    }, [addShapeNode]);

    return {
        addContainerNode,
        addComponentNode,
        addShapeNode,
        handleShapeSelect
    };
};
