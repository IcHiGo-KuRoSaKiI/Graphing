import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    MiniMap,
    Panel,
    applyNodeChanges,
    applyEdgeChanges,
    useUpdateNodeInternals,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import node components
import DiamondNode from '../nodes/DiamondNode';
import CircleNode from '../nodes/CircleNode';
import HexagonNode from '../nodes/HexagonNode';
import ContainerNode from '../nodes/ContainerNode';
import ComponentNode from '../nodes/ComponentNode';

// Import modal components
import PromptModal from '../modals/PromptModal';
import ConfirmModal from '../modals/ConfirmModal';
import ContainerSelectorModal from '../modals/ContainerSelectorModal';
import ShapeSelectorModal from '../modals/ShapeSelectorModal';

// Import editor components
import TailwindPropertyEditor from './TailwindPropertyEditor';

import EnhancedMenuBar from './EnhancedMenuBar';


const ArchitectureDiagramEditorContent = () => {
    // State for nodes and edges
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });
    const [history, setHistory] = useState({ past: [], present: { nodes: [], edges: [] }, future: [] });
    const [isInitialized, setIsInitialized] = useState(false);
    const [clipboardData, setClipboardData] = useState(null);
    const [propertyPanelOpen, setPropertyPanelOpen] = useState(true);

    const updateNodeInternals = useUpdateNodeInternals();

    // State for modals
    const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [containerSelectorModal, setContainerSelectorModal] = useState({ isOpen: false, title: '', message: '', containers: [], onSelect: null });
    const [shapeSelectorModal, setShapeSelectorModal] = useState({ isOpen: false });

    // Refs
    const reactFlowWrapper = useRef(null);
    const saveTimeoutRef = useRef(null);

    const togglePropertyPanel = useCallback(() => {
        setPropertyPanelOpen((prev) => !prev);
    }, []);

    // Stable default configuration with z-index
    const defaultConfig = useMemo(() => ({
        metadata: {
            name: 'Architecture Diagram',
            description: 'A sample architecture diagram',
            version: '1.0'
        },
        containers: [
            {
                id: 'container-1',
                label: 'Frontend',
                position: { x: 100, y: 100 },
                size: { width: 400, height: 300 },
                color: '#f5f5f5',
                bgColor: '#f5f5f5',
                borderColor: '#ddd',
                icon: '🖥️',
                zIndex: 1
                linkedTo: []
            },
            {
                id: 'container-2',
                label: 'Backend',
                position: { x: 600, y: 100 },
                size: { width: 400, height: 300 },
                color: '#f5f5f5',
                bgColor: '#f5f5f5',
                borderColor: '#ddd',
                icon: '⚙️',
                linkedTo: []
                zIndex: 1
            }
        ],
        nodes: [
            {
                id: 'component-1',
                label: 'React UI',
                position: { x: 150, y: 150 },
                size: { width: 150, height: 80 },
                color: '#E3F2FD',
                borderColor: '#90CAF9',
                icon: '⚛️',
                description: 'Frontend React components',
                parentContainer: 'container-1',
                zIndex: 10
            },
            {
                id: 'component-2',
                label: 'State Management',
                position: { x: 320, y: 150 },
                size: { width: 150, height: 80 },
                color: '#E3F2FD',
                borderColor: '#90CAF9',
                icon: '🔄',
                description: 'Redux state management',
                parentContainer: 'container-1',
                zIndex: 10
            },
            {
                id: 'component-3',
                label: 'API Server',
                position: { x: 650, y: 150 },
                size: { width: 150, height: 80 },
                color: '#E8F5E9',
                borderColor: '#A5D6A7',
                icon: '🌐',
                description: 'Express.js API server',
                parentContainer: 'container-2',
                zIndex: 10
            },
            {
                id: 'component-4',
                label: 'Database',
                position: { x: 820, y: 150 },
                size: { width: 150, height: 80 },
                color: '#E8F5E9',
                borderColor: '#A5D6A7',
                icon: '💾',
                description: 'MongoDB database',
                parentContainer: 'container-2',
                zIndex: 10
            }
        ],
        connections: [
            {
                id: 'edge-1-3',
                source: 'component-1',
                target: 'component-3',
                label: 'API Calls',
                type: 'smoothstep',
                animated: true,
                zIndex: 5
            },
            {
                id: 'edge-2-1',
                source: 'component-2',
                target: 'component-1',
                label: 'State Updates',
                type: 'smoothstep',
                animated: false,
                zIndex: 5
            },
            {
                id: 'edge-3-4',
                source: 'component-3',
                target: 'component-4',
                label: 'Queries',
                type: 'smoothstep',
                animated: false,
                zIndex: 5
            }
        ]
    }), []);

    // Custom node types
    const nodeTypes = useMemo(() => ({
        diamond: DiamondNode,
        circle: CircleNode,
        hexagon: HexagonNode,
        container: ContainerNode,
        component: ComponentNode,
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

    // Convert JSON configuration to React Flow format
    const jsonToReactFlow = useCallback((config) => {
        const flowNodes = [];
        const flowEdges = [];

        // Add container nodes first
        config.containers?.forEach(container => {
            flowNodes.push({
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
                    linkedTo: container.linkedTo || [],
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

        // Add component nodes
        config.nodes?.forEach(node => {
            flowNodes.push({
                id: node.id,
                type: 'component',
                position: node.position,
                parentNode: node.parentContainer,
                extent: 'parent',
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

        // Add connections/edges
        config.connections?.forEach(connection => {
            flowEdges.push({
                id: connection.id,
                source: connection.source,
                target: connection.target,
                label: connection.label,
                type: connection.type || 'smoothstep',
                animated: connection.animated || false,
                style: {
                    strokeWidth: 2,
                    zIndex: connection.zIndex || 5
                },
                zIndex: connection.zIndex || 5,
                data: {
                    label: connection.label,
                    description: connection.description || ''
                }
            });
        });

        return { nodes: flowNodes, edges: flowEdges };
    }, [handleNodeLabelChange]);

    // Initialize diagram with default configuration - only once
    useEffect(() => {
        if (!isInitialized) {
            const { nodes: initialNodes, edges: initialEdges } = jsonToReactFlow(defaultConfig);
            setNodes(initialNodes);
            setEdges(initialEdges);
            setHistory({
                past: [],
                present: { nodes: initialNodes, edges: initialEdges },
                future: [],
            });
            setIsInitialized(true);
        }
    }, [isInitialized, jsonToReactFlow, defaultConfig]);

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

    // Optimized change handlers
    const handleNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onNodeDragStop = useCallback(() => {
        saveToHistory();
    }, [saveToHistory]);

    const defaultEdgeOptions = useMemo(() => ({
        type: 'smoothstep',
        animated: false,
        style: { strokeWidth: 2 }
    }), []);

    // Handle new connections
    const onConnect = useCallback((params) => {
        const newEdge = {
            ...params,
            id: `edge-${Date.now()}`,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2, zIndex: 5 },
            zIndex: 5,
            data: { label: '', description: '' }
        };
        setEdges((eds) => addEdge(newEdge, eds));
        saveToHistory();
    }, [saveToHistory]);

    // Handle selection changes - now includes edges
    const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
        setSelectedElements({
            nodes: selectedNodes || [],
            edges: selectedEdges || [],
        });
    }, []);

    // Handle edge click - now uses property panel instead of modal
    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        setSelectedElements({
            nodes: [],
            edges: [edge],
        });
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

    // Add new container node
    const addContainerNode = useCallback(() => {
        showPromptModal('Add Container', 'Enter container name:', 'New Container', (name) => {
            const newNode = {
                id: `container-${Date.now()}`,
                type: 'container',
                position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
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
    }, [handleNodeLabelChange, saveToHistory, showPromptModal]);

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
                            extent: 'parent',
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

    // Add new shape node
    const addShapeNode = useCallback((shapeType) => {
        showPromptModal('Add Shape', 'Enter shape name:', 'New Shape', (name) => {
            const newNode = {
                id: `${shapeType}-${Date.now()}`,
                type: shapeType,
                position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
                data: {
                    label: name,
                    icon: shapeType === 'diamond' ? '♦️' : shapeType === 'circle' ? '⭕' : '⬢',
                    color: shapeType === 'diamond' ? '#81D4FA' : shapeType === 'circle' ? '#C5E1A5' : '#FFCC80',
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
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
    }, [copySelected, pasteElements, deleteSelected]);

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

    // Export and import functions (same as before but with z-index)
    const exportDiagram = useCallback(() => {
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
                    linkedTo: container.data.linkedTo || [],
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
    }, [nodes, edges]);

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

                        // Parse mxfile structure
                        const cells = xmlDoc.querySelectorAll('mxCell');
                        const importedNodes = [];
                        const importedEdges = [];
                        const cellIdMap = new Map(); // Map old IDs to new ones

                        cells.forEach(cell => {
                            const id = cell.getAttribute('id');
                            const value = cell.getAttribute('value') || '';
                            const style = cell.getAttribute('style') || '';
                            const vertex = cell.getAttribute('vertex');
                            const edge = cell.getAttribute('edge');
                            const parent = cell.getAttribute('parent');
                            const source = cell.getAttribute('source');
                            const target = cell.getAttribute('target');

                            // Skip root cells
                            if (id === '0' || id === '1') return;

                            const geometry = cell.querySelector('mxGeometry');
                            if (!geometry) return;

                            const x = parseFloat(geometry.getAttribute('x')) || 0;
                            const y = parseFloat(geometry.getAttribute('y')) || 0;
                            const width = parseFloat(geometry.getAttribute('width')) || 120;
                            const height = parseFloat(geometry.getAttribute('height')) || 80;

                            if (vertex) {
                                // Parse node
                                const newId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                cellIdMap.set(id, newId);

                                // Determine node type from style
                                let nodeType = 'component';
                                if (style.includes('swimlane')) nodeType = 'container';
                                else if (style.includes('rhombus')) nodeType = 'diamond';
                                else if (style.includes('ellipse')) nodeType = 'circle';
                                else if (style.includes('hexagon')) nodeType = 'hexagon';

                                // Extract colors from style
                                const fillColorMatch = style.match(/fillColor=([^;]+)/);
                                const strokeColorMatch = style.match(/strokeColor=([^;]+)/);
                                const fillColor = fillColorMatch ? fillColorMatch[1] : '#ffffff';
                                const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';

                                const node = {
                                    id: newId,
                                    type: nodeType,
                                    position: { x, y },
                                    data: {
                                        label: value,
                                        color: fillColor,
                                        borderColor: strokeColor,
                                        icon: nodeType === 'container' ? '📦' : '🔹',
                                        description: '',
                                        onLabelChange: handleNodeLabelChange,
                                    },
                                    style: {
                                        width,
                                        height,
                                        zIndex: nodeType === 'container' ? 1 : 10,
                                    },
                                    draggable: true,
                                    selectable: true,
                                    zIndex: nodeType === 'container' ? 1 : 10
                                };

                                // Handle parent relationships
                                if (parent && parent !== '1' && cellIdMap.has(parent)) {
                                    node.parentNode = cellIdMap.get(parent);
                                    node.extent = 'parent';
                                }

                                importedNodes.push(node);
                            } else if (edge && source && target) {
                                // Parse edge
                                const newId = `imported-edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                                // Extract style properties
                                const strokeWidthMatch = style.match(/strokeWidth=([^;]+)/);
                                const strokeColorMatch = style.match(/strokeColor=([^;]+)/);
                                const strokeWidth = strokeWidthMatch ? parseInt(strokeWidthMatch[1]) : 2;
                                const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';
                                const isDashed = style.includes('dashed=1');

                                const edgeData = {
                                    id: newId,
                                    source: cellIdMap.get(source) || source,
                                    target: cellIdMap.get(target) || target,
                                    label: value,
                                    type: 'smoothstep',
                                    animated: false,
                                    style: {
                                        strokeWidth,
                                        stroke: strokeColor,
                                        strokeDasharray: isDashed ? '5,5' : undefined,
                                        zIndex: 5
                                    },
                                    zIndex: 5,
                                    data: { label: value, description: '' }
                                };

                                importedEdges.push(edgeData);
                            }
                        });

                        // Set imported data
                        setNodes(importedNodes);
                        setEdges(importedEdges);
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

    // Convert to draw.io XML format
    const exportToDrawioXML = useCallback(() => {
        let cellId = 0;
        const getCellId = () => `cell-${cellId++}`;

        // Map node types to draw.io shapes
        const getDrawioShape = (nodeType) => {
            switch (nodeType) {
                case 'container': return 'swimlane';
                case 'component': return 'rounded=1;whiteSpace=wrap;html=1;';
                case 'diamond': return 'rhombus;whiteSpace=wrap;html=1;';
                case 'circle': return 'ellipse;whiteSpace=wrap;html=1;';
                case 'hexagon': return 'hexagon;whiteSpace=wrap;html=1;';
                default: return 'rounded=1;whiteSpace=wrap;html=1;';
            }
        };

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Architecture Diagram Editor" version="1.0">
  <diagram name="Architecture Diagram" id="diagram1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`;

        // Add nodes
        nodes.forEach(node => {
            const id = getCellId();
            const shape = getDrawioShape(node.type);
            const isContainer = node.type === 'container';

            xml += `
        <mxCell id="${id}" value="${node.data.label || ''}" style="${shape}fillColor=${node.data.color || '#ffffff'};strokeColor=${node.data.borderColor || '#000000'};strokeWidth=2;" vertex="1" ${node.parentNode ? `parent="${node.parentNode}"` : 'parent="1"'}>
          <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${node.style?.width || 120}" height="${node.style?.height || 80}" as="geometry"/>
        </mxCell>`;
        });

        // Add edges
        edges.forEach(edge => {
            const id = getCellId();
            const strokeWidth = edge.style?.strokeWidth || 2;
            const strokeColor = edge.style?.stroke || '#000000';
            const strokeDash = edge.style?.strokeDasharray ? 'dashed=1;' : '';

            xml += `
        <mxCell id="${id}" value="${edge.data?.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=${strokeWidth};strokeColor=${strokeColor};${strokeDash}" edge="1" parent="1" source="${edge.source}" target="${edge.target}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
        });

        xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

        const dataUri = 'data:application/xml;charset=utf-8,' + encodeURIComponent(xml);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'architecture-diagram.drawio');
        linkElement.click();
    }, [nodes, edges]);

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
                        setNodes(importedNodes);
                        setEdges(importedEdges);
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
    }, [jsonToReactFlow, saveToHistory]);

    const resetDiagram = useCallback(() => {
        showConfirmModal(
            'Reset Diagram',
            'Are you sure you want to reset the diagram to the default template? All unsaved changes will be lost.',
            () => {
                const { nodes: defaultNodes, edges: defaultEdges } = jsonToReactFlow(defaultConfig);
                setNodes(defaultNodes);
                setEdges(defaultEdges);
                saveToHistory();
            }
        );
    }, [jsonToReactFlow, defaultConfig, saveToHistory, showConfirmModal]);

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
                const { nodes: defaultNodes, edges: defaultEdges } = jsonToReactFlow(defaultConfig);
                setNodes(defaultNodes);
                setEdges(defaultEdges);
                setSelectedElements({ nodes: [], edges: [] });
                saveToHistory();
            }
        );
    }, [jsonToReactFlow, defaultConfig, saveToHistory, showConfirmModal]);

    const saveDiagram = useCallback(() => {
        exportDiagram();
    }, [exportDiagram]);

    const saveAsDiagram = useCallback(() => {
        exportDiagram();
    }, [exportDiagram]);

    const openDiagram = useCallback(() => {
        importDiagram();
    }, [importDiagram]);

    // Enhanced export functions (placeholders for future)
    const exportAsPNG = useCallback(async () => {
        console.log('Export as PNG - to be implemented');
        alert('PNG export coming soon!');
    }, []);

    const exportAsSVG = useCallback(async () => {
        console.log('Export as SVG - to be implemented');
        alert('SVG export coming soon!');
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
        const others = selectedElements.nodes.filter(n => n.type !== 'container');

        // Only containers selected -> record linking instead of parent/child
        if (containers.length >= 2 && others.length === 0) {
            setNodes(nds => nds.map(node => {
                const isSel = containers.find(c => c.id === node.id);
                if (isSel) {
                    const otherIds = containers.filter(c => c.id !== node.id).map(c => c.id);
                    const linked = Array.from(new Set([...(node.data.linkedTo || []), ...otherIds]));
                    return { ...node, data: { ...node.data, linkedTo: linked } };
                }
                return node;
            }));
            saveToHistory();
            return;
        }

        let parent = containers[0] || selectedElements.nodes[0];
        const children = selectedElements.nodes.filter(n => n.id !== parent.id && n.type !== 'container');

        setNodes((nds) => nds.map((node) => {
            const child = children.find(c => c.id === node.id);
            if (child) {
                const parentNode = nds.find(n => n.id === parent.id);
                const offset = parentNode ? {
                    x: node.position.x - parentNode.position.x,
                    y: node.position.y - parentNode.position.y
                } : node.position;
                return { ...node, parentNode: parent.id, extent: 'parent', position: offset };
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
            const containers = selectedElements.nodes.filter(n => n.type === 'container');

            if (containers.length >= 2 && containers.length === selectedElements.nodes.length) {
                setNodes(nds => nds.map(node => {
                    if (containers.find(c => c.id === node.id)) {
                        const removeIds = containers.filter(c => c.id !== node.id).map(c => c.id);
                        const linked = (node.data.linkedTo || []).filter(id => !removeIds.includes(id));
                        return { ...node, data: { ...node.data, linkedTo: linked } };
                    }
                    return node;
                }));
                saveToHistory();
                return;
            }

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
    }, [selectedElements, edges]);

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

        setNodes(nodes => [...nodes, ...newNodes]);
        setEdges(edges => [...edges, ...newEdges]);
        saveToHistory();

        // Optionally show a toast notification
        // toast.success(`Pasted ${newNodes.length} nodes and ${newEdges.length} connections`);
    }, [clipboardData, saveToHistory]);


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

            {/* Header */}
            <div className="flex flex-col bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg z-10">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
                    <div className="flex items-center">
                        <h1 className="text-lg font-semibold text-white flex items-center gap-3 m-0">
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
                    onImportDrawio={importFromDrawioXML}
                    onExportJSON={exportDiagram}
                    onExportDrawio={exportToDrawioXML}
                    onExportPNG={exportAsPNG}
                    onExportSVG={exportAsSVG}

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

                    // Link operations
                    onLinkNodes={linkSelectedNodes}
                    onUnlinkNodes={unlinkSelectedNodes}

                    // State props
                    canUndo={history.past.length > 0}
                    canRedo={history.future.length > 0}
                    hasSelection={selectedElements.nodes.length > 0 || selectedElements.edges.length > 0}
                    hasClipboard={clipboardData !== null}
                    canLink={selectedElements.nodes.length >= 2}
                    onTogglePropertiesPanel={togglePropertyPanel}
                />

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 p-2 bg-white/5 border-t border-white/10">
                    <button
                        className={`p-2 rounded flex items-center justify-center w-9 h-9 text-white bg-white/10 border border-white/20 transition-all ${history.past.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                        onClick={undo}
                        disabled={history.past.length === 0}
                        title="Undo (Ctrl+Z)"
                    >
                        ↩️
                    </button>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-9 h-9 text-white bg-white/10 border border-white/20 transition-all ${history.future.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                        onClick={redo}
                        disabled={history.future.length === 0}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        ↪️
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-1"></div>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-9 h-9 text-white bg-white/10 border border-white/20 transition-all ${selectedElements.nodes.length === 0 && selectedElements.edges.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                        onClick={copySelectedWithLinks}
                        disabled={selectedElements.nodes.length === 0 && selectedElements.edges.length === 0}
                        title="Copy (Ctrl+C)"
                    >
                        📋
                    </button>
                    <button
                        className={`p-2 rounded flex items-center justify-center w-9 h-9 text-white bg-white/10 border border-white/20 transition-all ${!clipboardData ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md'
                            }`}
                        onClick={pasteElementsWithLinks}
                        disabled={!clipboardData}
                        title="Paste (Ctrl+V)"
                    >
                        📄
                    </button>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 w-full h-full relative bg-white dark:bg-gray-800" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    onEdgeClick={onEdgeClick}
                    onNodeDragStop={onNodeDragStop}
                    nodeTypes={nodeTypes}
                    fitView
                    snapToGrid={false}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    attributionPosition="bottom-right"
                    deleteKeyCode={null}
                    selectionOnDrag
                    panOnDrag={[1, 2]}
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
                    <Panel position="top-right" className="m-4">
                        <div className="bg-white/98 dark:bg-gray-800/98 rounded-lg shadow-lg backdrop-blur-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200">
                                Diagram Statistics
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Containers:</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-2 py-1 rounded-full text-xs">
                                        {nodes.filter((node) => node.type === 'container').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Components:</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-2 py-1 rounded-full text-xs">
                                        {nodes.filter((node) => node.type !== 'container').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Connections:</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-2 py-1 rounded-full text-xs">
                                        {edges.length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Selected:</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-2 py-1 rounded-full text-xs">
                                        {selectedElements.nodes.length + selectedElements.edges.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Universal Property Editor Panel */}
                    {propertyPanelOpen && (
                        <Panel position="bottom-right" className="m-4">
                            <TailwindPropertyEditor
                                selectedNode={selectedElements.nodes.length === 1 ? selectedElements.nodes[0] : null}
                                selectedEdge={selectedElements.edges.length === 1 ? selectedElements.edges[0] : null}
                                onElementPropertyChange={handleElementPropertyChange}
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
        </div>
    );

};

export default ArchitectureDiagramEditorContent;