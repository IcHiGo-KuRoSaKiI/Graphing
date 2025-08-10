/**
 * Draw.io Exact Edge Implementation Test
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

import { DrawIoOrthogonalEdge } from '../edges';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 100, y: 100 },
    width: 120,
    height: 50,
  },
  {
    id: '2',
    data: { label: 'Process' },
    position: { x: 400, y: 200 },
    width: 120,
    height: 50,
  },
  {
    id: '3',
    data: { label: 'Decision' },
    position: { x: 200, y: 300 },
    width: 120,
    height: 50,
  },
  {
    id: '4',
    data: { label: 'End' },
    position: { x: 500, y: 100 },
    width: 120,
    height: 50,
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'drawio',
    data: { label: 'Flow 1' }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'drawio',
    data: { label: 'Flow 2' }
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'drawio',
    data: { label: 'Flow 3' }
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    type: 'drawio',
    data: { label: 'Direct' }
  },
];

const edgeTypes = {
  drawio: DrawIoOrthogonalEdge,
};

const DrawIoEdgeTest = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection) => {
    const edge = { ...connection, type: 'drawio' };
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
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          fontSize: '13px',
          lineHeight: '1.4'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1a73e8' }}>🎯 Draw.io EXACT Implementation</h3>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>✅ Fixed Issues:</strong>
            <br />• Minimal waypoints (max 2)
            <br />• Clean orthogonal routing
            <br />• No waypoint proliferation
            <br />• Proper segment dragging
            <br />• Simple collision avoidance
          </div>
          
          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
            <strong>🔧 How it Works:</strong>
            <br />• Route patterns (not dynamic calc)
            <br />• Jetty system (20px spacing)
            <br />• Virtual handles for dragging
            <br />• Draw.io algorithms exactly
          </div>
          
          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
            <strong>🎮 Test All Fixes:</strong>
            <br />• <strong>Hover edge segments</strong> → see blue circles with arrows
            <br />• <strong>Drag blue circles</strong> → entire segment moves (no stuck parts!)
            <br />• <strong>Hover waypoints</strong> → see green color + tooltip
            <br />• <strong>Drag waypoints</strong> → smooth responsive movement
            <br />• <strong>Double-click waypoints</strong> → remove them
            <br />• <strong>Click green + circles</strong> → add new waypoints
            <br />• <strong>Move nodes</strong> → edges auto-adjust cleanly
          </div>
          
          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px', fontSize: '11px', color: '#666' }}>
            <strong>Fixed Issues:</strong>
            <br />✅ No more stuck segments
            <br />✅ Better mouse detection (20px hit area)
            <br />✅ Responsive waypoint dragging
            <br />✅ Clean orthogonal movement
          </div>
        </div>
      </ReactFlow>
    </div>
  );
};

export default DrawIoEdgeTest;