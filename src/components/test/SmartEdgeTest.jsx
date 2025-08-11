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
    position: { x: 450, y: 250 },
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
  {
    id: '4',
    data: { label: 'Obstacle Node' },
    position: { x: 275, y: 175 },
    width: 100,
    height: 50,
  },
  {
    id: '5',
    data: { label: 'Another Node' },
    position: { x: 50, y: 250 },
    width: 120,
    height: 50,
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smart',
    data: { label: 'Main Edge' }
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'smart',
    data: { label: 'Top Edge' }
  },
  {
    id: 'e3-2',
    source: '3',
    target: '2',
    type: 'smart',
    data: { label: 'Cross Edge' }
  },
  {
    id: 'e5-4',
    source: '5',
    target: '4',
    type: 'smart',
    data: { label: 'Side Edge' }
  },
  {
    id: 'e4-2',
    source: '4',
    target: '2',
    type: 'smart',
    data: { label: 'Direct Edge' }
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
          <h3>🎯 SmartOrthogonalEdge Test</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <p><strong>✅ Enhanced Features:</strong></p>
            <p>• <strong>Draw.io-style segment dragging</strong></p>
            <p>• <strong>Node collision avoidance</strong></p>
            <p>• <strong>Edge overlap prevention</strong></p>
            <p>• <strong>Enhanced hit detection</strong></p>
            <p>• <strong>Smart waypoint management</strong></p>
            
            <hr style={{ margin: '8px 0', opacity: 0.3 }} />
            
            <p><strong>🎮 How to Test:</strong></p>
            <p>• <strong>Hover edges</strong> - see visual feedback</p>
            <p>• <strong>Drag segments</strong> - orthogonal movement</p>
            <p>• <strong>Click "+" circles</strong> - add waypoints</p>
            <p>• <strong>Drag waypoints</strong> - move freely</p>
            <p>• <strong>Double-click waypoints</strong> - remove</p>
            <p>• <strong>Move nodes</strong> - edges auto-adjust</p>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
};

export default SmartEdgeTest;