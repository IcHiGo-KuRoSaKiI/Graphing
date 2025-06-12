import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import node components
import DiamondNode from '../nodes/DiamondNode';
import CircleNode from '../nodes/CircleNode';
import HexagonNode from '../nodes/HexagonNode';
import TriangleNode from '../nodes/TriangleNode';
import ContainerNode from '../nodes/ContainerNode';
import ComponentNode from '../nodes/ComponentNode';
import { AdjustableEdge } from '../edges';

// Import modal components
import PromptModal from '../modals/PromptModal';
import ConfirmModal from '../modals/ConfirmModal';
import ContainerSelectorModal from '../modals/ContainerSelectorModal';
import ShapeSelectorModal from '../modals/ShapeSelectorModal';
import JsonPasteModal from '../modals/JsonPasteModal';
import JsonValidatorModal from '../modals/JsonValidatorModal';

// Import editor components
import TailwindPropertyEditor from './TailwindPropertyEditor';

import EnhancedMenuBar from './EnhancedMenuBar';
import Ajv from 'ajv';

const diagramSchema = {
    type: 'object',
    properties: {
        containers: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'label', 'position', 'size'],
                properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    position: {
                        type: 'object',
                        required: ['x', 'y'],
                        properties: {
                            x: { type: 'number' },
                            y: { type: 'number' }
                        }
                    },
                    size: {
                        type: 'object',
                        required: ['width', 'height'],
                        properties: {
                            width: { type: 'number' },
                            height: { type: 'number' }
                        }
                    }
                }
            }
        },
        nodes: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'label', 'position'],
                properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    position: {
                        type: 'object',
                        required: ['x', 'y'],
                        properties: {
                            x: { type: 'number' },
                            y: { type: 'number' }
                        }
                    }
                }
            }
        },
        connections: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'source', 'target'],
                properties: {
                    id: { type: 'string' },
                    source: { type: 'string' },
                    target: { type: 'string' }
                }
            }
        }
    },
    required: ['containers', 'nodes', 'connections']
};

const ajv = new Ajv();
const validateDiagram = ajv.compile(diagramSchema);


const ArchitectureDiagramEditorContent = ({ initialDiagram, onToggleTheme, showThemeToggle, onToggleFullscreen, isFullscreen }) => {
    // State for nodes and edges
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });
    const [history, setHistory] = useState({ past: [], present: { nodes: [], edges: [] }, future: [] });
    const [isInitialized, setIsInitialized] = useState(false);
    const [clipboardData, setClipboardData] = useState(null);
    const [propertyPanelOpen, setPropertyPanelOpen] = useState(true);
    const [statsPanelOpen, setStatsPanelOpen] = useState(true);

    const updateNodeInternals = useUpdateNodeInternals();

    // State for modals
    const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [containerSelectorModal, setContainerSelectorModal] = useState({ isOpen: false, title: '', message: '', containers: [], onSelect: null });
    const [shapeSelectorModal, setShapeSelectorModal] = useState({ isOpen: false });
    const [jsonPasteModal, setJsonPasteModal] = useState({ isOpen: false, onConfirm: null });
    const [jsonValidatorModal, setJsonValidatorModal] = useState({ isOpen: false });

    // Refs
    const reactFlowWrapper = useRef(null);
    const saveTimeoutRef = useRef(null);

    const togglePropertyPanel = useCallback(() => {
        setPropertyPanelOpen((prev) => !prev);
    }, []);

    const toggleStatsPanel = useCallback(() => {
        setStatsPanelOpen((prev) => !prev);
    }, []);

    // Custom node types
    const nodeTypes = useMemo(() => ({
        diamond: DiamondNode,
        circle: CircleNode,
        hexagon: HexagonNode,
        triangle: TriangleNode,
        container: ContainerNode,
        component: ComponentNode,
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
                type: connection.type || 'floating',
                animated: connection.animated || false,
                style: {
                    strokeWidth: 2,
                    zIndex: connection.zIndex || 5
                },
                zIndex: connection.zIndex || 5,
                markerStart: connection.markerStart,
                markerEnd: connection.markerEnd || { type: 'arrow' },
                data: {
                    label: connection.label,
                    description: connection.description || '',
                    control: connection.control,
                    intersection: connection.intersection || 'none'
                }
            });
        });

        return { nodes: flowNodes, edges: flowEdges };
    }, [handleNodeLabelChange]);

    // Initialize diagram from the provided configuration
    useEffect(() => {
        if (!isInitialized) {
            const config = initialDiagram || { containers: [], nodes: [], connections: [] };
            const { nodes: initialNodes, edges: initialEdges } = jsonToReactFlow(config);
            setNodes(initialNodes);
            setEdges(initialEdges);
            setHistory({
                past: [],
                present: { nodes: initialNodes, edges: initialEdges },
                future: [],
            });
            setIsInitialized(true);
        }
    }, [isInitialized, jsonToReactFlow, initialDiagram]);

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

    const onNodeDragStop = useCallback(() => {
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

    const defaultEdgeOptions = useMemo(() => ({
        type: 'adjustable',
        animated: true,
        style: { strokeWidth: 2, stroke: '#2563eb', strokeDasharray: '5 5' },
        data: { intersection: 'none' }
    }), []);

    // Handle new connections
    const onConnect = useCallback((params) => {
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
                intersection: 'none', // Default to no intersection
                control: null // Will be auto-calculated
            }
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
                control: edge.data?.control,
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

    // Convert to draw.io XML format
    const exportToDrawioXML = useCallback(() => {
        // Map node types to draw.io shapes
        const getDrawioShape = (nodeType) => {
            switch (nodeType) {
                case 'container':
                    return 'swimlane;';
                case 'component': return 'rounded=1;whiteSpace=wrap;html=1;';
                case 'diamond': return 'rhombus;whiteSpace=wrap;html=1;';
                case 'circle': return 'ellipse;whiteSpace=wrap;html=1;';
                case 'hexagon': return 'hexagon;whiteSpace=wrap;html=1;';
                case 'triangle': return 'triangle;whiteSpace=wrap;html=1;';
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
            const shape = getDrawioShape(node.type);
            const valueText = [node.data.label || '', node.data.description || ''].filter(Boolean).join('\n');

            xml += `
        <mxCell id="${node.id}" value="${valueText}" style="${shape}fillColor=${node.data.color || '#ffffff'};strokeColor=${node.data.borderColor || '#000000'};strokeWidth=2;" vertex="1" parent="${node.parentNode || '1'}">
          <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${node.style?.width || 120}" height="${node.style?.height || 80}" as="geometry"/>
        </mxCell>`;
        });

        const allEdges = edges;

        // Add edges
        allEdges.forEach(edge => {
            const strokeWidth = edge.style?.strokeWidth || 2;
            const strokeColor = edge.style?.stroke || '#000000';
            const strokeDash = edge.style?.strokeDasharray ? 'dashed=1;' : '';

            xml += `
        <mxCell id="${edge.id}" value="${edge.data?.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=${strokeWidth};strokeColor=${strokeColor};${strokeDash}" edge="1" parent="1" source="${edge.source}" target="${edge.target}">
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

    const importDiagramObject = useCallback((data) => {
        if (!validateDiagram(data)) {
            alert('Invalid diagram JSON');
            return;
        }
        const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);
        setNodes(importedNodes);
        setEdges(importedEdges);
        saveToHistory();
    }, [jsonToReactFlow, saveToHistory]);


    const handleJsonPasteImport = useCallback((data) => {
        importDiagramObject(data);
        setJsonPasteModal({ isOpen: false, onConfirm: null });
    }, [importDiagramObject]);

    const validateJson = useCallback((data) => {
        const valid = validateDiagram(data);
        const errors = valid ? [] : (validateDiagram.errors || []).map(e => `${e.instancePath} ${e.message}`);
        return { valid, errors };
    }, []);

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
                setNodes([]);
                setEdges([]);
                setSelectedElements({ nodes: [], edges: [] });
                saveToHistory();
            }
        );
    }, [saveToHistory, showConfirmModal]);

    const saveDiagram = useCallback(() => {
        exportDiagram();
    }, [exportDiagram]);

    const saveAsDiagram = useCallback(() => {
        exportDiagram();
    }, [exportDiagram]);

    const openDiagram = useCallback(() => {
        importDiagram();
    }, [importDiagram]);

    // Image export helpers
    const exportAsPNG = useCallback(async () => {
        if (!reactFlowWrapper.current) return;
        const renderer = reactFlowWrapper.current.querySelector('.react-flow__renderer') || reactFlowWrapper.current;
        const isDark = !!reactFlowWrapper.current.closest('.dark');
        const dataUrl = await toPng(renderer, {
            cacheBust: true,
            backgroundColor: isDark ? '#111111' : '#ffffff'
        });
        const link = document.createElement('a');
        link.download = 'diagram.png';
        link.href = dataUrl;
        link.click();
    }, []);

    const exportAsJPG = useCallback(async () => {
        if (!reactFlowWrapper.current) return;
        const renderer = reactFlowWrapper.current.querySelector('.react-flow__renderer') || reactFlowWrapper.current;
        const isDark = !!reactFlowWrapper.current.closest('.dark');
        const dataUrl = await toJpeg(renderer, {
            cacheBust: true,
            quality: 0.95,
            backgroundColor: isDark ? '#111111' : '#ffffff'
        });
        const link = document.createElement('a');
        link.download = 'diagram.jpg';
        link.href = dataUrl;
        link.click();
    }, []);

    const exportAsSVG = useCallback(async () => {
        if (!reactFlowWrapper.current) return;
        const renderer = reactFlowWrapper.current.querySelector('.react-flow__renderer') || reactFlowWrapper.current;
        const isDark = !!reactFlowWrapper.current.closest('.dark');
        const dataUrl = await toSvg(renderer, {
            cacheBust: true,
            backgroundColor: isDark ? '#111111' : '#ffffff'
        });
        const link = document.createElement('a');
        link.download = 'diagram.svg';
        link.href = dataUrl;
        link.click();
    }, []);

    const autoLayout = useCallback(() => {
        const updated = [...nodes];
        const containers = updated.filter(n => n.type === 'container');
        let currentX = 50;
        const containerSpacing = 60;

        containers.forEach(container => {
            const width = container.style?.width || 400;
            const containerY = 50;

            container.position = { x: currentX, y: containerY };

            const children = updated.filter(n => n.parentNode === container.id);
            const childSpacingX = 20;
            const childSpacingY = 20;
            const padding = 40;
            const cols = Math.max(1, Math.floor((width - padding) / (150 + childSpacingX)));

            children.forEach((child, index) => {
                const childWidth = child.style?.width || 150;
                const childHeight = child.style?.height || 80;
                const col = index % cols;
                const row = Math.floor(index / cols);
                child.position = {
                    x: container.position.x + padding / 2 + col * (childWidth + childSpacingX),
                    y: container.position.y + padding / 2 + row * (childHeight + childSpacingY)
                };
            });

            // expand container height to fit children
            const rows = Math.ceil(children.length / cols);
            const childHeight = 80; // default
            const neededHeight = padding + rows * (childHeight + childSpacingY);
            if (!container.style) container.style = {};
            container.style.height = Math.max(container.style?.height || 300, neededHeight);

            currentX += (container.style.width || width) + containerSpacing;
        });

        setNodes(updated);
        updated.forEach(n => updateNodeInternals(n.id));
        saveToHistory();
    }, [nodes, saveToHistory, updateNodeInternals]);

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
                    onImportJSONText={() => showJsonPasteModal(handleJsonPasteImport)}
                    onImportDrawio={importFromDrawioXML}
                    onExportJSON={exportDiagram}
                    onExportDrawio={exportToDrawioXML}
                    onExportPNG={exportAsPNG}
                    onExportJPG={exportAsJPG}
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
                    <button
                        className="p-2 rounded flex items-center justify-center w-9 h-9 text-white bg-white/10 border border-white/20 transition-all hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-md"
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? '🗗' : '🗖'}
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
                    connectOnClick={true}  // Allow connections by clicking handles
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
                    )}

                    {/* Universal Property Editor Panel */}
                    {propertyPanelOpen && (
                        <Panel position="top-right" style={{ top: '110px', right: '16px', bottom: '16px' }}>
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
        </div>
    );

};

export default ArchitectureDiagramEditorContent;