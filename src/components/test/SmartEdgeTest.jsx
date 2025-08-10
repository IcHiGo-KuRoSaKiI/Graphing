/**
 * Simple test component to verify SmartOrthogonalEdge works correctly
 */

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { SmartOrthogonalEdge } from '../edges';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Source Node' },
    position: { x: 100, y: 100 },
    width: 150,
    height: 60,
  },
  {
    id: '2',
    data: { label: 'Target Node' },
    position: { x: 400, y: 300 },
    width: 150,
    height: 60,
  },
  {
    id: '3',
    data: { label: 'Middle Node' },
    position: { x: 250, y: 50 },
    width: 150,
    height: 60,
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smart',
    data: { label: 'Smart Edge 1' }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'smart',
    data: { label: 'Smart Edge 2' }
  },
  {
    id: 'e3-2',
    source: '3',
    target: '2',
    type: 'smart',
    data: { label: 'Smart Edge 3' }
  },
];

const edgeTypes = {
  smart: SmartOrthogonalEdge,
};

const SmartEdgeTest = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection) => {
    const edge = { ...connection, type: 'smart' };
    setEdges((eds) => addEdge(edge, eds));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <h3>SmartOrthogonalEdge Test</h3>
          <p>✅ Orthogonal routing</p>
          <p>✅ Collision avoidance</p>
          <p>✅ Waypoint management</p>
          <p>✅ Click + on edges to add waypoints</p>
          <p>✅ Drag segments to move them</p>
          <p>✅ Double-click waypoints to remove</p>
        </div>
      </ReactFlow>
    </div>
  );
};

export default SmartEdgeTest;