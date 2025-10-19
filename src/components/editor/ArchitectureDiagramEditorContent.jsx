import React, { useState, useCallback, useRef, useEffect , useMemo} from 'react';
import { X, Move } from 'lucide-react';
import {
    addEdge,
    reconnectEdge,
    applyNodeChanges,
    applyEdgeChanges,
    useUpdateNodeInternals,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Node and edge components now imported in EditorCanvasExtracted

// Import extracted components
import EditorModalsExtracted from './EditorModalsExtracted';
import EditorPanelsExtracted from './EditorPanelsExtracted';
import EditorCanvasExtracted from './EditorCanvasExtracted';

import EnhancedMenuBar from './EnhancedMenuBar';
import { autoLayoutNodes } from '../utils/autoLayout';

// Import new service layer
import { ServiceFactory } from '../../services/ServiceFactory';
import enhancedEdgeManager from '../../services/EnhancedEdgeManager';

// Import Zustand store
import useDiagramStore from '../../store/diagramStore';

// Import custom hooks
import { useNodeHandlers } from '../../hooks/useNodeHandlers';
import { useEdgeHandlers } from '../../hooks/useEdgeHandlers';
import { useClipboardHandlers } from '../../hooks/useClipboardHandlers';
import { useLayoutHandlers } from '../../hooks/useLayoutHandlers';
import { useDiagramConverters } from '../../hooks/useDiagramConverters';



const ArchitectureDiagramEditorContent = ({ initialDiagram, onToggleTheme, showThemeToggle, onToggleFullscreen, isFullscreen, onToggleMini, showMiniToggle }) => {
    // Service layer integration
    const [serviceFactory, setServiceFactory] = useState(null);
    const [isServiceInitialized, setIsServiceInitialized] = useState(false);

    // Initialize service layer and enhanced edge manager
    useEffect(() => {
        const initializeServices = async () => {
            try {
                console.log('Starting service layer initialization...');
                const factory = ServiceFactory.create();
                console.log('ServiceFactory created, initializing...');
                await factory.initialize();
                console.log('ServiceFactory initialized, setting state...');
                setServiceFactory(factory);
                setIsServiceInitialized(true);
                
                // Initialize enhanced edge manager
                console.log('Initializing Enhanced Edge Manager...');
                await enhancedEdgeManager.initialize({
                    enablePerformanceMonitoring: true,
                    enableLayoutAwareRouting: true,
                    enableBatchProcessing: true,
                    virtualBendsEnabled: true,
                    intersectionDetectionEnabled: true,
                    debounceTime: 100
                });
                console.log('Enhanced Edge Manager initialized successfully');
                
                console.log('All services initialized successfully');
            } catch (error) {
                console.error('Failed to initialize services:', error);
                console.error('Error details:', error.stack);
            }
        };
        initializeServices();
    }, []);

    // Get all state from Zustand store
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const setNodes = useDiagramStore(state => state.setNodes);
    const setEdges = useDiagramStore(state => state.setEdges);
    const selectedElements = useDiagramStore(state => state.selectedElements);
    const setSelectedElements = useDiagramStore(state => state.setSelectedElements);
    const history = useDiagramStore(state => state.history);
    const pushToHistory = useDiagramStore(state => state.pushToHistory);
    const undo = useDiagramStore(state => state.undo);
    const redo = useDiagramStore(state => state.redo);
    const clipboardData = useDiagramStore(state => state.clipboardData);
    const setClipboardData = useDiagramStore(state => state.setClipboardData);

    // UI state from Zustand
    const propertyPanelOpen = useDiagramStore(state => state.propertyPanelOpen);
    const setPropertyPanelOpen = useDiagramStore(state => state.setPropertyPanelOpen);
    const propertyPanelMinimized = useDiagramStore(state => state.propertyPanelMinimized);
    const setPropertyPanelMinimized = useDiagramStore(state => state.setPropertyPanelMinimized);
    const statsPanelOpen = useDiagramStore(state => state.statsPanelOpen);
    const setStatsPanelOpen = useDiagramStore(state => state.setStatsPanelOpen);
    const panMode = useDiagramStore(state => state.panMode);
    const setPanMode = useDiagramStore(state => state.setPanMode);
    const shapeLibraryOpen = useDiagramStore(state => state.shapeLibraryOpen);
    const setShapeLibraryOpen = useDiagramStore(state => state.setShapeLibraryOpen);

    // Modal state from Zustand
    const modals = useDiagramStore(state => state.modals);
    const openModal = useDiagramStore(state => state.openModal);
    const closeModal = useDiagramStore(state => state.closeModal);

    // Local state only for things not in Zustand yet
    const [isInitialized, setIsInitialized] = useState(false);
    const [technicalDetailsPanelOpen, setTechnicalDetailsPanelOpen] = useState(false);
    const [selectedElementForTechnicalDetails, setSelectedElementForTechnicalDetails] = useState(null);
    const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(true);
    const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
    const [layoutPanelOpen, setLayoutPanelOpen] = useState(false);
    // currentLayoutAlgorithm now comes from useLayoutHandlers hook

    // Modals converted to Zustand-compatible format
    const promptModal = modals.prompt;
    const setPromptModal = (value) => typeof value === 'function' ? openModal('prompt', value(promptModal.config)) : openModal('prompt', value);
    const confirmModal = modals.confirm;
    const setConfirmModal = (value) => typeof value === 'function' ? openModal('confirm', value(confirmModal.config)) : openModal('confirm', value);
    const containerSelectorModal = modals.containerSelector;
    const setContainerSelectorModal = (value) => typeof value === 'function' ? openModal('containerSelector', value(containerSelectorModal.config)) : openModal('containerSelector', value);
    const shapeSelectorModal = modals.shapeSelector;
    const setShapeSelectorModal = (value) => typeof value === 'function' ? openModal('shapeSelector', value(shapeSelectorModal.config)) : openModal('shapeSelector', value);
    const jsonPasteModal = modals.jsonPaste;
    const setJsonPasteModal = (value) => typeof value === 'function' ? openModal('jsonPaste', value(jsonPasteModal.config)) : openModal('jsonPaste', value);
    const jsonValidatorModal = modals.jsonValidator;
    const setJsonValidatorModal = (value) => typeof value === 'function' ? openModal('jsonValidator', value(jsonValidatorModal.config)) : openModal('jsonValidator', value);
    const exportModal = modals.export;
    const setExportModal = (value) => typeof value === 'function' ? openModal('export', value(exportModal.config)) : openModal('export', value);

    const getDiagramBounds = useCallback(() => {
        if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach((n) => {
            const width = n.__rf?.width || n.style?.width || 150;
            const height = n.__rf?.height || n.style?.height || 80;
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + width);
            maxY = Math.max(maxY, n.position.y + height);
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }, [nodes]);

    const updateNodeInternals = useUpdateNodeInternals();
    const { screenToFlowPosition, fitView } = useReactFlow();

    // Debug: Log when nodes/edges change
    useEffect(() => {
        console.log('🔄 Component nodes/edges updated:', {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            nodes,
            edges
        });
    }, [nodes, edges]);

    // Modal state now comes from Zustand (see lines 110-124)

    // Refs
    const reactFlowWrapper = useRef(null);
    const saveTimeoutRef = useRef(null);

    const togglePropertyPanel = useDiagramStore(state => state.togglePropertyPanel);
    const togglePropertyPanelMinimized = useCallback(() => {
        setPropertyPanelMinimized(!propertyPanelMinimized);
    }, [propertyPanelMinimized, setPropertyPanelMinimized]);
    const toggleStatsPanel = useDiagramStore(state => state.toggleStatsPanel);

    const togglePanMode = useDiagramStore(state => state.togglePanMode);

    const handleContextMenu = useCallback(
        (event) => {
            if (panMode) {
                event.preventDefault();
            }
        },
        [panMode]
    );

    // Custom node types
    // nodeTypes and edgeTypes moved to EditorCanvasExtracted

    // Optimized save to history function (defined early for use in hooks)
    const saveToHistory = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            const store = useDiagramStore.getState();
            pushToHistory({ nodes: store.nodes, edges: store.edges });
        }, 300);
    }, [pushToHistory]);

    // Use custom hooks for handlers
    const { handleNodesChange, onNodeDragStop, handleNodeLabelChange } = useNodeHandlers(saveToHistory);

    // Diagram converters (need handleNodeLabelChange)
    const { reactFlowToJson, jsonToReactFlow } = useDiagramConverters(handleNodeLabelChange);

    // Other handlers
    const {
        onEdgeUpdate,
        onEdgeUpdateStart,
        onEdgeUpdateEnd,
        onEdgeDoubleClick,
        onEdgeClick,
        onConnect,
        onConnectStart,
        onConnectEnd,
        defaultEdgeOptions
    } = useEdgeHandlers(saveToHistory);

    const {
        copySelected,
        copySelectedWithLinks,
        pasteElements,
        pasteElementsWithLinks,
        deleteSelected,
        hasClipboard
    } = useClipboardHandlers(saveToHistory);

    const {
        applyAutoLayout,
        autoLayout,
        currentLayoutAlgorithm,
        setCurrentLayoutAlgorithm
    } = useLayoutHandlers(
        saveToHistory,
        reactFlowToJson,
        jsonToReactFlow,
        serviceFactory,
        isServiceInitialized
    );

    // Handle selection changes - includes edges and technical details panel logic
    const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
        setSelectedElements({
            nodes: selectedNodes || [],
            edges: selectedEdges || [],
        });

        // Update technical details panel
        if (technicalDetailsEnabled) {
            if (selectedNodes.length === 1) {
                setSelectedElementForTechnicalDetails({ ...selectedNodes[0], type: 'node' });
                setTechnicalDetailsPanelOpen(true);
            } else if (selectedEdges.length === 1) {
                setSelectedElementForTechnicalDetails({ ...selectedEdges[0], type: 'edge' });
                setTechnicalDetailsPanelOpen(true);
            } else {
                setTechnicalDetailsPanelOpen(false);
                setSelectedElementForTechnicalDetails(null);
            }
        } else {
            setTechnicalDetailsPanelOpen(false);
            setSelectedElementForTechnicalDetails(null);
        }
    }, [technicalDetailsEnabled, setSelectedElements, setSelectedElementForTechnicalDetails, setTechnicalDetailsPanelOpen]);

    // Edge changes handler
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, [setEdges]);

    // Conversion functions now come from useDiagramConverters hook (see line 192)

    // Migrate edges to use enhanced orthogonal edge functionality  
    const migrateEdgesToEnhanced = useCallback((edges) => {
        return edges.map(edge => {
            // Ensure all edges use enhanced type for Draw.io-style functionality
            const migratedEdge = {
                ...edge,
                type: 'enhanced',
                style: {
                    ...edge.style,
                    stroke: edge.style?.stroke || '#2563eb',
                    strokeWidth: edge.style?.strokeWidth || 2
                },
                data: {
                    ...edge.data,
                    waypoints: edge.data?.waypoints || (edge.data?.control ? [edge.data.control] : []),
                    intersection: edge.data?.intersection || 'none'
                }
            };
            return migratedEdge;
        });
    }, []);

    // Register edges with enhanced edge manager
    useEffect(() => {
        if (enhancedEdgeManager.isInitialized && edges.length > 0 && nodes.length > 0) {
            edges.forEach(edge => {
                if (!enhancedEdgeManager.getEdgeInfo(edge.id)) {
                    enhancedEdgeManager.registerEdge(edge.id, edge, nodes);
                }
            });
        }
    }, [edges, nodes]);

    // Initialize diagram from the provided configuration
    useEffect(() => {
        if (!isInitialized) {
            const config = initialDiagram || { containers: [], nodes: [], connections: [] };
            const { nodes: initialNodes, edges: initialEdges } = jsonToReactFlow(config);
            // Migrate edges to ensure waypoint functionality - now use enhanced edges
            const enhancedEdges = initialEdges.map(edge => ({
                ...edge,
                type: 'enhanced' // Use our new enhanced edge type
            }));
            // Apply circular layout by default for initial diagrams
            const laidOut = autoLayoutNodes(initialNodes, 'circular');
            setNodes(laidOut);
            setEdges(enhancedEdges);
            pushToHistory({ nodes: laidOut, edges: enhancedEdges });
            laidOut.forEach(n => updateNodeInternals(n.id));
            setIsInitialized(true);
        }
    }, [isInitialized, jsonToReactFlow, initialDiagram, updateNodeInternals]);
    // Helper functions for modals
    const showPromptModal = useCallback((title, message, defaultValue, onConfirm) => {
        setPromptModal({
            isOpen: true,
            title,
            message,
            defaultValue,
            onConfirm: (value) => {
                onConfirm(value);
                setPromptModal(prev => ({ ...prev, isOpen: false }));
            },
        });
    }, []);

    const showConfirmModal = useCallback((title, message, onConfirm) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
        });
    }, []);

    const showContainerSelectorModal = useCallback((title, message, containers, onSelect) => {
        setContainerSelectorModal({
            isOpen: true,
            title,
            message,
            containers,
            onSelect: (containerId) => {
                onSelect(containerId);
                setContainerSelectorModal(prev => ({ ...prev, isOpen: false }));
            },
        });
    }, []);

    const showShapeSelectorModal = useCallback(() => {
        setShapeSelectorModal({
            isOpen: true,
        });
    }, []);

    const showJsonPasteModal = useCallback((onConfirm) => {
        setJsonPasteModal({ isOpen: true, onConfirm });
    }, []);

    const showJsonValidatorModal = useCallback(() => {
        setJsonValidatorModal({ isOpen: true });
    }, []);

    // Handle property changes for both nodes and edges
    const handleElementPropertyChange = useCallback((elementType, property, value) => {
        if (elementType === 'node' && selectedElements.nodes.length === 1) {
            const nodeId = selectedElements.nodes[0].id;
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        if (property === 'label') {
                            return {
                                ...node,
                                data: { ...node.data, label: value },
                            };
                        } else if (property === 'zIndex') {
                            return {
                                ...node,
                                style: { ...node.style, zIndex: parseInt(value) },
                                zIndex: parseInt(value)
                            };
                        } else {
                            return {
                                ...node,
                                data: { ...node.data, [property]: value },
                            };
                        }
                    }
                    return node;
                })
            );
        } else if (elementType === 'edge' && selectedElements.edges.length === 1) {
            const edgeId = selectedElements.edges[0].id;
            setEdges((eds) =>
                eds.map((edge) => {
                    if (edge.id === edgeId) {
                        if (property === 'label') {
                            return {
                                ...edge,
                                label: value,
                                data: { ...edge.data, label: value }
                            };
                        } else if (property === 'zIndex') {
                            return {
                                ...edge,
                                style: { ...edge.style, zIndex: parseInt(value) },
                                zIndex: parseInt(value)
                            };
                        } else if (property === 'type' || property === 'animated') {
                            return { ...edge, [property]: value };
                        } else if (property === 'markerStart' || property === 'markerEnd') {
                            return { ...edge, [property]: value };
                        } else if (property.startsWith('style.')) {
                            const styleProp = property.replace('style.', '');
                            return {
                                ...edge,
                                style: { ...edge.style, [styleProp]: value }
                            };
                        } else {
                            return {
                                ...edge,
                                data: { ...edge.data, [property]: value }
                            };
                        }
                    }
                    return edge;
                })
            );
        }
        saveToHistory();
    }, [selectedElements, saveToHistory]);

    // applyAutoLayout now comes from useLayoutHandlers hook (see line 216)

    // Add new container node
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
    }, [nodes, handleNodeLabelChange, saveToHistory, showPromptModal, screenToFlowPosition]);

    // Add new component node
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
    }, [nodes, handleNodeLabelChange, saveToHistory, showContainerSelectorModal, showPromptModal]);

    // Duplicate a node - Removed unused function to fix ESLint warning

    // Add new shape node
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
    }, [handleNodeLabelChange, saveToHistory, showPromptModal]);

    // Handle shape selection from shape library
    const handleShapeSelect = useCallback((shapeData) => {
        let position = { x: 100, y: 100 };
        
        // Try to position at viewport center
        if (reactFlowWrapper.current) {
            const { left, top, width, height } = reactFlowWrapper.current.getBoundingClientRect();
            const center = { x: left + width / 2, y: top + height / 2 };
            position = screenToFlowPosition({ x: center.x, y: center.y });
        }

        const newNode = {
            id: `shape-${Date.now()}`,
            type: shapeData.type,
            position,
            data: {
                ...shapeData,
                onLabelChange: handleNodeLabelChange
            },
            style: {
                width: shapeData.defaultSize?.width || 100,
                height: shapeData.defaultSize?.height || 80,
                zIndex: 15
            },
            draggable: true,
            selectable: true,
            zIndex: 15
        };

        setNodes((nds) => [...nds, newNode]);
        setShapeLibraryOpen(false);
        saveToHistory();
    }, [handleNodeLabelChange, saveToHistory, screenToFlowPosition]);

    // copySelected, pasteElements, deleteSelected now come from useClipboardHandlers hook (see line 206)
    // Undo/Redo now comes from Zustand (see lines 78-80)

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.closest('input, textarea, [contenteditable="true"]')) {
                return; // allow default behavior inside inputs and editable areas
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'c':
                        event.preventDefault();
                        copySelected();
                        break;
                    case 'v':
                        event.preventDefault();
                        pasteElements();
                        break;
                    case 'z':
                        event.preventDefault();
                        if (event.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                    default:
                        break;
                }
            } else if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteSelected();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [copySelected, pasteElements, deleteSelected, undo, redo]);

    // Export and import functions using service layer
    const exportJSON = useCallback(async () => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            // Fallback to old method
            const diagramData = {
                metadata: {
                    name: 'Architecture Diagram',
                    description: 'Exported architecture diagram',
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                },
                containers: nodes
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
                nodes: nodes
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
                connections: edges.map((edge) => ({
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
                })),
            };

            const dataStr = JSON.stringify(diagramData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = 'architecture-diagram.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, 'json', {
                filename: 'architecture-diagram.json',
                prettyPrint: true
            });
            
            if (result.success) {
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', result.dataUri);
                linkElement.setAttribute('download', result.filename);
                linkElement.click();
            } else {
                console.error('Export failed:', result.error);
                alert('Export failed. Please try again.');
            }
        } catch (error) {
            console.error('Error exporting JSON:', error);
            alert('Error exporting diagram. Please try again.');
        }
    }, [nodes, edges, serviceFactory, isServiceInitialized]);

    // Import from draw.io XML
    const importFromDrawioXML = useCallback(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = '.drawio,.xml';
        inputElement.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const xmlContent = e.target.result;
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

                        const cells = xmlDoc.querySelectorAll('mxCell');

                        const tempNodes = [];
                        const tempEdges = [];

                        cells.forEach(cell => {
                            const id = cell.getAttribute('id');
                            if (id === '0' || id === '1') return; // skip root

                            const value = cell.getAttribute('value') || '';
                            const style = cell.getAttribute('style') || '';
                            const vertex = cell.getAttribute('vertex');
                            const edge = cell.getAttribute('edge');

                            const geometry = cell.querySelector('mxGeometry');
                            if (!geometry) return;

                            const x = parseFloat(geometry.getAttribute('x')) || 0;
                            const y = parseFloat(geometry.getAttribute('y')) || 0;
                            const width = parseFloat(geometry.getAttribute('width')) || 120;
                            const height = parseFloat(geometry.getAttribute('height')) || 80;

                            if (vertex) {
                                tempNodes.push({
                                    oldId: id,
                                    value,
                                    style,
                                    x,
                                    y,
                                    width,
                                    height,
                                    parent: cell.getAttribute('parent')
                                });
                            } else if (edge) {
                                tempEdges.push({
                                    oldId: id,
                                    value,
                                    style,
                                    source: cell.getAttribute('source'),
                                    target: cell.getAttribute('target')
                                });
                            }
                        });

                        const cellIdMap = new Map();
                        const importedNodes = [];

                        tempNodes.forEach(n => {
                            const newId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            cellIdMap.set(n.oldId, newId);

                            let nodeType = 'component';
                            if (n.style.includes('swimlane')) nodeType = 'container';
                            else if (n.style.includes('rhombus')) nodeType = 'diamond';
                            else if (n.style.includes('ellipse')) nodeType = 'circle';
                            else if (n.style.includes('hexagon')) nodeType = 'hexagon';
                            else if (n.style.includes('triangle')) nodeType = 'triangle';

                            const fillColorMatch = n.style.match(/fillColor=([^;]+)/);
                            const strokeColorMatch = n.style.match(/strokeColor=([^;]+)/);
                            const fillColor = fillColorMatch ? fillColorMatch[1] : '#ffffff';
                            const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';

                            const [firstLine, ...restLines] = n.value.split('\n');
                            importedNodes.push({
                                id: newId,
                                type: nodeType,
                                position: { x: n.x, y: n.y },
                                data: {
                                    label: firstLine,
                                    color: fillColor,
                                    borderColor: strokeColor,
                                    icon: nodeType === 'container' ? '📦' : '🔹',
                                    description: restLines.join('\n'),
                                    onLabelChange: handleNodeLabelChange
                                },
                                style: {
                                    width: n.width,
                                    height: n.height,
                                    zIndex: nodeType === 'container' ? 1 : 10
                                },
                                draggable: true,
                                selectable: true,
                                zIndex: nodeType === 'container' ? 1 : 10,
                                __parentOldId: n.parent
                            });
                        });

                        importedNodes.forEach(node => {
                            if (node.__parentOldId && cellIdMap.has(node.__parentOldId)) {
                                node.parentNode = cellIdMap.get(node.__parentOldId);
                            }
                            delete node.__parentOldId;
                        });

                        const importedEdges = tempEdges.map(e => {
                            const strokeWidthMatch = e.style.match(/strokeWidth=([^;]+)/);
                            const strokeColorMatch = e.style.match(/strokeColor=([^;]+)/);
                            const strokeWidth = strokeWidthMatch ? parseInt(strokeWidthMatch[1]) : 2;
                            const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';
                            const isDashed = e.style.includes('dashed=1');

                            return {
                                id: `imported-edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                source: cellIdMap.get(e.source) || e.source,
                                target: cellIdMap.get(e.target) || e.target,
                                label: e.value,
                                type: 'smoothstep',
                                animated: false,
                                style: {
                                    strokeWidth,
                                    stroke: strokeColor,
                                    strokeDasharray: isDashed ? '5,5' : undefined,
                                    zIndex: 5
                                },
                                zIndex: 5,
                                data: { label: e.value, description: '' }
                            };
                        });

                        const nodeMap = Object.fromEntries(importedNodes.map(n => [n.id, n]));
                        const filteredEdges = [];
                        importedEdges.forEach(edge => {
                            const s = nodeMap[edge.source];
                            const t = nodeMap[edge.target];
                            if (s && t && s.type === 'container' && t.type === 'container') {
                                t.parentNode = s.id;
                                t.position = {
                                    x: t.position.x - s.position.x,
                                    y: t.position.y - s.position.y
                                };
                            } else {
                                filteredEdges.push(edge);
                            }
                        });

                        setNodes(importedNodes);
                        setEdges(filteredEdges);
                        saveToHistory();

                    } catch (error) {
                        console.error('Error importing draw.io XML:', error);
                        alert('Error importing draw.io file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        inputElement.click();
    }, [handleNodeLabelChange, saveToHistory, setNodes, setEdges]);

    // Convert to draw.io XML format using service layer
    const exportToDrawioXML = useCallback(async () => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, 'drawio', {
                filename: 'architecture-diagram.drawio'
            });
            
            if (result.success) {
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', result.dataUri);
                linkElement.setAttribute('download', result.filename);
                linkElement.click();
            } else {
                console.error('Export failed:', result.error);
                alert('Export failed. Please try again.');
            }
        } catch (error) {
            console.error('Error exporting to Draw.io XML:', error);
            alert('Error exporting diagram. Please try again.');
        }
    }, [nodes, edges, serviceFactory, isServiceInitialized]);

    const importDiagram = useCallback(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = '.json';
        inputElement.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(importedData);
                        // Migrate edges to ensure waypoint functionality
                        const migratedEdges = migrateEdgesToEnhanced(importedEdges);

                        // Set nodes and edges directly - positions are already in the JSON
                        setNodes(importedNodes);
                        setEdges(migratedEdges);

                        // Update node internals for proper rendering
                        importedNodes.forEach(n => updateNodeInternals(n.id));

                        saveToHistory();
                    } catch (error) {
                        console.error('Error importing diagram:', error);
                        alert('Error importing diagram. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        inputElement.click();
    }, [jsonToReactFlow, saveToHistory, migrateEdgesToEnhanced, setNodes, setEdges, updateNodeInternals]);

    const importDiagramObject = useCallback(async (data) => {
        console.log('📥 importDiagramObject called with data:', data);

        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            // Simple validation fallback
            if (!data || !data.containers || !data.nodes || !data.connections) {
                console.error('Invalid diagram JSON - missing required fields');
                alert('Invalid diagram JSON');
                throw new Error('Invalid diagram JSON');
            }

            console.log('✅ Converting JSON to ReactFlow format...');
            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);
            console.log('✅ Converted:', importedNodes.length, 'nodes,', importedEdges.length, 'edges');

            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToEnhanced(importedEdges);
            console.log('✅ Migrated edges');

            // Set nodes and edges directly - positions are already in the JSON
            console.log('✅ Setting nodes and edges in store...');
            setNodes(importedNodes);
            setEdges(migratedEdges);

            // Verify store was updated
            const storeState = useDiagramStore.getState();
            console.log('📊 Store after update:', {
                nodeCount: storeState.nodes.length,
                edgeCount: storeState.edges.length,
                nodes: storeState.nodes,
                edges: storeState.edges
            });

            // Update node internals for proper rendering
            console.log('✅ Updating node internals...');
            importedNodes.forEach(n => updateNodeInternals(n.id));

            // Fit view to show all imported nodes
            console.log('✅ Fitting view to imported diagram...');
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 300 });
            }, 100);

            console.log('✅ Setting initialized flag...');
            setIsInitialized(true);

            console.log('✅ Saving to history...');
            saveToHistory();
            console.log('✅ Import completed successfully!');
            return;
        }

        try {
            // Validate the diagram data
            console.log('🔍 Validating diagram with service layer...');
            await serviceFactory.validateDiagram(data);
            console.log('✅ Validation passed');

            // If validation passes, import the diagram
            console.log('✅ Converting JSON to ReactFlow format...');
            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);
            console.log('✅ Converted:', importedNodes.length, 'nodes,', importedEdges.length, 'edges');

            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToEnhanced(importedEdges);
            console.log('✅ Migrated edges');

            // Set nodes and edges directly - positions are already in the JSON
            console.log('✅ Setting nodes and edges in store...');
            setNodes(importedNodes);
            setEdges(migratedEdges);

            // Verify store was updated
            const storeState = useDiagramStore.getState();
            console.log('📊 Store after update:', {
                nodeCount: storeState.nodes.length,
                edgeCount: storeState.edges.length,
                nodes: storeState.nodes,
                edges: storeState.edges
            });

            // Update node internals for proper rendering
            console.log('✅ Updating node internals...');
            importedNodes.forEach(n => updateNodeInternals(n.id));

            // Fit view to show all imported nodes
            console.log('✅ Fitting view to imported diagram...');
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 300 });
            }, 100);

            console.log('✅ Saving to history...');
            saveToHistory();
            console.log('✅ Import completed successfully!');
        } catch (error) {
            console.error('❌ Error importing diagram:', error);
            alert('Error importing diagram: ' + error.message);
            throw error;
        }
    }, [jsonToReactFlow, saveToHistory, migrateEdgesToEnhanced, serviceFactory, isServiceInitialized, setNodes, setEdges, updateNodeInternals, fitView]);


    const handleJsonPasteImport = useCallback(async (data) => {
        console.log('🎯 handleJsonPasteImport called');
        try {
            await importDiagramObject(data);
            console.log('✅ Closing modal...');
            setJsonPasteModal({ isOpen: false, onConfirm: null });
        } catch (error) {
            console.error('❌ handleJsonPasteImport error:', error);
            // Don't close modal on error so user can see the error and try again
            throw error;
        }
    }, [importDiagramObject]);

    const validateJson = useCallback(async (data) => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            // Simple validation fallback
            const valid = data && data.containers && data.nodes && data.connections;
            const errors = valid ? [] : ['Invalid diagram structure'];
            return { valid, errors };
        }

        try {
            // Validate the diagram data
            await serviceFactory.validateDiagram(data);
            return {
                valid: true,
                errors: []
            };
        } catch (error) {
            console.error('Error validating diagram:', error);
            return {
                valid: false,
                errors: [error.message]
            };
        }
    }, [serviceFactory, isServiceInitialized]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const newDiagram = useCallback(() => {
        showConfirmModal(
            'New Diagram',
            'Are you sure you want to create a new diagram? All unsaved changes will be lost.',
            () => {
                applyAutoLayout([], 'circular');
                setEdges([]);
                setSelectedElements({ nodes: [], edges: [] });
                saveToHistory();
            }
        );
    }, [applyAutoLayout, saveToHistory, showConfirmModal]);

    const saveDiagram = useCallback(() => {
        exportJSON();
    }, [exportJSON]);

    const saveAsDiagram = useCallback(() => {
        exportJSON();
    }, [exportJSON]);

    const openDiagram = useCallback(() => {
        importDiagram();
    }, [importDiagram]);

    // Image export helpers using service layer
    const exportImage = useCallback(async (type) => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            if (!reactFlowWrapper.current) return;
            const renderer = reactFlowWrapper.current.querySelector('.react-flow__renderer') || reactFlowWrapper.current;
            const isDark = !!reactFlowWrapper.current.closest('.dark');
            const bounds = getDiagramBounds();
            const margin = 20;
            const width = bounds.width + margin * 2;
            const height = bounds.height + margin * 2;
            const common = {
                cacheBust: true,
                backgroundColor: isDark ? '#111111' : '#ffffff',
                width,
                height,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${-bounds.x + margin}px, ${-bounds.y + margin}px)`
                }
            };
            // Fallback image export not available without service layer
            console.error('Image export not available without service layer');
            alert('Image export not available. Please try again later.');
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, type, {
                filename: `diagram.${type}`,
                backgroundColor: reactFlowWrapper.current?.closest('.dark') ? '#111111' : '#ffffff',
                margin: 20
            });
            
            if (result.success) {
                const link = document.createElement('a');
                link.download = result.filename;
                link.href = result.dataUri;
                link.click();
            } else {
                console.error('Image export failed:', result.error);
                alert('Image export failed. Please try again.');
            }
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Error exporting image. Please try again.');
        }
    }, [getDiagramBounds, serviceFactory, isServiceInitialized, nodes, edges]);

    const exportAsPNG = useCallback(() => exportImage("png"), [exportImage]);
    const exportAsJPG = useCallback(() => exportImage('jpg'), [exportImage]);
    const exportAsSVG = useCallback(() => exportImage('svg'), [exportImage]);

    // autoLayout now comes from useLayoutHandlers hook (see line 216)

    const onLayoutSettings = useCallback(() => {
        setLayoutPanelOpen(true);
    }, []);

    // Enhanced selection operations
    const selectAllElements = useCallback(() => {
        setSelectedElements({
            nodes: nodes,
            edges: edges
        });
    }, [nodes, edges]);

    const deselectAllElements = useCallback(() => {
        setSelectedElements({ nodes: [], edges: [] });
    }, []);

    const cutSelected = useCallback(() => {
        if (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) {
            copySelected();
            deleteSelected();
        }
    }, [selectedElements, copySelected, deleteSelected]);


    const linkSelectedNodes = useCallback(() => {
        if (selectedElements.nodes.length < 2) {
            return;
        }

        const containers = selectedElements.nodes.filter(n => n.type === 'container');

        let parent = containers[0] || selectedElements.nodes[0];
        const children = selectedElements.nodes.filter(n => n.id !== parent.id);

        setNodes((nds) => nds.map((node) => {
            const child = children.find(c => c.id === node.id);
            if (child) {
                const parentNode = nds.find(n => n.id === parent.id);
                const offset = parentNode ? {
                    x: node.position.x - parentNode.position.x,
                    y: node.position.y - parentNode.position.y
                } : node.position;
                return { ...node, parentNode: parent.id, position: offset };
            }
            return node;
        }));

        children.forEach(c => updateNodeInternals(c.id));
        updateNodeInternals(parent.id);
        saveToHistory();
    }, [selectedElements, saveToHistory, updateNodeInternals]);

    // Unlink selected nodes function
    const unlinkSelectedNodes = useCallback(() => {
        if (selectedElements.edges.length > 0) {
            const selectedEdgeIds = selectedElements.edges.map(edge => edge.id);
            setEdges(edges.filter(edge => !selectedEdgeIds.includes(edge.id)));
            saveToHistory();
        } else if (selectedElements.nodes.length > 0) {

            setNodes((nds) => nds.map((node) => {
                if (selectedElements.nodes.find(n => n.id === node.id) && node.parentNode) {
                    const parent = nds.find(n => n.id === node.parentNode);
                    const absPos = parent ? { x: node.position.x + parent.position.x, y: node.position.y + parent.position.y } : node.position;
                    return { ...node, parentNode: undefined, extent: undefined, position: absPos };
                }
                return node;
            }));

            selectedElements.nodes.forEach(n => updateNodeInternals(n.id));
            saveToHistory();
        }
    }, [selectedElements, edges, saveToHistory, updateNodeInternals]);

    // copySelectedWithLinks and pasteElementsWithLinks now come from useClipboardHandlers hook (see line 206)

    // Update panel position when node is dragged
    useEffect(() => {
        if (!technicalDetailsPanelOpen || !selectedElementForTechnicalDetails) return;
        
        // Debounce position updates to reduce ResizeObserver calls
        const timer = setTimeout(() => {
            const node = nodes.find(n => n.id === selectedElementForTechnicalDetails.id);
            if (node && node.position) {
                // Get the React Flow wrapper
                const reactFlowWrapper = document.querySelector('.react-flow');
                if (!reactFlowWrapper) return;
                
                // Get the actual DOM element of the node
                const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                if (!nodeElement) return;
                
                const nodeRect = nodeElement.getBoundingClientRect();
                
                // Calculate panel position relative to the node in screen coordinates
                let x = nodeRect.right + 20; // 20px to the right of the node
                let y = nodeRect.top;
                
                // If panel would go off-screen, position it to the left
                if (x + 320 > window.innerWidth) {
                    x = nodeRect.left - 340; // 320px panel width + 20px gap
                }
                
                // Keep panel within viewport height
                if (y + 400 > window.innerHeight) {
                    y = window.innerHeight - 420;
                }
                if (y < 10) {
                    y = 10;
                }
                
                setPanelOffset({ x, y });
            }
        }, 100); // Increased delay to ensure DOM is ready and reduce ResizeObserver calls
        
        return () => clearTimeout(timer);
    }, [nodes, technicalDetailsPanelOpen, selectedElementForTechnicalDetails]);

    // Additional effect to handle React Flow viewport changes more robustly
    useEffect(() => {
        if (!technicalDetailsPanelOpen || !selectedElementForTechnicalDetails) return;
        
        const handleReactFlowViewportChange = () => {
            const node = nodes.find(n => n.id === selectedElementForTechnicalDetails.id);
            if (node && node.position) {
                const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
                if (!nodeElement) return;
                
                const nodeRect = nodeElement.getBoundingClientRect();
                
                // Calculate panel position relative to the node
                let x = nodeRect.right + 20;
                let y = nodeRect.top;
                
                // If panel would go off-screen, position it to the left
                if (x + 320 > window.innerWidth) {
                    x = nodeRect.left - 340;
                }
                
                // Keep panel within viewport height
                if (y + 400 > window.innerHeight) {
                    y = window.innerHeight - 420;
                }
                if (y < 10) {
                    y = 10;
                }
                
                setPanelOffset({ x, y });
            }
        };
        
        // Use a more aggressive approach to catch all viewport changes
        const reactFlowWrapper = document.querySelector('.react-flow');
        if (reactFlowWrapper) {
            // Listen to all possible viewport change events
            const events = ['scroll', 'wheel', 'mousemove', 'mouseup', 'touchmove', 'touchend'];
            events.forEach(event => {
                reactFlowWrapper.addEventListener(event, handleReactFlowViewportChange, { passive: true });
            });
            
            // Also listen to the viewport element specifically
            const viewport = reactFlowWrapper.querySelector('.react-flow__viewport');
            if (viewport) {
                events.forEach(event => {
                    viewport.addEventListener(event, handleReactFlowViewportChange, { passive: true });
                });
            }
            
            return () => {
                events.forEach(event => {
                    reactFlowWrapper.removeEventListener(event, handleReactFlowViewportChange);
                    if (viewport) {
                        viewport.removeEventListener(event, handleReactFlowViewportChange);
                    }
                });
            };
        }
    }, [technicalDetailsPanelOpen, selectedElementForTechnicalDetails, nodes]);

    // New export modal handlers
    const openExportModal = useCallback(() => {
        setExportModal({ isOpen: true });
    }, []);

    const closeExportModal = useCallback(() => {
        setExportModal({ isOpen: false });
    }, []);

    // Get diagram data for export
    const getDiagramDataForExport = useCallback(() => {
        return {
            nodes,
            edges,
            containers: nodes.filter(node => node.type === 'container'),
            connections: edges,
            metadata: {
                name: 'Architecture Diagram',
                description: 'Exported architecture diagram',
                version: '1.0',
                exportDate: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length
            }
        };
    }, [nodes, edges]);

    return (
        <div className="architecture-diagram-editor h-full flex flex-col">


            {/* Context Menu Handler - Removed unused code to fix ESLint errors */}

            {/* Header */}
            <div className="flex flex-col bg-gray-100 dark:bg-gray-900 shadow z-10">
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3 m-0">
                            <span className="text-xl">📊</span>
                            Architecture Diagram Editor
                        </h1>
                    </div>
                </div>

                <EnhancedMenuBar
                    // File operations
                    onNew={newDiagram}
                    onOpen={openDiagram}
                    onSave={saveDiagram}
                    onSaveAs={saveAsDiagram}
                    onImportJSON={importDiagram}
                    onImportJSONText={() => showJsonPasteModal(handleJsonPasteImport)}
                    onImportDrawio={importFromDrawioXML}
                    onExportJSON={exportJSON}
                    onExportDrawio={exportToDrawioXML}
                    onExportPNG={exportAsPNG}
                    onExportJPG={exportAsJPG}
                    onExportSVG={exportAsSVG}
                    onExportModal={openExportModal}

                    // Edit operations
                    onUndo={undo}
                    onRedo={redo}
                    onCut={cutSelected}
                    onCopy={copySelectedWithLinks} // Use enhanced copy function
                    onPaste={pasteElementsWithLinks} // Use enhanced paste function
                    onDelete={deleteSelected}
                    onSelectAll={selectAllElements}
                    onDeselectAll={deselectAllElements}

                    // Add operations
                    onAddContainer={addContainerNode}
                    onAddComponent={addComponentNode}
                    onAddShape={showShapeSelectorModal}
                    onToggleShapeLibrary={() => setShapeLibraryOpen(prev => !prev)}

                    // Link operations
                    onLinkNodes={linkSelectedNodes}
                    onUnlinkNodes={unlinkSelectedNodes}

                    onValidateJSON={showJsonValidatorModal}
                    onAutoLayout={autoLayout}
                    onLayoutSettings={onLayoutSettings}

                    // State props
                    canUndo={history.past.length > 0}
                    canRedo={history.future.length > 0}
                    hasSelection={selectedElements.nodes.length > 0 || selectedElements.edges.length > 0}
                    hasClipboard={clipboardData !== null}
                    canLink={selectedElements.nodes.length >= 2}
                    onTogglePropertiesPanel={togglePropertyPanel}
                    onToggleStatsPanel={toggleStatsPanel}
                    onToggleTheme={onToggleTheme}
                    showThemeToggle={showThemeToggle}
                    onToggleMini={onToggleMini}
                    showMiniToggle={showMiniToggle}
                />

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 p-2 bg-white/5 border-t border-white/10">
                    <button
                        className={`p-2 rounded flex items-center justify-center w-11 h-11 text-white bg-white/10 border border-white/20 transition-all touch-manipulation ${history.past.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                            }`}
                        onClick={undo}
                        disabled={history.past.length === 0}
                        title="Undo (Ctrl+Z)"
                    >
                        ↩️
                    </button>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-11 h-11 text-white bg-white/10 border border-white/20 transition-all touch-manipulation ${history.future.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                            }`}
                        onClick={redo}
                        disabled={history.future.length === 0}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        ↪️
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-1"></div>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-11 h-11 text-white bg-white/10 border border-white/20 transition-all touch-manipulation ${selectedElements.nodes.length === 0 && selectedElements.edges.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                            }`}
                        onClick={copySelectedWithLinks}
                        disabled={selectedElements.nodes.length === 0 && selectedElements.edges.length === 0}
                        title="Copy (Ctrl+C)"
                    >
                        📋
                    </button>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-11 h-11 text-white bg-white/10 border border-white/20 transition-all touch-manipulation ${!clipboardData ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md active:scale-95'
                            }`}
                        onClick={pasteElementsWithLinks}
                        disabled={!clipboardData}
                        title="Paste (Ctrl+V)"
                    >
                        📄
                    </button>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-11 h-11 border transition-colors touch-manipulation active:scale-95 ${panMode ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        onClick={togglePanMode}
                        title={panMode ? 'Selection Mode' : 'Pan Mode'}
                    >
                        <Move size={16} />
                    </button>
                    <button
                        className="p-2 rounded flex items-center justify-center w-11 h-11 border bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors touch-manipulation hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? '🗗' : '🗖'}
                    </button>
                    {/* Replace the current Tech Details button with a modern toggle */}
                    <div className="flex items-center gap-2 ml-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none tech-details-toggle">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Tech Details</span>
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={technicalDetailsEnabled}
                                    onChange={() => setTechnicalDetailsEnabled(prev => !prev)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Main Editor Canvas */}
            <EditorCanvasExtracted
                reactFlowWrapper={reactFlowWrapper}
                handleContextMenu={handleContextMenu}
                nodes={nodes}
                edges={edges}
                handleNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onSelectionChange={onSelectionChange}
                onEdgeClick={onEdgeClick}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                onNodeDragStop={onNodeDragStop}
                onEdgeDoubleClick={onEdgeDoubleClick}
                panMode={panMode}
                setPanMode={setPanMode}
                defaultEdgeOptions={defaultEdgeOptions}
                panelsProps={{
                    statsPanelOpen,
                    setStatsPanelOpen,
                    nodes,
                    edges,
                    selectedElements,
                    propertyPanelOpen,
                    propertyPanelMinimized,
                    togglePropertyPanelMinimized,
                    setPropertyPanelOpen,
                    setPropertyPanelMinimized,
                    handleElementPropertyChange,
                    shapeLibraryOpen,
                    setShapeLibraryOpen,
                    handleShapeSelect,
                    selectedElementForTechnicalDetails,
                    technicalDetailsPanelOpen,
                    setTechnicalDetailsPanelOpen,
                    setSelectedElementForTechnicalDetails,
                    panelOffset,
                    layoutPanelOpen,
                    setLayoutPanelOpen,
                    currentLayoutAlgorithm,
                    setCurrentLayoutAlgorithm,
                    setNodes
                }}
            />

            {/* Modals - Extracted to separate component */}
            <EditorModalsExtracted
                promptModal={promptModal}
                setPromptModal={setPromptModal}
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                containerSelectorModal={containerSelectorModal}
                setContainerSelectorModal={setContainerSelectorModal}
                shapeSelectorModal={shapeSelectorModal}
                setShapeSelectorModal={setShapeSelectorModal}
                addShapeNode={addShapeNode}
                jsonPasteModal={jsonPasteModal}
                setJsonPasteModal={setJsonPasteModal}
                handleJsonPasteImport={handleJsonPasteImport}
                jsonValidatorModal={jsonValidatorModal}
                setJsonValidatorModal={setJsonValidatorModal}
                validateJson={validateJson}
                exportModal={exportModal}
                closeExportModal={closeExportModal}
                getDiagramDataForExport={getDiagramDataForExport}
            />

            {/* Technical Details Tooltip - Removed unused component to fix ESLint errors */}
        </div>
    );

};

export default ArchitectureDiagramEditorContent;