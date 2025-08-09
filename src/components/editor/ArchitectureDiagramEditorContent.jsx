import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { X, Move } from 'lucide-react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    reconnectEdge,
    MiniMap,
    Panel,
    applyNodeChanges,
    applyEdgeChanges,
    useUpdateNodeInternals,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import node components
import DiamondNode from '../nodes/DiamondNode';
import CircleNode from '../nodes/CircleNode';
import HexagonNode from '../nodes/HexagonNode';
import TriangleNode from '../nodes/TriangleNode';
import ContainerNode from '../nodes/ContainerNode';
import ComponentNode from '../nodes/ComponentNode';
import UniversalShapeNode from '../nodes/UniversalShapeNode';
import { AdjustableEdge } from '../edges';

// Import modal components
import PromptModal from '../modals/PromptModal';
import ConfirmModal from '../modals/ConfirmModal';
import ContainerSelectorModal from '../modals/ContainerSelectorModal';
import ShapeSelectorModal from '../modals/ShapeSelectorModal';
import JsonPasteModal from '../modals/JsonPasteModal';
import JsonValidatorModal from '../modals/JsonValidatorModal';
import ExportModal from '../modals/ExportModal';

// Import editor components
import TailwindPropertyEditor from './TailwindPropertyEditor';
import TechnicalDetailsPanel from './TechnicalDetailsPanel';
import ShapeLibraryPanel from './ShapeLibraryPanel';

import EnhancedMenuBar from './EnhancedMenuBar';
import { autoLayoutNodes } from '../utils/autoLayout';

// Import new service layer
import { ServiceFactory } from '../../services/ServiceFactory';



const ArchitectureDiagramEditorContent = ({ initialDiagram, onToggleTheme, showThemeToggle, onToggleFullscreen, isFullscreen, onToggleMini, showMiniToggle }) => {
    // Service layer integration
    const [serviceFactory, setServiceFactory] = useState(null);
    const [isServiceInitialized, setIsServiceInitialized] = useState(false);

    // Initialize service layer
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
                console.log('Service layer initialized successfully');
            } catch (error) {
                console.error('Failed to initialize service layer:', error);
                console.error('Error details:', error.stack);
            }
        };
        initializeServices();
    }, []);

    // State for nodes and edges
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });
    const [history, setHistory] = useState({ past: [], present: { nodes: [], edges: [] }, future: [] });
    const [isInitialized, setIsInitialized] = useState(false);
    const [clipboardData, setClipboardData] = useState(null);
    const [propertyPanelOpen, setPropertyPanelOpen] = useState(true);
    const [propertyPanelMinimized, setPropertyPanelMinimized] = useState(false);
    const [statsPanelOpen, setStatsPanelOpen] = useState(true);
    const [panMode, setPanMode] = useState(false);
    const [shapeLibraryOpen, setShapeLibraryOpen] = useState(false);
    
    // Technical details state
    const [technicalDetailsPanelOpen, setTechnicalDetailsPanelOpen] = useState(false);
    const [selectedElementForTechnicalDetails, setSelectedElementForTechnicalDetails] = useState(null);
    const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(true); // NEW
    const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 }); // NEW

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
    const { project } = useReactFlow();

    // State for modals
    const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [containerSelectorModal, setContainerSelectorModal] = useState({ isOpen: false, title: '', message: '', containers: [], onSelect: null });
    const [shapeSelectorModal, setShapeSelectorModal] = useState({ isOpen: false });
    const [jsonPasteModal, setJsonPasteModal] = useState({ isOpen: false, onConfirm: null });
    const [jsonValidatorModal, setJsonValidatorModal] = useState({ isOpen: false });
    const [exportModal, setExportModal] = useState({ isOpen: false });

    // Refs
    const reactFlowWrapper = useRef(null);
    const saveTimeoutRef = useRef(null);

    const togglePropertyPanel = useCallback(() => {
        setPropertyPanelOpen((prev) => {
            const next = !prev;
            if (next) setPropertyPanelMinimized(false);
            return next;
        });
    }, []);

    const togglePropertyPanelMinimized = useCallback(() => {
        setPropertyPanelMinimized((prev) => !prev);
    }, []);

    const toggleStatsPanel = useCallback(() => {
        setStatsPanelOpen((prev) => !prev);
    }, []);

    const togglePanMode = useCallback(() => {
        setPanMode((prev) => !prev);
    }, []);

    const handleContextMenu = useCallback(
        (event) => {
            if (panMode) {
                event.preventDefault();
            }
        },
        [panMode]
    );

    // Custom node types
    const nodeTypes = useMemo(() => ({
        diamond: DiamondNode,
        circle: CircleNode,
        hexagon: HexagonNode,
        triangle: TriangleNode,
        container: ContainerNode,
        component: ComponentNode,
        universalShape: UniversalShapeNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        adjustable: AdjustableEdge
    }), []);

    // Stable node label change handler
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
            setHistory((prev) => ({
                past: [...prev.past, prev.present],
                present: { nodes, edges },
                future: [],
            }));
        }, 500);
    }, [nodes, edges]);

    // Conversion functions for service layer
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
                    type: 'adjustable', // Use adjustable type for waypoint functionality
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

    // Migrate edges to ensure they have waypoint functionality
    const migrateEdgesToAdjustable = useCallback((edges) => {
        return edges.map(edge => {
            // Ensure all edges use adjustable type for waypoint functionality
            if (edge.type !== 'adjustable') {
                const migratedEdge = {
                    ...edge,
                    type: 'adjustable',
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
            }
            return edge;
        });
    }, []);

    // Initialize diagram from the provided configuration
    useEffect(() => {
        if (!isInitialized) {
            const config = initialDiagram || { containers: [], nodes: [], connections: [] };
            const { nodes: initialNodes, edges: initialEdges } = jsonToReactFlow(config);
            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToAdjustable(initialEdges);
            const laidOut = autoLayoutNodes(initialNodes);
            setNodes(laidOut);
            setEdges(migratedEdges);
            setHistory({
                past: [],
                present: { nodes: laidOut, edges: migratedEdges },
                future: [],
            });
            laidOut.forEach(n => updateNodeInternals(n.id));
            setIsInitialized(true);
        }
    }, [isInitialized, jsonToReactFlow, initialDiagram, updateNodeInternals, migrateEdgesToAdjustable]);

    // Optimized save to history function
    const saveToHistory = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            setHistory((prev) => ({
                past: [...prev.past, prev.present],
                present: { nodes, edges },
                future: [],
            }));
        }, 300);
    }, [nodes, edges]);

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

    // Optimized change handlers
    const handleNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onNodeDragStop = useCallback((event, node) => {
        const updatedNode = { ...node, position: node.position };
        setNodes(prevNodes => 
            prevNodes.map(n => n.id === node.id ? updatedNode : n)
        );
        saveToHistory();
    }, [saveToHistory]);

    const onEdgeUpdateStart = useCallback(() => { }, []);
    const onEdgeUpdateEnd = useCallback(() => {
        saveToHistory();
    }, [saveToHistory]);
    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
    }, []);

    const onConnectStart = useCallback(() => { }, []);
    const onConnectEnd = useCallback(() => { }, []);

    const onEdgeDoubleClick = useCallback((event, edge) => {
        event.preventDefault(); // Prevent default browser behavior (e.g., text selection)
        event.stopPropagation(); // Stop event propagation

        const flowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
            x: event.clientX - flowBounds.left,
            y: event.clientY - flowBounds.top,
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
    }, [project, setEdges, saveToHistory]);

    const defaultEdgeOptions = useMemo(() => ({
        type: 'adjustable',
        animated: true,
        style: { strokeWidth: 2, stroke: '#2563eb', strokeDasharray: '5 5' },
        data: { intersection: 'none' }
    }), []);

    // Handle new connections
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
            type: 'adjustable',
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
    }, [saveToHistory, nodes]);



    // Handle selection changes - now includes edges
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
    }, [technicalDetailsEnabled]);

    // Handle edge click - now uses property panel instead of modal
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
    }, [technicalDetailsEnabled]);

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

    const applyAutoLayout = useCallback(async (currentNodes) => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            const laidOut = autoLayoutNodes(currentNodes);
            setNodes(laidOut);
            laidOut.forEach(n => updateNodeInternals(n.id));
            return;
        }

        try {
            const diagramData = reactFlowToJson(currentNodes, edges);
            const result = await serviceFactory.layoutDiagram(diagramData, {
                algorithm: 'default',
                options: { spacing: 50 }
            });
            
            if (result.success) {
                const { nodes: laidOutNodes } = jsonToReactFlow(result.diagramData);
                setNodes(laidOutNodes);
                laidOutNodes.forEach(n => updateNodeInternals(n.id));
            } else {
                console.error('Auto-layout failed:', result.error);
                // Fallback to old method
                const laidOut = autoLayoutNodes(currentNodes);
                setNodes(laidOut);
                laidOut.forEach(n => updateNodeInternals(n.id));
            }
        } catch (error) {
            console.error('Error applying auto-layout:', error);
            // Fallback to old method
            const laidOut = autoLayoutNodes(currentNodes);
            setNodes(laidOut);
            laidOut.forEach(n => updateNodeInternals(n.id));
        }
    }, [updateNodeInternals, serviceFactory, isServiceInitialized, edges]);

    // Add new container node
    const addContainerNode = useCallback(() => {
        showPromptModal('Add Container', 'Enter container name:', 'New Container', (name) => {
            let position = { x: 0, y: 0 };
            if (reactFlowWrapper.current) {
                const { left, top, width, height } = reactFlowWrapper.current.getBoundingClientRect();
                const center = { x: left + width / 2, y: top + height / 2 };
                position = project({ x: center.x - left, y: center.y - top });
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
    }, [nodes, handleNodeLabelChange, saveToHistory, showPromptModal, project]);

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
            position = project({ x: center.x - left, y: center.y - top });
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
    }, [handleNodeLabelChange, saveToHistory, project]);

    // Copy selected elements
    const copySelected = useCallback(() => {
        if (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) {
            setClipboardData({
                nodes: selectedElements.nodes,
                edges: selectedElements.edges
            });
        }
    }, [selectedElements]);

    // Paste elements
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
    }, [clipboardData, saveToHistory]);

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
    }, [selectedElements, nodes, edges, saveToHistory]);

    // Undo/Redo functions
    const undo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev;

            const newPresent = prev.past[prev.past.length - 1];
            const newPast = prev.past.slice(0, prev.past.length - 1);

            setNodes(newPresent.nodes);
            setEdges(newPresent.edges);

            return {
                past: newPast,
                present: newPresent,
                future: [prev.present, ...prev.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev;

            const newPresent = prev.future[0];
            const newFuture = prev.future.slice(1);

            setNodes(newPresent.nodes);
            setEdges(newPresent.edges);

            return {
                past: [...prev.past, prev.present],
                present: newPresent,
                future: newFuture,
            };
        });
    }, []);

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
    }, [handleNodeLabelChange, saveToHistory]);

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
                        const migratedEdges = migrateEdgesToAdjustable(importedEdges);
                        applyAutoLayout(importedNodes);
                        setEdges(migratedEdges);
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
    }, [jsonToReactFlow, applyAutoLayout, saveToHistory, migrateEdgesToAdjustable]);

    const importDiagramObject = useCallback(async (data) => {
        if (!serviceFactory || !isServiceInitialized) {
            console.warn('Service layer not initialized, falling back to old method');
            // Simple validation fallback
            if (!data || !data.containers || !data.nodes || !data.connections) {
                alert('Invalid diagram JSON');
                return;
            }
            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);
            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToAdjustable(importedEdges);
            applyAutoLayout(importedNodes);
            setEdges(migratedEdges);
            saveToHistory();
            return;
        }

        try {
            // Validate the diagram data
            await serviceFactory.validateDiagram(data);
            
            // If validation passes, import the diagram
            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);
            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToAdjustable(importedEdges);
            applyAutoLayout(importedNodes);
            setEdges(migratedEdges);
            saveToHistory();
        } catch (error) {
            console.error('Error importing diagram:', error);
            alert('Error importing diagram: ' + error.message);
        }
    }, [jsonToReactFlow, applyAutoLayout, saveToHistory, migrateEdgesToAdjustable, serviceFactory, isServiceInitialized]);


    const handleJsonPasteImport = useCallback((data) => {
        importDiagramObject(data);
        setJsonPasteModal({ isOpen: false, onConfirm: null });
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
                applyAutoLayout([]);
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

    const autoLayout = useCallback(() => {
        applyAutoLayout(nodes);
        saveToHistory();
    }, [nodes, saveToHistory, applyAutoLayout]);

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

    // Enhanced copy function that includes linked elements
    const copySelectedWithLinks = useCallback(() => {
        if (selectedElements.nodes.length === 0) return;

        const collectIds = (ids, all = []) => {
            ids.forEach(id => {
                if (!all.includes(id)) {
                    all.push(id);
                    nodes.forEach(n => {
                        if (n.parentNode === id) {
                            collectIds([n.id], all);
                        }
                    });
                }
            });
            return all;
        };

        const selectedNodeIds = collectIds(selectedElements.nodes.map(n => n.id));

        const copiedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
        const connectedEdges = edges.filter(
            edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
        );

        setClipboardData({
            nodes: copiedNodes,
            edges: connectedEdges
        });

        // Optionally show a toast notification
        // toast.success(`Copied ${selectedElements.nodes.length} nodes and ${connectedEdges.length} connections`);
    }, [selectedElements, edges, nodes]);

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
        setEdges(edges => [...edges, ...newEdges]);
        saveToHistory();

        // Optionally show a toast notification
        // toast.success(`Pasted ${newNodes.length} nodes and ${newEdges.length} connections`);
    }, [clipboardData, saveToHistory]);

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

            
            {/* Modals */}
            <PromptModal
                isOpen={promptModal.isOpen}
                title={promptModal.title}
                message={promptModal.message}
                defaultValue={promptModal.defaultValue}
                onConfirm={promptModal.onConfirm}
                onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ContainerSelectorModal
                isOpen={containerSelectorModal.isOpen}
                title={containerSelectorModal.title}
                message={containerSelectorModal.message}
                containers={containerSelectorModal.containers}
                onSelect={containerSelectorModal.onSelect}
                onCancel={() => setContainerSelectorModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ShapeSelectorModal
                isOpen={shapeSelectorModal.isOpen}
                onSelect={(shapeType) => {
                    setShapeSelectorModal({ isOpen: false });
                    addShapeNode(shapeType);
                }}
                onCancel={() => setShapeSelectorModal({ isOpen: false })}
            />

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

            {/* Main Editor */}
            <div
                className="flex-1 w-full h-full relative bg-white dark:bg-gray-800"
                ref={reactFlowWrapper}
                onContextMenu={handleContextMenu}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
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
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    connectionMode="loose"  // Changed from "strict" to "loose"
                    connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 2 }}
                    fitView
                    snapToGrid={false}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    attributionPosition="bottom-right"
                    deleteKeyCode={null}
                    selectionOnDrag={!panMode}
                    panOnDrag={panMode ? [0, 1] : [1]}
                    selectionMode="partial"
                    minZoom={0.2}
                    maxZoom={2}
                    defaultEdgeOptions={defaultEdgeOptions}
                    elevateNodesOnSelect={true}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    panOnScroll={false}
                    preventScrolling={true}
                    onTouchStart={(e) => {
                        // Enhanced touch support for mobile devices
                        if (e.touches.length === 2) {
                            // Two finger touch - enable pan mode temporarily for better navigation
                            setPanMode(true);
                        }
                    }}
                    onTouchEnd={(e) => {
                        // Reset pan mode after touch interaction
                        if (e.touches.length === 0) {
                            // Could implement logic to restore previous pan mode state
                        }
                    }}
                    connectOnClick={true}  // Allow connections by clicking handles
                    onPaneContextMenu={handleContextMenu}
                    onNodeContextMenu={handleContextMenu}
                    onEdgeContextMenu={handleContextMenu}
                    onEdgeDoubleClick={onEdgeDoubleClick} // Add this line
                    isValidConnection={(connection) => {
                        // Allow all connections between different nodes
                        return connection.source !== connection.target;
                    }}
                >

                    <Controls className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-lg backdrop-blur-md p-1" />
                    <Background color="#aaa" gap={16} />
                    <MiniMap
                        nodeStrokeWidth={3}
                        zoomable
                        pannable
                        className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-lg backdrop-blur-md"
                    />


                    {/* Stats Panel */}
                    {statsPanelOpen && (
                        <Panel position="top-right" style={{ top: '110px', right: propertyPanelOpen ? '336px' : '16px' }}>
                            <div className="bg-white/98 dark:bg-gray-800/98 rounded-lg shadow-lg backdrop-blur-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
                                    <span>Diagram Statistics</span>
                                    <button
                                        className="p-1 hover:bg-white/10 rounded"
                                        onClick={() => setStatsPanelOpen(false)}
                                        title="Close"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Containers:</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                            {nodes.filter((node) => node.type === 'container').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Components:</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                            {nodes.filter((node) => node.type !== 'container').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Connections:</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                            {edges.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Selected:</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                            {selectedElements.nodes.length + selectedElements.edges.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}

                    {/* Universal Property Editor Panel */}
                    {propertyPanelOpen && (
                        <Panel
                            position={propertyPanelMinimized ? 'bottom-right' : 'top-right'}
                            style={propertyPanelMinimized ? { right: '16px', bottom: '16px' } : { top: '110px', right: '16px', bottom: '16px' }}
                        >
                            <TailwindPropertyEditor
                                selectedNode={selectedElements.nodes.length === 1 ? selectedElements.nodes[0] : null}
                                selectedEdge={selectedElements.edges.length === 1 ? selectedElements.edges[0] : null}
                                onElementPropertyChange={handleElementPropertyChange}
                                minimized={propertyPanelMinimized}
                                onToggleMinimized={togglePropertyPanelMinimized}
                                onClose={() => { setPropertyPanelOpen(false); setPropertyPanelMinimized(false); }}
                            />
                        </Panel>
                    )}
                </ReactFlow>
            </div>

            {/* Modals */}
            <PromptModal
                isOpen={promptModal.isOpen}
                title={promptModal.title}
                message={promptModal.message}
                defaultValue={promptModal.defaultValue}
                onConfirm={promptModal.onConfirm}
                onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ContainerSelectorModal
                isOpen={containerSelectorModal.isOpen}
                title={containerSelectorModal.title}
                message={containerSelectorModal.message}
                containers={containerSelectorModal.containers}
                onSelect={containerSelectorModal.onSelect}
                onCancel={() => setContainerSelectorModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ShapeSelectorModal
                isOpen={shapeSelectorModal.isOpen}
                onSelect={(shapeType) => {
                    setShapeSelectorModal({ isOpen: false });
                    addShapeNode(shapeType);
                }}
                onCancel={() => setShapeSelectorModal({ isOpen: false })}
            />
            <JsonPasteModal
                isOpen={jsonPasteModal.isOpen}
                onConfirm={handleJsonPasteImport}
                onCancel={() => setJsonPasteModal({ isOpen: false, onConfirm: null })}
            />
            <JsonValidatorModal
                isOpen={jsonValidatorModal.isOpen}
                onValidate={validateJson}
                onClose={() => setJsonValidatorModal({ isOpen: false })}
            />
            
            {/* Export Modal */}
            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={closeExportModal}
                diagramData={getDiagramDataForExport()}
            />
            
            {/* Shape Library Panel */}
            <ShapeLibraryPanel
                isOpen={shapeLibraryOpen}
                onClose={() => setShapeLibraryOpen(false)}
                onShapeSelect={handleShapeSelect}
            />
            
            {/* Technical Details Panel */}
            <TechnicalDetailsPanel
                selectedElement={selectedElementForTechnicalDetails}
                isOpen={technicalDetailsPanelOpen}
                onClose={() => {
                    setTechnicalDetailsPanelOpen(false);
                    setSelectedElementForTechnicalDetails(null);
                }}
                position={panelOffset} // NEW
            />
            
            {/* Technical Details Tooltip - Removed unused component to fix ESLint errors */}
        </div>
    );

};

export default ArchitectureDiagramEditorContent;