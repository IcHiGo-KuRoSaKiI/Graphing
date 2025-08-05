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

import { ContainerNode } from '../nodes';
import { OrthogonalEdge } from '../edges';
import { useConnectionService, useOrthogonalRouting } from '../hooks';
import ConnectionPreview from '../ConnectionPreview';

const EnhancedConnectionDemo = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize enhanced connection and routing services
  const {
    isConnecting,
    connectionPreview,
    handleConnectionStart,
    handleConnectionEnd,
    handleConnectionMouseMove,
    handleConnectionMouseUp,
    updateConnectionConfig
  } = useConnectionService({
    connectionPointRadius: 6,
    connectionPointMargin: 10,
    visualFeedbackEnabled: true,
    smartAttachmentEnabled: true,
    connectionValidationEnabled: true,
  });

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
    connectionPointRadius: 6,
    connectionPointMargin: 10,
    visualFeedbackEnabled: true,
    smartAttachmentEnabled: true,
    connectionValidationEnabled: true,
    autoRouteEnabled: true,
    collisionAvoidanceEnabled: true,
    rerouteOnNodeMove: true,
  });

  // Enhanced connection handling
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge-${Date.now()}`,
      type: 'orthogonal',
      animated: false,
      style: {
        strokeWidth: 2,
        stroke: '#2563eb',
        zIndex: 5
      },
      markerEnd: { type: 'arrow' },
      data: {
        label: '',
        description: '',
        intersection: 'none',
        waypoints: [],
        autoRouted: true,
        connectionType: 'orthogonal'
      }
    };
    
    addEdgeWithRouting(newEdge);
  }, [addEdgeWithRouting]);

  // Enhanced node data with connection handlers
  const enhancedNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onConnectionStart: handleConnectionStart,
      onConnectionEnd: handleConnectionEnd,
    }
  }));

  // Add sample containers
  const addSampleContainers = useCallback(() => {
    const newNodes = [
      {
        id: 'container-1',
        type: 'container',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Frontend Container',
          description: 'React application',
          background: '#f0f9ff',
          borderColor: '#0ea5e9',
          headerColor: '#e0f2fe'
        },
        width: 200,
        height: 150,
      },
      {
        id: 'container-2',
        type: 'container',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Backend Container',
          description: 'Node.js API',
          background: '#fef3c7',
          borderColor: '#f59e0b',
          headerColor: '#fefce8'
        },
        width: 200,
        height: 150,
      },
      {
        id: 'container-3',
        type: 'container',
        position: { x: 250, y: 350 },
        data: { 
          label: 'Database Container',
          description: 'PostgreSQL',
          background: '#f3e8ff',
          borderColor: '#8b5cf6',
          headerColor: '#faf5ff'
        },
        width: 200,
        height: 150,
      },
    ];
    setNodes(newNodes);
  }, [setNodes]);

  // Update configuration
  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
    updateConnectionConfig(newConfig);
    updateRoutingConfig(newConfig);
  }, [updateConnectionConfig, updateRoutingConfig]);

  // Get routing statistics
  const stats = getRoutingStats();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '300px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        zIndex: 1000,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
          Enhanced Connection Demo
        </h3>
        
        {/* Connection Configuration */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            Connection Settings
          </h4>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={config.visualFeedbackEnabled} 
              onChange={(e) => updateConfig({ ...config, visualFeedbackEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Visual Feedback
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={config.smartAttachmentEnabled} 
              onChange={(e) => updateConfig({ ...config, smartAttachmentEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Smart Attachment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={config.connectionValidationEnabled} 
              onChange={(e) => updateConfig({ ...config, connectionValidationEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Connection Validation
          </label>
        </div>

        {/* Routing Configuration */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            Routing Settings
          </h4>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={config.autoRouteEnabled} 
              onChange={(e) => updateConfig({ ...config, autoRouteEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Auto Route Enabled
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input 
              type="checkbox" 
              checked={config.collisionAvoidanceEnabled} 
              onChange={(e) => updateConfig({ ...config, collisionAvoidanceEnabled: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Collision Avoidance
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
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
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            Actions
          </h4>
          <button 
            onClick={addSampleContainers}
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            Add Sample Containers
          </button>
          <button 
            onClick={optimizeAllEdges}
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            Optimize Layout
          </button>
          <button 
            onClick={rerouteAllEdges}
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            Reroute All
          </button>
          <button 
            onClick={clearAllManualRouting}
            style={{
              padding: '8px 12px',
              marginBottom: '8px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            Clear Manual Routing
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
              Statistics
            </h4>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              <div>Total Edges: {stats.totalEdges}</div>
              <div>Auto-routed: {stats.autoRouted}</div>
              <div>Manual: {stats.manualRouted}</div>
              <div>Avg Waypoints: {stats.averageWaypoints.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            Instructions
          </h4>
          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px', color: '#6b7280' }}>
            <li>Drag from connection points to create arrows</li>
            <li>Visual feedback shows valid/invalid targets</li>
            <li>Arrows automatically route around obstacles</li>
            <li>Drag nodes to see automatic re-routing</li>
            <li>Double-click waypoints to remove them</li>
          </ul>
        </div>
      </div>

      {/* React Flow */}
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeMove}
        nodeTypes={{ container: ContainerNode }}
        edgeTypes={{ orthogonal: OrthogonalEdge }}
        onMouseMove={handleConnectionMouseMove}
        onMouseUp={handleConnectionMouseUp}
        fitView
        style={{ backgroundColor: '#f8fafc' }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <ConnectionPreview 
          connectionPreview={connectionPreview}
          isVisible={isConnecting}
        />
      </ReactFlow>
    </div>
  );
};

export default EnhancedConnectionDemo; 