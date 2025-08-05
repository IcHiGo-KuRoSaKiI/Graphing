import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import ConnectionService from '../services/ConnectionService';

/**
 * Custom hook for enhanced connection functionality
 * Provides draw.io-style connection experience with visual feedback
 */
export const useConnectionService = (options = {}) => {
  const { getNodes, getEdges, setEdges, addEdges, project, screenToFlowPosition } = useReactFlow();
  const connectionServiceRef = useRef(null);
  const [connectionPreview, setConnectionPreview] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize connection service
  if (!connectionServiceRef.current) {
    connectionServiceRef.current = new ConnectionService({
      connectionPointRadius: options.connectionPointRadius || 6,
      connectionPointMargin: options.connectionPointMargin || 10,
      visualFeedbackEnabled: options.visualFeedbackEnabled !== false,
      smartAttachmentEnabled: options.smartAttachmentEnabled !== false,
      connectionValidationEnabled: options.connectionValidationEnabled !== false,
    });
  }

  /**
   * Start connection from a source node
   */
  const startConnection = useCallback((sourceNode, sourceHandle, event) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const result = connectionServiceRef.current.startConnection(sourceNode, sourceHandle, position);
    
    setIsConnecting(result.isConnecting);
    setConnectionPreview(result.preview);
    
    return result;
  }, [screenToFlowPosition]);

  /**
   * Update connection preview during dragging
   */
  const updateConnectionPreview = useCallback((event, targetNode = null, targetHandle = null) => {
    if (!isConnecting) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const preview = connectionServiceRef.current.updateConnectionPreview(position, targetNode, targetHandle);
    
    setConnectionPreview(preview);
    return preview;
  }, [isConnecting, screenToFlowPosition]);

  /**
   * Complete connection to target node
   */
  const completeConnection = useCallback((targetNode, targetHandle) => {
    if (!isConnecting) return null;

    const connection = connectionServiceRef.current.completeConnection(targetNode, targetHandle);
    
    if (connection && connection.isValid) {
      // Create the edge with orthogonal routing
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
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

      addEdges([newEdge]);
    }

    // Reset connection state
    setIsConnecting(false);
    setConnectionPreview(null);

    return connection;
  }, [isConnecting, addEdges]);

  /**
   * Cancel connection process
   */
  const cancelConnection = useCallback(() => {
    connectionServiceRef.current.cancelConnection();
    setIsConnecting(false);
    setConnectionPreview(null);
  }, []);

  /**
   * Handle connection start from node handle
   */
  const handleConnectionStart = useCallback((event, node, handle) => {
    event.preventDefault();
    event.stopPropagation();
    
    const sourceNode = getNodes().find(n => n.id === node.id);
    if (sourceNode) {
      startConnection(sourceNode, handle.id, event);
    }
  }, [getNodes, startConnection]);

  /**
   * Handle connection end to node handle
   */
  const handleConnectionEnd = useCallback((event, node, handle) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isConnecting) {
      const targetNode = getNodes().find(n => n.id === node.id);
      if (targetNode) {
        completeConnection(targetNode, handle.id);
      }
    }
  }, [isConnecting, getNodes, completeConnection]);

  /**
   * Handle mouse move during connection
   */
  const handleConnectionMouseMove = useCallback((event) => {
    if (!isConnecting) return;

    // Find potential target node under mouse
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const nodes = getNodes();
    
    let targetNode = null;
    let targetHandle = null;

    // Check if mouse is over a node
    for (const node of nodes) {
      const { x, y, width = 100, height = 100 } = node.position;
      const nodeWidth = node.width || width;
      const nodeHeight = node.height || height;

      if (position.x >= x && position.x <= x + nodeWidth &&
          position.y >= y && position.y <= y + nodeHeight) {
        targetNode = node;
        
        // Find the best connection handle
        const handles = connectionServiceRef.current.getConnectionHandles(node);
        let closestHandle = null;
        let minDistance = Infinity;

        for (const [handleId, handlePoint] of Object.entries(handles)) {
          const distance = Math.sqrt(
            Math.pow(position.x - handlePoint.x, 2) + 
            Math.pow(position.y - handlePoint.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestHandle = handleId;
          }
        }

        if (minDistance <= connectionServiceRef.current.connectionPointRadius * 2) {
          targetHandle = closestHandle;
        }
        break;
      }
    }

    updateConnectionPreview(event, targetNode, targetHandle);
  }, [isConnecting, screenToFlowPosition, getNodes, updateConnectionPreview]);

  /**
   * Handle mouse up to complete or cancel connection
   */
  const handleConnectionMouseUp = useCallback((event) => {
    if (!isConnecting) return;

    // Check if we're over a valid target
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const nodes = getNodes();
    
    let targetNode = null;
    let targetHandle = null;

    for (const node of nodes) {
      const { x, y, width = 100, height = 100 } = node.position;
      const nodeWidth = node.width || width;
      const nodeHeight = node.height || height;

      if (position.x >= x && position.x <= x + nodeWidth &&
          position.y >= y && position.y <= y + nodeHeight) {
        targetNode = node;
        
        // Find the best connection handle
        const handles = connectionServiceRef.current.getConnectionHandles(node);
        let closestHandle = null;
        let minDistance = Infinity;

        for (const [handleId, handlePoint] of Object.entries(handles)) {
          const distance = Math.sqrt(
            Math.pow(position.x - handlePoint.x, 2) + 
            Math.pow(position.y - handlePoint.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestHandle = handleId;
          }
        }

        if (minDistance <= connectionServiceRef.current.connectionPointRadius * 2) {
          targetHandle = closestHandle;
        }
        break;
      }
    }

    if (targetNode && targetHandle) {
      completeConnection(targetNode, targetHandle);
    } else {
      cancelConnection();
    }
  }, [isConnecting, screenToFlowPosition, getNodes, completeConnection, cancelConnection]);

  /**
   * Update connection service configuration
   */
  const updateConnectionConfig = useCallback((config) => {
    connectionServiceRef.current.updateConfiguration(config);
  }, []);

  return {
    // Connection state
    isConnecting,
    connectionPreview,
    
    // Connection handlers
    startConnection,
    updateConnectionPreview,
    completeConnection,
    cancelConnection,
    
    // Event handlers
    handleConnectionStart,
    handleConnectionEnd,
    handleConnectionMouseMove,
    handleConnectionMouseUp,
    
    // Configuration
    updateConnectionConfig,
    
    // Service access
    connectionService: connectionServiceRef.current,
  };
};

export default useConnectionService; 