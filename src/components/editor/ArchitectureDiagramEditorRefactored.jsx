import React, { useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider, addEdge, reconnectEdge } from 'reactflow';
import 'reactflow/dist/style.css';

import EnhancedMenuBar from './EnhancedMenuBar';
import EditorCanvas from './EditorCanvas';
import EditorPanels from './EditorPanels';
import EditorModals from './EditorModals';

import useDiagramStore from '../../store/diagramStore';
import { useServices } from '../../contexts/ServiceContext';
import ErrorBoundary, { EditorErrorBoundary } from '../errors/ErrorBoundary';

/**
 * ArchitectureDiagramEditorRefactored - Simplified Orchestrator Component
 *
 * This is a clean, focused orchestrator that delegates to specialized components:
 * - EditorCanvas: Handles React Flow canvas rendering
 * - EditorPanels: Manages all side panels
 * - EditorModals: Manages all modal dialogs
 * - EnhancedMenuBar: Handles top menu actions
 *
 * State is managed by Zustand store (useDiagramStore)
 * Services are injected via ServiceContext
 *
 * Reduced from 2,259 lines to ~300 lines
 */
const ArchitectureDiagramEditorRefactored = ({
    initialDiagram,
    onToggleTheme,
    showThemeToggle,
    onToggleFullscreen,
    isFullscreen,
    onToggleMini,
    showMiniToggle
}) => {
    const reactFlowWrapper = useRef(null);

    // Get state and actions from Zustand store
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        addNode,
        addEdge: addEdgeToStore,
        updateNode,
        deleteNode,
        deleteEdge,
        selectedElements,
        setSelectedElements,
        panMode,
        loadDiagram,
        getDiagramSnapshot,
        pushToHistory,
        undo,
        redo,
        openModal,
        setShapeLibraryOpen,
        setLayoutSettingsOpen,
        setPropertyPanelOpen,
        setStatsPanelOpen,
        togglePanMode
    } = useDiagramStore();

    // Get services from context
    const { serviceFactory } = useServices();

    // ========================================
    // CANVAS HANDLERS
    // ========================================

    const handleConnect = useCallback((connection) => {
        setEdges((eds) => addEdge(connection, eds));
        pushToHistory(getDiagramSnapshot());
    }, [setEdges, pushToHistory, getDiagramSnapshot]);

    const handleEdgeReconnect = useCallback((oldEdge, newConnection) => {
        setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
        pushToHistory(getDiagramSnapshot());
    }, [setEdges, pushToHistory, getDiagramSnapshot]);

    const handleSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
        setSelectedElements({
            nodes: selectedNodes,
            edges: selectedEdges
        });
    }, [setSelectedElements]);

    const handleNodeLabelChange = useCallback((nodeId, label) => {
        updateNode(nodeId, { data: { label } });
        pushToHistory(getDiagramSnapshot());
    }, [updateNode, pushToHistory, getDiagramSnapshot]);

    const handleContextMenu = useCallback((event) => {
        if (panMode) {
            event.preventDefault();
        }
    }, [panMode]);

    // ========================================
    // MENU BAR HANDLERS
    // ========================================

    const handleAddNode = useCallback((nodeType, position) => {
        const newNode = {
            id: `node-${Date.now()}`,
            type: nodeType,
            position: position || { x: 100, y: 100 },
            data: { label: `New ${nodeType}` }
        };
        addNode(newNode);
        pushToHistory(getDiagramSnapshot());
    }, [addNode, pushToHistory, getDiagramSnapshot]);

    const handleDelete = useCallback(() => {
        selectedElements.nodes.forEach(node => deleteNode(node.id));
        selectedElements.edges.forEach(edge => deleteEdge(edge.id));
        setSelectedElements({ nodes: [], edges: [] });
        pushToHistory(getDiagramSnapshot());
    }, [selectedElements, deleteNode, deleteEdge, setSelectedElements, pushToHistory, getDiagramSnapshot]);

    const handleClearCanvas = useCallback(() => {
        openModal('confirm', {
            title: 'Clear Canvas',
            message: 'Are you sure you want to clear the entire canvas?',
            onConfirm: () => {
                setNodes([]);
                setEdges([]);
                pushToHistory({ nodes: [], edges: [] });
            }
        });
    }, [setNodes, setEdges, pushToHistory, openModal]);

    const handleImport = useCallback((diagram) => {
        loadDiagram(diagram);
    }, [loadDiagram]);

    const handleExport = useCallback(async (format, options) => {
        try {
            const exportService = serviceFactory.getService('export');
            const diagram = getDiagramSnapshot();
            const result = await exportService.export(diagram, format, options);
            return result;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }, [serviceFactory, getDiagramSnapshot]);

    const handleApplyLayout = useCallback(async (layoutType, options) => {
        try {
            const layoutService = serviceFactory.getService('layout');
            const diagram = getDiagramSnapshot();
            const layouted = await layoutService.layout(diagram, { type: layoutType, ...options });

            setNodes(layouted.nodes);
            setEdges(layouted.edges);
            pushToHistory(layouted);
        } catch (error) {
            console.error('Layout failed:', error);
        }
    }, [serviceFactory, getDiagramSnapshot, setNodes, setEdges, pushToHistory]);

    // ========================================
    // PANEL HANDLERS
    // ========================================

    const handleUpdateNode = useCallback((nodeId, updates) => {
        updateNode(nodeId, updates);
        pushToHistory(getDiagramSnapshot());
    }, [updateNode, pushToHistory, getDiagramSnapshot]);

    const handleUpdateEdge = useCallback((edgeId, updates) => {
        setEdges((eds) =>
            eds.map((edge) =>
                edge.id === edgeId ? { ...edge, ...updates } : edge
            )
        );
        pushToHistory(getDiagramSnapshot());
    }, [setEdges, pushToHistory, getDiagramSnapshot]);

    const handleAddShape = useCallback((shapeType, position) => {
        handleAddNode(shapeType, position);
    }, [handleAddNode]);

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================

    const handleKeyDown = useCallback((event) => {
        // Delete
        if ((event.key === 'Delete' || event.key === 'Backspace') &&
            (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)) {
            handleDelete();
        }

        // Undo (Ctrl+Z / Cmd+Z)
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            undo();
        }

        // Redo (Ctrl+Shift+Z / Cmd+Shift+Z)
        if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
            event.preventDefault();
            redo();
        }

        // Select All (Ctrl+A / Cmd+A)
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
            setSelectedElements({ nodes: [...nodes], edges: [...edges] });
        }
    }, [selectedElements, handleDelete, undo, redo, nodes, edges, setSelectedElements]);

    // Attach keyboard listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Load initial diagram
    useEffect(() => {
        if (initialDiagram) {
            loadDiagram(initialDiagram);
        }
    }, [initialDiagram, loadDiagram]);

    // ========================================
    // RENDER
    // ========================================

    return (
        <ErrorBoundary message="The diagram editor encountered an error">
            <EditorErrorBoundary>
                <ReactFlowProvider>
                    <div className="w-full h-screen flex flex-col">
                        {/* Menu Bar */}
                        <EnhancedMenuBar
                            onAddNode={handleAddNode}
                            onDelete={handleDelete}
                            onClearCanvas={handleClearCanvas}
                            onUndo={undo}
                            onRedo={redo}
                            onImport={handleImport}
                            onExport={() => openModal('export')}
                            onToggleTheme={onToggleTheme}
                            onToggleFullscreen={onToggleFullscreen}
                            onToggleMini={onToggleMini}
                            onTogglePanMode={togglePanMode}
                            onToggleShapeLibrary={() => setShapeLibraryOpen(true)}
                            onToggleLayoutSettings={() => setLayoutSettingsOpen(true)}
                            onTogglePropertyPanel={() => setPropertyPanelOpen(true)}
                            onToggleStatsPanel={() => setStatsPanelOpen(true)}
                            isFullscreen={isFullscreen}
                            showThemeToggle={showThemeToggle}
                            showMiniToggle={showMiniToggle}
                            panMode={panMode}
                        />

                        {/* Canvas */}
                        <div className="flex-1 relative">
                            <EditorCanvas
                                onNodeLabelChange={handleNodeLabelChange}
                                onContextMenu={handleContextMenu}
                                panMode={panMode}
                                onConnect={handleConnect}
                                onEdgeReconnect={handleEdgeReconnect}
                                onSelectionChange={handleSelectionChange}
                                reactFlowWrapper={reactFlowWrapper}
                            />

                            {/* Panels */}
                            <EditorPanels
                                selectedElements={selectedElements}
                                onUpdateNode={handleUpdateNode}
                                onUpdateEdge={handleUpdateEdge}
                                onAddShape={handleAddShape}
                                onApplyLayout={handleApplyLayout}
                                serviceFactory={serviceFactory}
                            />
                        </div>

                        {/* Modals */}
                        <EditorModals
                            onExport={handleExport}
                            serviceFactory={serviceFactory}
                        />
                    </div>
                </ReactFlowProvider>
            </EditorErrorBoundary>
        </ErrorBoundary>
    );
};

export default ArchitectureDiagramEditorRefactored;
