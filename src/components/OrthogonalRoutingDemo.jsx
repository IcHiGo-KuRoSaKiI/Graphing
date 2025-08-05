import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Background,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

import { OrthogonalEdge } from './edges';
import { useOrthogonalRouting } from '../hooks';

const OrthogonalRoutingDemo = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Initialize orthogonal routing
  const {
    addEdgeWithRouting,
    handleNodeMove,
    optimizeAllEdges,
    rerouteAllEdges,
    clearAllManualRouting,
    getRoutingStats,
    updateRoutingConfig
  } = useOrthogonalRouting({
    autoRouteEnabled: true,
    collisionAvoidanceEnabled: true,
    rerouteOnNodeMove: true,
    gridSize: 20,
    minSpacing: 50,
    jettySize: 10,
    obstacleMargin: 20,
  });

  // Configuration state
  const [config, setConfig] = useState({
    autoRouteEnabled: true,
    collisionAvoidanceEnabled: true,
    rerouteOnNodeMove: true,
    gridSize: 20,
    minSpacing: 50,
    jettySize: 10,
    obstacleMargin: 20,
  });

  // Handle edge connection
  const onConnect = useCallback((params) => {
    addEdgeWithRouting({
      ...params,
      type: 'orthogonal',
      data: { label: `Edge ${edges.length + 1}` }
    });
  }, [addEdgeWithRouting, edges.length]);

  // Handle node movement
  const onNodeDragStop = useCallback((event, node) => {
    handleNodeMove(event, node);
  }, [handleNodeMove]);

  // Add sample nodes
  const addSampleNodes = useCallback(() => {
    const newNodes = [
      {
        id: '1',
        type: 'default',
        position: { x: 100, y: 100 },
        data: { label: 'Node 1' },
        width: 120,
        height: 60,
      },
      {
        id: '2',
        type: 'default',
        position: { x: 400, y: 100 },
        data: { label: 'Node 2' },
        width: 120,
        height: 60,
      },
      {
        id: '3',
        type: 'default',
        position: { x: 250, y: 300 },
        data: { label: 'Node 3' },
        width: 120,
        height: 60,
      },
      {
        id: '4',
        type: 'default',
        position: { x: 550, y: 300 },
        data: { label: 'Node 4' },
        width: 120,
        height: 60,
      },
      {
        id: '5',
        type: 'default',
        position: { x: 100, y: 500 },
        data: { label: 'Node 5' },
        width: 120,
        height: 60,
      },
    ];

    setNodes(newNodes);
  }, [setNodes]);

  // Add sample edges
  const addSampleEdges = useCallback(() => {
    const newEdges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'orthogonal',
        data: { label: 'Auto-routed' }
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
        type: 'orthogonal',
        data: { label: 'Collision Avoidance' }
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        type: 'orthogonal',
        data: { label: 'Smart Routing' }
      },
      {
        id: 'e3-5',
        source: '3',
        target: '5',
        type: 'orthogonal',
        data: { label: 'Orthogonal Path' }
      },
    ];

    // Auto-route all edges
    newEdges.forEach(edge => {
      addEdgeWithRouting(edge);
    });
  }, [addEdgeWithRouting]);

  // Update configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
    updateRoutingConfig(newConfig);
  }, [updateRoutingConfig]);

  // Get routing statistics
  const stats = getRoutingStats();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Orthogonal Routing Demo</h3>
        
        {/* Configuration Controls */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Configuration</h4>
          
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={config.autoRouteEnabled}
              onChange={(e) => updateConfig({ ...config, autoRouteEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Auto Route Enabled
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={config.collisionAvoidanceEnabled}
              onChange={(e) => updateConfig({ ...config, collisionAvoidanceEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Collision Avoidance
          </label>
          
          <label style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={config.rerouteOnNodeMove}
              onChange={(e) => updateConfig({ ...config, rerouteOnNodeMove: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Reroute on Node Move
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Actions</h4>
          
          <button
            onClick={addSampleNodes}
            style={{
              margin: '5px',
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Add Sample Nodes
          </button>
          
          <button
            onClick={addSampleEdges}
            style={{
              margin: '5px',
              padding: '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Add Sample Edges
          </button>
          
          <button
            onClick={optimizeAllEdges}
            style={{
              margin: '5px',
              padding: '8px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Optimize Layout
          </button>
          
          <button
            onClick={rerouteAllEdges}
            style={{
              margin: '5px',
              padding: '8px 12px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reroute All
          </button>
          
          <button
            onClick={clearAllManualRouting}
            style={{
              margin: '5px',
              padding: '8px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Clear Manual Routing
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Statistics</h4>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>Total Edges: {stats.totalEdges}</div>
              <div>Auto-routed: {stats.autoRouted}</div>
              <div>Manual: {stats.manualRouted}</div>
              <div>Avg Waypoints: {stats.averageWaypoints.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{ fontSize: '12px', color: '#666' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Instructions</h4>
          <ul style={{ margin: 0, paddingLeft: '15px' }}>
            <li>Drag nodes to see automatic re-routing</li>
            <li>Drag edge segments to adjust manually</li>
            <li>Double-click waypoints to remove them</li>
            <li>Connect nodes to see auto-routing</li>
          </ul>
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={{}}
        edgeTypes={{
          orthogonal: OrthogonalEdge,
        }}
        fitView
        style={{ backgroundColor: '#f8fafc' }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default OrthogonalRoutingDemo; 