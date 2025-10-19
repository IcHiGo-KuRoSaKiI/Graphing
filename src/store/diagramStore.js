import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

/**
 * Centralized Zustand store for diagram editor state
 * Replaces scattered useState hooks in ArchitectureDiagramEditorContent
 */
const useDiagramStore = create((set, get) => ({
    // ========================================
    // DIAGRAM STATE
    // ========================================
    nodes: [],
    edges: [],

    setNodes: (nodesOrUpdater) => {
        // Support both direct values and updater functions (like React's setState)
        const currentNodes = get().nodes;
        const newNodes = typeof nodesOrUpdater === 'function'
            ? nodesOrUpdater(currentNodes)
            : nodesOrUpdater;
        const validNodes = Array.isArray(newNodes) ? newNodes : [];
        console.log('🏪 STORE setNodes called:', {
            nodeCount: validNodes.length,
            nodes: validNodes,
            stackTrace: new Error().stack
        });
        set({ nodes: validNodes });
    },
    setEdges: (edgesOrUpdater) => {
        // Support both direct values and updater functions (like React's setState)
        const currentEdges = get().edges;
        const newEdges = typeof edgesOrUpdater === 'function'
            ? edgesOrUpdater(currentEdges)
            : edgesOrUpdater;
        const validEdges = Array.isArray(newEdges) ? newEdges : [];
        console.log('🏪 STORE setEdges called:', {
            edgeCount: validEdges.length,
            edges: validEdges
        });
        set({ edges: validEdges });
    },

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });
    },

    addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node]
    })),

    addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge]
    })),

    updateNode: (nodeId, updates) => set((state) => ({
        nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
        )
    })),

    deleteNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter(node => node.id !== nodeId),
        edges: state.edges.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        )
    })),

    deleteEdge: (edgeId) => set((state) => ({
        edges: state.edges.filter(edge => edge.id !== edgeId)
    })),

    // ========================================
    // SELECTION STATE
    // ========================================
    selectedElements: { nodes: [], edges: [] },

    setSelectedElements: (selection) => set({ selectedElements: selection }),

    clearSelection: () => set({
        selectedElements: { nodes: [], edges: [] }
    }),

    // ========================================
    // HISTORY STATE (Undo/Redo)
    // ========================================
    history: {
        past: [],
        present: { nodes: [], edges: [] },
        future: []
    },

    pushToHistory: (snapshot) => {
        const { history } = get();
        set({
            history: {
                past: [...history.past, history.present],
                present: snapshot,
                future: []
            }
        });
    },

    undo: () => {
        const { history, setNodes, setEdges } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        set({
            history: {
                past: newPast,
                present: previous,
                future: [history.present, ...history.future]
            },
            nodes: previous.nodes,
            edges: previous.edges
        });
    },

    redo: () => {
        const { history, setNodes, setEdges } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set({
            history: {
                past: [...history.past, history.present],
                present: next,
                future: newFuture
            },
            nodes: next.nodes,
            edges: next.edges
        });
    },

    // ========================================
    // CLIPBOARD STATE
    // ========================================
    clipboardData: null,

    setClipboardData: (data) => set({ clipboardData: data }),

    // ========================================
    // UI STATE
    // ========================================
    propertyPanelOpen: true,
    propertyPanelMinimized: false,
    statsPanelOpen: true,
    shapeLibraryOpen: false,
    layoutSettingsOpen: false,
    panMode: false,

    setPropertyPanelOpen: (open) => set({ propertyPanelOpen: open }),
    setPropertyPanelMinimized: (minimized) => set({ propertyPanelMinimized: minimized }),
    setStatsPanelOpen: (open) => set({ statsPanelOpen: open }),
    setShapeLibraryOpen: (open) => set({ shapeLibraryOpen: open }),
    setLayoutSettingsOpen: (open) => set({ layoutSettingsOpen: open }),
    setPanMode: (enabled) => set({ panMode: enabled }),

    togglePropertyPanel: () => set((state) => ({
        propertyPanelOpen: !state.propertyPanelOpen
    })),
    toggleStatsPanel: () => set((state) => ({
        statsPanelOpen: !state.statsPanelOpen
    })),
    toggleShapeLibrary: () => set((state) => ({
        shapeLibraryOpen: !state.shapeLibraryOpen
    })),
    toggleLayoutSettings: () => set((state) => ({
        layoutSettingsOpen: !state.layoutSettingsOpen
    })),
    togglePanMode: () => set((state) => ({
        panMode: !state.panMode
    })),

    // ========================================
    // MODAL STATE
    // ========================================
    modals: {
        prompt: { isOpen: false, config: {} },
        confirm: { isOpen: false, config: {} },
        containerSelector: { isOpen: false, config: {} },
        shapeSelector: { isOpen: false, config: {} },
        jsonPaste: { isOpen: false, config: {} },
        jsonValidator: { isOpen: false, config: {} },
        export: { isOpen: false, config: {} }
    },

    openModal: (modalName, config = {}) => set((state) => ({
        modals: {
            ...state.modals,
            [modalName]: { isOpen: true, config }
        }
    })),

    closeModal: (modalName) => set((state) => ({
        modals: {
            ...state.modals,
            [modalName]: { isOpen: false, config: {} }
        }
    })),

    closeAllModals: () => set({
        modals: {
            prompt: { isOpen: false, config: {} },
            confirm: { isOpen: false, config: {} },
            containerSelector: { isOpen: false, config: {} },
            shapeSelector: { isOpen: false, config: {} },
            jsonPaste: { isOpen: false, config: {} },
            jsonValidator: { isOpen: false, config: {} },
            export: { isOpen: false, config: {} }
        }
    }),

    // Helper functions for specific modals
    showPromptModal: (title, message, defaultValue, onConfirm) => {
        const wrappedOnConfirm = (value) => {
            onConfirm(value);
            get().closeModal('prompt');
        };
        set((state) => ({
            modals: {
                ...state.modals,
                prompt: {
                    isOpen: true,
                    config: { title, message, defaultValue, onConfirm: wrappedOnConfirm }
                }
            }
        }));
    },

    showConfirmModal: (title, message, onConfirm) => {
        const wrappedOnConfirm = () => {
            onConfirm();
            get().closeModal('confirm');
        };
        set((state) => ({
            modals: {
                ...state.modals,
                confirm: {
                    isOpen: true,
                    config: { title, message, onConfirm: wrappedOnConfirm }
                }
            }
        }));
    },

    showContainerSelectorModal: (title, message, containers, onSelect) => {
        const wrappedOnSelect = (containerId) => {
            onSelect(containerId);
            get().closeModal('containerSelector');
        };
        set((state) => ({
            modals: {
                ...state.modals,
                containerSelector: {
                    isOpen: true,
                    config: { title, message, containers, onSelect: wrappedOnSelect }
                }
            }
        }));
    },

    showShapeSelectorModal: () => {
        set((state) => ({
            modals: {
                ...state.modals,
                shapeSelector: {
                    isOpen: true,
                    config: {}
                }
            }
        }));
    },

    showJsonPasteModal: (onConfirm) => {
        set((state) => ({
            modals: {
                ...state.modals,
                jsonPaste: {
                    isOpen: true,
                    config: { onConfirm }
                }
            }
        }));
    },

    showJsonValidatorModal: () => {
        set((state) => ({
            modals: {
                ...state.modals,
                jsonValidator: {
                    isOpen: true,
                    config: {}
                }
            }
        }));
    },

    showExportModal: () => {
        set((state) => ({
            modals: {
                ...state.modals,
                export: {
                    isOpen: true,
                    config: {}
                }
            }
        }));
    },

    // ========================================
    // INITIALIZATION STATE
    // ========================================
    isInitialized: false,

    setIsInitialized: (initialized) => set({ isInitialized: initialized }),

    // ========================================
    // UTILITY ACTIONS
    // ========================================
    reset: () => set({
        nodes: [],
        edges: [],
        selectedElements: { nodes: [], edges: [] },
        history: {
            past: [],
            present: { nodes: [], edges: [] },
            future: []
        },
        clipboardData: null,
        isInitialized: false
    }),

    // Load diagram from external source
    loadDiagram: (diagram) => {
        const nodes = diagram.nodes || [];
        const edges = diagram.edges || [];

        set({
            nodes,
            edges,
            history: {
                past: [],
                present: { nodes, edges },
                future: []
            },
            isInitialized: true
        });
    },

    // Get current diagram snapshot
    getDiagramSnapshot: () => {
        const { nodes, edges } = get();
        return { nodes, edges };
    }
}));

export default useDiagramStore;
