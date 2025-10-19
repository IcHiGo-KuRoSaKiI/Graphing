import React, { useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import DiamondNode from '../nodes/DiamondNode';
import CircleNode from '../nodes/CircleNode';
import HexagonNode from '../nodes/HexagonNode';
import TriangleNode from '../nodes/TriangleNode';
import ContainerNode from '../nodes/ContainerNode';
import ComponentNode from '../nodes/ComponentNode';
import UniversalShapeNode from '../nodes/UniversalShapeNode';
import OptimizedOrthogonalEdge from '../edges/OptimizedOrthogonalEdge';
import EditorPanelsExtracted from './EditorPanelsExtracted';

const EditorCanvasExtracted = ({
    // ReactFlow wrapper props
    reactFlowWrapper,
    handleContextMenu,

    // ReactFlow props
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onSelectionChange,
    onEdgeClick,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    onNodeDragStop,
    onEdgeDoubleClick,
    panMode,
    setPanMode,
    defaultEdgeOptions,

    // Panels props (passed through)
    panelsProps
}) => {
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
        adjustable: OptimizedOrthogonalEdge,
        enhanced: OptimizedOrthogonalEdge,
        smart: OptimizedOrthogonalEdge,
        drawio: OptimizedOrthogonalEdge,
        orthogonal: OptimizedOrthogonalEdge,
        segment: OptimizedOrthogonalEdge,
        elbow: OptimizedOrthogonalEdge,
        straight: OptimizedOrthogonalEdge
    }), []);

    return (
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
                connectionMode="loose"
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
                    if (e.touches.length === 2) {
                        setPanMode(true);
                    }
                }}
                onTouchEnd={(e) => {
                    if (e.touches.length === 0) {
                        // Could implement logic to restore previous pan mode state
                    }
                }}
                connectOnClick={true}
                onPaneContextMenu={handleContextMenu}
                onNodeContextMenu={handleContextMenu}
                onEdgeContextMenu={handleContextMenu}
                onEdgeDoubleClick={onEdgeDoubleClick}
                isValidConnection={(connection) => {
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

                {/* Panels - Inside ReactFlow for proper positioning */}
                <EditorPanelsExtracted {...panelsProps} />
            </ReactFlow>
        </div>
    );
};

export default EditorCanvasExtracted;
