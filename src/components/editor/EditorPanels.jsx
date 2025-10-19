import React from 'react';
import { X, Move } from 'lucide-react';
import TailwindPropertyEditor from './TailwindPropertyEditor';
import TechnicalDetailsPanel from './TechnicalDetailsPanel';
import ShapeLibraryPanel from './ShapeLibraryPanel';
import LayoutSettingsPanel from './LayoutSettingsPanel';

import useDiagramStore from '../../store/diagramStore';

/**
 * EditorPanels Component
 * Manages all side panels in the diagram editor
 * Includes: Property Editor, Stats Panel, Shape Library, Layout Settings
 */
const EditorPanels = ({
    selectedElements,
    onUpdateNode,
    onUpdateEdge,
    onAddShape,
    onApplyLayout,
    serviceFactory
}) => {
    // Get panel state from Zustand store
    const propertyPanelOpen = useDiagramStore(state => state.propertyPanelOpen);
    const propertyPanelMinimized = useDiagramStore(state => state.propertyPanelMinimized);
    const statsPanelOpen = useDiagramStore(state => state.statsPanelOpen);
    const shapeLibraryOpen = useDiagramStore(state => state.shapeLibraryOpen);
    const layoutSettingsOpen = useDiagramStore(state => state.layoutSettingsOpen);

    const setPropertyPanelOpen = useDiagramStore(state => state.setPropertyPanelOpen);
    const setPropertyPanelMinimized = useDiagramStore(state => state.setPropertyPanelMinimized);
    const setStatsPanelOpen = useDiagramStore(state => state.setStatsPanelOpen);
    const setShapeLibraryOpen = useDiagramStore(state => state.setShapeLibraryOpen);
    const setLayoutSettingsOpen = useDiagramStore(state => state.setLayoutSettingsOpen);

    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);

    return (
        <>
            {/* Property Editor Panel (Right Side) */}
            {propertyPanelOpen && (
                <div
                    className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-20 ${
                        propertyPanelMinimized ? 'w-12' : 'w-80'
                    }`}
                    style={{ borderLeft: '1px solid #e5e7eb' }}
                >
                    {propertyPanelMinimized ? (
                        <div className="p-2 flex flex-col items-center gap-2">
                            <button
                                onClick={() => setPropertyPanelMinimized(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title="Expand Panel"
                            >
                                <Move className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPropertyPanelOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title="Close Panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    Properties
                                </h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPropertyPanelMinimized(true)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title="Minimize Panel"
                                    >
                                        <Move className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPropertyPanelOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title="Close Panel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-y-auto h-[calc(100%-60px)]">
                                <TailwindPropertyEditor
                                    selectedElements={selectedElements}
                                    onUpdateNode={onUpdateNode}
                                    onUpdateEdge={onUpdateEdge}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Stats Panel (Bottom Left) */}
            {statsPanelOpen && (
                <div
                    className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10"
                    style={{ minWidth: '200px' }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                            Statistics
                        </h4>
                        <button
                            onClick={() => setStatsPanelOpen(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <div className="flex justify-between">
                            <span>Nodes:</span>
                            <span className="font-semibold">{nodes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Edges:</span>
                            <span className="font-semibold">{edges.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Selected:</span>
                            <span className="font-semibold">
                                {selectedElements.nodes.length + selectedElements.edges.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Shape Library Panel */}
            {shapeLibraryOpen && (
                <ShapeLibraryPanel
                    isOpen={shapeLibraryOpen}
                    onClose={() => setShapeLibraryOpen(false)}
                    onAddShape={onAddShape}
                />
            )}

            {/* Layout Settings Panel */}
            {layoutSettingsOpen && (
                <LayoutSettingsPanel
                    isOpen={layoutSettingsOpen}
                    onClose={() => setLayoutSettingsOpen(false)}
                    onApplyLayout={onApplyLayout}
                />
            )}
        </>
    );
};

export default EditorPanels;
