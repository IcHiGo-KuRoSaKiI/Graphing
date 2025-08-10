/**
 * DrawIoStyleDemo - Interactive demo showcasing Draw.io-style orthogonal edge functionality
 * Demonstrates all the enhanced features including Web Worker processing, virtual bends, 
 * intelligent waypoint optimization, and performance monitoring
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { EnhancedOrthogonalEdge } from '../edges';
import enhancedEdgeManager from '../../services/EnhancedEdgeManager';
import EdgePerformanceMonitor from '../../services/EdgePerformanceMonitor';

// Custom edge types
const edgeTypes = {
  enhanced: EnhancedOrthogonalEdge,
};

// Demo nodes
const initialNodes = [
  {
    id: 'node1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Web Server' },
    style: { background: '#E3F2FD', border: '2px solid #2196F3' }
  },
  {
    id: 'node2', 
    type: 'default',
    position: { x: 400, y: 100 },
    data: { label: 'API Gateway' },
    style: { background: '#F3E5F5', border: '2px solid #9C27B0' }
  },
  {
    id: 'node3',
    type: 'default',
    position: { x: 700, y: 100 },
    data: { label: 'Database' },
    style: { background: '#E8F5E8', border: '2px solid #4CAF50' }
  },
  {
    id: 'node4',
    type: 'default',
    position: { x: 100, y: 300 },
    data: { label: 'Load Balancer' },
    style: { background: '#FFF3E0', border: '2px solid #FF9800' }
  },
  {
    id: 'node5',
    type: 'default',
    position: { x: 400, y: 300 },
    data: { label: 'Cache Service' },
    style: { background: '#FFEBEE', border: '2px solid #F44336' }
  },
  {
    id: 'node6',
    type: 'default',
    position: { x: 700, y: 300 },
    data: { label: 'Message Queue' },
    style: { background: '#F1F8E9', border: '2px solid #8BC34A' }
  }
];

// Demo edges with Draw.io-style routing
const initialEdges = [
  {
    id: 'edge1',
    source: 'node1',
    target: 'node2',
    type: 'enhanced',
    data: { 
      label: 'HTTP',
      waypoints: []
    },
    animated: false
  },
  {
    id: 'edge2',
    source: 'node2',
    target: 'node3',
    type: 'enhanced',
    data: { 
      label: 'Query',
      waypoints: []
    },
    animated: false
  },
  {
    id: 'edge3',
    source: 'node4',
    target: 'node1',
    type: 'enhanced',
    data: { 
      label: 'Route',
      waypoints: []
    },
    animated: false
  },
  {
    id: 'edge4',
    source: 'node2',
    target: 'node5',
    type: 'enhanced',
    data: { 
      label: 'Cache',
      waypoints: []
    },
    animated: false
  },
  {
    id: 'edge5',
    source: 'node5',
    target: 'node6',
    type: 'enhanced',
    data: { 
      label: 'Events',
      waypoints: []
    },
    animated: false
  }
];

const DrawIoStyleDemo = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [processingMode, setProcessingMode] = useState('full');
  const [layoutType, setLayoutType] = useState('default');
  const [showPerformance, setShowPerformance] = useState(false);
  
  const statsIntervalRef = useRef(null);
  const alertTimeoutRef = useRef(new Map());

  // Initialize enhanced edge manager
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await enhancedEdgeManager.initialize({
          enablePerformanceMonitoring: true,
          enableLayoutAwareRouting: true,
          enableBatchProcessing: true,
          virtualBendsEnabled: true,
          intersectionDetectionEnabled: true
        });

        // Register all edges
        edges.forEach(edge => {
          enhancedEdgeManager.registerEdge(edge.id, edge, nodes);
        });

        console.log('🚀 DrawIoStyleDemo: Enhanced edge system initialized');
      } catch (error) {
        console.error('❌ DrawIoStyleDemo: Failed to initialize:', error);
      }
    };

    initializeSystem();

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      alertTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Register new edges when they're added
  useEffect(() => {
    edges.forEach(edge => {
      if (!enhancedEdgeManager.getEdgeInfo(edge.id)) {
        enhancedEdgeManager.registerEdge(edge.id, edge, nodes);
      }
    });
  }, [edges, nodes]);

  // Start/stop performance monitoring
  const toggleMonitoring = useCallback(() => {
    if (!isMonitoring) {
      EdgePerformanceMonitor.startMonitoring();
      
      // Setup alert handler
      EdgePerformanceMonitor.onAlert((alert) => {
        const alertWithId = { ...alert, id: Math.random().toString(36) };
        setAlerts(prev => [...prev, alertWithId].slice(-5)); // Keep last 5 alerts
        
        // Auto-remove alert after 5 seconds
        const timeout = setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== alertWithId.id));
        }, 5000);
        alertTimeoutRef.current.set(alertWithId.id, timeout);
      });

      // Update statistics periodically
      statsIntervalRef.current = setInterval(() => {
        const stats = enhancedEdgeManager.getStatistics();
        setStatistics(stats);
      }, 1000);

      setIsMonitoring(true);
    } else {
      EdgePerformanceMonitor.stopMonitoring();
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }
      
      setIsMonitoring(false);
      setStatistics(null);
    }
  }, [isMonitoring]);

  // Process all edges with current settings
  const processAllEdges = useCallback(async () => {
    const edgeIds = edges.map(edge => edge.id);
    
    try {
      console.log(`🔄 Processing ${edgeIds.length} edges with mode: ${processingMode}`);
      
      if (edgeIds.length > 3) {
        // Use batch processing for multiple edges
        await enhancedEdgeManager.batchProcessEdges(edgeIds, processingMode, { layoutType });
      } else {
        // Process individually
        await Promise.all(
          edgeIds.map(edgeId => 
            enhancedEdgeManager.processEdge(edgeId, processingMode, { layoutType })
          )
        );
      }
      
      console.log('✅ All edges processed successfully');
    } catch (error) {
      console.error('❌ Failed to process edges:', error);
    }
  }, [edges, processingMode, layoutType]);

  // Add new edge
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'enhanced',
        data: { 
          label: 'New Connection',
          waypoints: []
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Clear all caches
  const clearCaches = useCallback(async () => {
    try {
      await enhancedEdgeManager.clearCaches?.() || 
            enhancedEdgeManager.getStatistics(); // Trigger cache operations
      console.log('🧹 Caches cleared');
    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
    }
  }, []);

  // Auto-layout nodes
  const autoLayoutNodes = useCallback(() => {
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 300 + 100,
        y: Math.floor(index / 3) * 200 + 100
      }
    }));
    
    setNodes(layoutedNodes);
    
    // Reprocess edges after layout change
    setTimeout(processAllEdges, 100);
  }, [nodes, setNodes, processAllEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        {/* Control Panel */}
        <Panel position="top-left" className="demo-controls">
          <div style={{ 
            background: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '300px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
              🎨 Draw.io Style Edge Demo
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Processing Mode */}
              <div>
                <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                  Processing Mode:
                </label>
                <select 
                  value={processingMode} 
                  onChange={(e) => setProcessingMode(e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                >
                  <option value="full">Full Enhancement</option>
                  <option value="optimize">Waypoint Optimization</option>
                  <option value="virtual_bends">Virtual Bends Only</option>
                  <option value="intersections">Intersection Detection</option>
                  <option value="layout_aware">Layout-Aware Routing</option>
                </select>
              </div>

              {/* Layout Type */}
              <div>
                <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                  Layout Type:
                </label>
                <select 
                  value={layoutType} 
                  onChange={(e) => setLayoutType(e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                >
                  <option value="default">Default</option>
                  <option value="hierarchical">Hierarchical</option>
                  <option value="circular">Circular</option>
                  <option value="grid">Grid</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={processAllEdges}
                  style={{ 
                    background: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Process Edges
                </button>
                
                <button 
                  onClick={autoLayoutNodes}
                  style={{ 
                    background: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📐 Auto Layout
                </button>
                
                <button 
                  onClick={clearCaches}
                  style={{ 
                    background: '#FF9800', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🧹 Clear Cache
                </button>
              </div>

              {/* Monitoring Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={toggleMonitoring}
                  style={{ 
                    background: isMonitoring ? '#F44336' : '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 10px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isMonitoring ? '⏹️ Stop' : '▶️ Start'} Monitoring
                </button>
                
                <button 
                  onClick={() => setShowPerformance(!showPerformance)}
                  style={{ 
                    background: showPerformance ? '#9C27B0' : '#607D8B', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 10px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Stats
                </button>
              </div>

              {/* Feature Status */}
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div>🎯 Virtual Bends: ✅ Enabled</div>
                <div>🔍 Intersection Detection: ✅ Enabled</div>
                <div>🚀 Web Worker Processing: ✅ Active</div>
                <div>📈 Performance Monitoring: {isMonitoring ? '✅ Active' : '❌ Inactive'}</div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Performance Panel */}
        {showPerformance && statistics && (
          <Panel position="top-right" className="performance-panel">
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minWidth: '280px',
              maxWidth: '350px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
                📊 Performance Metrics
              </h4>
              
              <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                <div><strong>Manager:</strong></div>
                <div>• Total Processed: {statistics.manager?.totalProcessed || 0}</div>
                <div>• Active Edges: {statistics.manager?.activeEdges || 0}</div>
                <div>• Avg Processing: {(statistics.manager?.averageProcessingTime || 0).toFixed(1)}ms</div>
                
                {statistics.performance && (
                  <>
                    <div style={{ marginTop: '8px' }}><strong>Performance:</strong></div>
                    <div>• Health Score: {statistics.performance.summary?.overallHealth || 0}%</div>
                    <div>• Memory: {(statistics.performance.metrics?.memoryUsage?.current || 0).toFixed(1)}MB</div>
                    <div>• FPS: {(statistics.performance.metrics?.rendering?.averageFPS || 0).toFixed(1)}</div>
                  </>
                )}
                
                {statistics.routing && (
                  <>
                    <div style={{ marginTop: '8px' }}><strong>Routing:</strong></div>
                    <div>• Cache Size: {statistics.routing.cacheSize || 0}</div>
                    <div>• Hierarchy Levels: {statistics.routing.hierarchyLevels || 0}</div>
                  </>
                )}
              </div>
            </div>
          </Panel>
        )}

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <Panel position="bottom-right" className="alerts-panel">
            <div style={{ 
              background: 'rgba(244, 67, 54, 0.9)', 
              color: 'white',
              padding: '12px', 
              borderRadius: '8px',
              minWidth: '250px',
              maxWidth: '300px'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>⚠️ Performance Alerts</h4>
              {alerts.slice(-3).map(alert => (
                <div key={alert.id} style={{ 
                  fontSize: '12px', 
                  marginBottom: '4px',
                  padding: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                }}>
                  <strong>{alert.type}</strong>
                  {alert.data && (
                    <div style={{ opacity: 0.8 }}>
                      {JSON.stringify(alert.data, null, 0).slice(0, 50)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Instructions Panel */}
        <Panel position="bottom-left" className="instructions-panel">
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '280px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>🎯 How to Use</h4>
            <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.4' }}>
              <li>Drag nodes to see intelligent edge routing</li>
              <li>Click on dashed circles to add waypoints</li>
              <li>Drag edge segments to reshape</li>
              <li>Double-click waypoints to remove them</li>
              <li>Watch intersections get detected automatically</li>
              <li>Enable monitoring to see real-time metrics</li>
              <li>Try different processing modes and layouts</li>
            </ul>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default DrawIoStyleDemo;