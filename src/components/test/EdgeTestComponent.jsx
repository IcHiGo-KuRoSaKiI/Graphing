/**
 * Simple test component to validate Draw.io-style edge functionality
 */

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EnhancedOrthogonalEdge } from '../edges';
import enhancedEdgeManager from '../../services/EnhancedEdgeManager';

// Edge types
const edgeTypes = {
  enhanced: EnhancedOrthogonalEdge,
};

// Test nodes
const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node A' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: 'Node B' },
  },
];

// Test edge
const initialEdges = [
  {
    id: 'test-edge',
    source: '1',
    target: '2',
    type: 'enhanced',
    data: { label: 'Test Edge' },
  },
];

const EdgeTestComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  // Initialize enhanced edge manager
  useEffect(() => {
    const init = async () => {
      try {
        setStatus('Initializing Enhanced Edge Manager...');
        await enhancedEdgeManager.initialize({
          enablePerformanceMonitoring: true,
          enableLayoutAwareRouting: true,
          enableBatchProcessing: true,
          virtualBendsEnabled: true,
          intersectionDetectionEnabled: true,
        });
        
        setStatus('Registering edges...');
        edges.forEach(edge => {
          enhancedEdgeManager.registerEdge(edge.id, edge, nodes);
        });
        
        setStatus('Ready! Try dragging nodes and edge segments.');
        setIsInitialized(true);
      } catch (error) {
        setStatus('Error: ' + error.message);
        console.error('Failed to initialize:', error);
      }
    };

    init();
  }, []);

  // Register new edges
  useEffect(() => {
    if (isInitialized) {
      edges.forEach(edge => {
        if (!enhancedEdgeManager.getEdgeInfo(edge.id)) {
          enhancedEdgeManager.registerEdge(edge.id, edge, nodes);
        }
      });
    }
  }, [edges, nodes, isInitialized]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'enhanced',
        data: { label: 'New Edge' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>Draw.io-Style Edge Test</h3>
        <p>{status}</p>
        <div style={{ fontSize: '12px' }}>
          <div>• Drag nodes to see intelligent routing</div>
          <div>• Click dashed circles to add waypoints</div>
          <div>• Drag edge segments to reshape</div>
          <div>• Double-click waypoints to remove</div>
        </div>
      </div>

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
      </ReactFlow>
    </div>
  );
};

export default EdgeTestComponent;