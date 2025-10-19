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

// Import utilities
import { getDiagramBounds, migrateEdgesToEnhanced } from '../../utils/diagramHelpers';

// Import Zustand store
import useDiagramStore from '../../store/diagramStore';

// Import custom hooks
import { useNodeHandlers } from '../../hooks/useNodeHandlers';
import { useEdgeHandlers } from '../../hooks/useEdgeHandlers';
import { useClipboardHandlers } from '../../hooks/useClipboardHandlers';
import { useLayoutHandlers } from '../../hooks/useLayoutHandlers';
import { useDiagramConverters } from '../../hooks/useDiagramConverters';
import { useImportExport } from '../../hooks/useImportExport';
import { useNodeCreation } from '../../hooks/useNodeCreation';



const ArchitectureDiagramEditorContent = ({ initialDiagram, onToggleTheme, showThemeToggle, onToggleFullscreen, isFullscreen, onToggleMini, showMiniToggle }) => {
    // Service layer integration
    const [serviceFactory, setServiceFactory] = useState(null);
    const [isServiceInitialized, setIsServiceInitialized] = useState(false);

    // Initialize service layer and enhanced edge manager
    useEffect(() => {
        const initializeServices = async () => {
            try {
                const factory = ServiceFactory.create();
                await factory.initialize();
                setServiceFactory(factory);
                setIsServiceInitialized(true);
                
                // Initialize enhanced edge manager
                await enhancedEdgeManager.initialize({
                    enablePerformanceMonitoring: true,
                    enableLayoutAwareRouting: true,
                    enableBatchProcessing: true,
                    virtualBendsEnabled: true,
                    intersectionDetectionEnabled: true,
                    debounceTime: 100
                });
                
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

    // Modal state and actions from Zustand
    const modals = useDiagramStore(state => state.modals);
    const closeModal = useDiagramStore(state => state.closeModal);
    const showPromptModal = useDiagramStore(state => state.showPromptModal);
    const showConfirmModal = useDiagramStore(state => state.showConfirmModal);
    const showContainerSelectorModal = useDiagramStore(state => state.showContainerSelectorModal);
    const showShapeSelectorModal = useDiagramStore(state => state.showShapeSelectorModal);
    const showJsonPasteModal = useDiagramStore(state => state.showJsonPasteModal);
    const showJsonValidatorModal = useDiagramStore(state => state.showJsonValidatorModal);
    const showExportModal = useDiagramStore(state => state.showExportModal);

    // Local state only for things not in Zustand yet
    const [isInitialized, setIsInitialized] = useState(false);
    const [technicalDetailsPanelOpen, setTechnicalDetailsPanelOpen] = useState(false);
    const [selectedElementForTechnicalDetails, setSelectedElementForTechnicalDetails] = useState(null);
    const [technicalDetailsEnabled, setTechnicalDetailsEnabled] = useState(true);
    const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
    const [layoutPanelOpen, setLayoutPanelOpen] = useState(false);
    // currentLayoutAlgorithm now comes from useLayoutHandlers hook


    const updateNodeInternals = useUpdateNodeInternals();
    const { screenToFlowPosition, fitView } = useReactFlow();


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

    // Migrate edges to use enhanced orthogonal edge functionality
    const migrateEdgesToEnhanced = useCallback((edges) => {
    // Import/Export handlers
    const {
        exportJSON,
        exportToDrawioXML,
        exportAsPNG,
        exportAsJPG,
        exportAsSVG,
        importDiagram,
        importFromDrawioXML,
        handleJsonPasteImport,
        validateJson,
        newDiagram,
        saveDiagram,
        saveAsDiagram,
        openDiagram,
        getDiagramDataForExport
    } = useImportExport({
        serviceFactory,
        isServiceInitialized,
        reactFlowToJson,
        jsonToReactFlow,
        migrateEdgesToEnhanced,
        handleNodeLabelChange,
        saveToHistory,
        updateNodeInternals,
        fitView,
        applyAutoLayout,
        currentLayoutAlgorithm,
        setIsInitialized,
        reactFlowWrapper
    });

    // Node creation handlers
    const {
        addContainerNode,
        addComponentNode,
        addShapeNode,
        handleShapeSelect
    } = useNodeCreation({
        handleNodeLabelChange,
        saveToHistory,
        showPromptModal,
        showContainerSelectorModal,
        screenToFlowPosition,
        reactFlowWrapper
    });

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
    // migrateEdgesToEnhanced now defined earlier (before useImportExport hook) at line 223

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized]); // ONLY depend on isInitialized to prevent re-runs and clearing imported data

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

    // Import/Export functions now come from useImportExport hook (see lines 230-260)

    // onLayoutSettings
    const onLayoutSettings = useCallback(() => {
        setLayoutPanelOpen(true);
    }, []);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
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
                    onExportModal={showExportModal}

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
                promptModal={modals.prompt}
                confirmModal={modals.confirm}
                containerSelectorModal={modals.containerSelector}
                shapeSelectorModal={modals.shapeSelector}
                jsonPasteModal={modals.jsonPaste}
                jsonValidatorModal={modals.jsonValidator}
                exportModal={modals.export}
                closeModal={closeModal}
                addShapeNode={addShapeNode}
                handleJsonPasteImport={handleJsonPasteImport}
                validateJson={validateJson}
                getDiagramDataForExport={getDiagramDataForExport}
            />

            {/* Technical Details Tooltip - Removed unused component to fix ESLint errors */}
        </div>
    );
    });

};

export default ArchitectureDiagramEditorContent;