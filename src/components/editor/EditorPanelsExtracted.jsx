import React from 'react';
import { Panel } from 'reactflow';
import { X } from 'lucide-react';
import TailwindPropertyEditor from './TailwindPropertyEditor';
import TechnicalDetailsPanel from './TechnicalDetailsPanel';
import ShapeLibraryPanel from './ShapeLibraryPanel';
import LayoutSettingsPanel from './LayoutSettingsPanel';

const EditorPanelsExtracted = ({
    // Stats Panel
    statsPanelOpen,
    setStatsPanelOpen,
    nodes,
    edges,
    selectedElements,
    propertyPanelOpen,

    // Property Panel
    propertyPanelMinimized,
    togglePropertyPanelMinimized,
    setPropertyPanelOpen,
    setPropertyPanelMinimized,
    handleElementPropertyChange,

    // Shape Library
    shapeLibraryOpen,
    setShapeLibraryOpen,
    handleShapeSelect,

    // Technical Details
    selectedElementForTechnicalDetails,
    technicalDetailsPanelOpen,
    setTechnicalDetailsPanelOpen,
    setSelectedElementForTechnicalDetails,
    panelOffset,

    // Layout Settings
    layoutPanelOpen,
    setLayoutPanelOpen,
    currentLayoutAlgorithm,
    setCurrentLayoutAlgorithm,
    setNodes
}) => {
    return (
        <>
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
                position={panelOffset}
            />

            {/* Layout Settings Panel */}
            {layoutPanelOpen && (
                <LayoutSettingsPanel
                    nodes={nodes}
                    setNodes={setNodes}
                    isOpen={layoutPanelOpen}
                    onClose={() => setLayoutPanelOpen(false)}
                    currentLayoutAlgorithm={currentLayoutAlgorithm}
                    onLayoutChange={setCurrentLayoutAlgorithm}
                />
            )}
        </>
    );
};

export default EditorPanelsExtracted;
