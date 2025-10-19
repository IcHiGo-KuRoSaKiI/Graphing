import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    Panel,
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
import OptimizedOrthogonalEdge from '../edges/OptimizedOrthogonalEdge';

import useDiagramStore from '../../store/diagramStore';

/**
 * EditorCanvas Component
 * Renders the React Flow canvas with nodes and edges
 * Separated from main editor for better performance and maintainability
 */
const EditorCanvas = ({
    onNodeLabelChange,
    onContextMenu,
    panMode,
    onConnect,
    onEdgeReconnect,
    onSelectionChange,
    reactFlowWrapper
}) => {
    // Get state and actions from Zustand store
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const onNodesChange = useDiagramStore(state => state.onNodesChange);
    const onEdgesChange = useDiagramStore(state => state.onEdgesChange);

    // Custom node types - memoized to prevent re-renders
    const nodeTypes = useMemo(() => ({
        diamond: DiamondNode,
        circle: CircleNode,
        hexagon: HexagonNode,
        triangle: TriangleNode,
        container: ContainerNode,
        component: ComponentNode,
        universalShape: UniversalShapeNode,
    }), []);

    // Custom edge types - all use OptimizedOrthogonalEdge
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

    // Default edge options
    const defaultEdgeOptions = useMemo(() => ({
        type: 'drawio',
        animated: false,
        style: { strokeWidth: 2 }
    }), []);

    // Connection line style
    const connectionLineStyle = useMemo(() => ({
        strokeWidth: 2,
        stroke: '#3b82f6'
    }), []);

    return (
        <div
            ref={reactFlowWrapper}
            style={{ width: '100%', height: '100%' }}
            onContextMenu={onContextMenu}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onEdgeReconnect}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineStyle={connectionLineStyle}
                fitView
                panOnScroll={panMode}
                selectionOnDrag={!panMode}
                panOnDrag={panMode}
                zoomOnScroll={!panMode}
                zoomOnPinch={!panMode}
                zoomOnDoubleClick={!panMode}
                nodesDraggable={!panMode}
                nodesConnectable={!panMode}
                elementsSelectable={!panMode}
            >
                <Background />
                <Controls />
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
            </ReactFlow>
        </div>
    );
};

export default EditorCanvas;
