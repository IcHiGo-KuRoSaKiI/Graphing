/**
 * ConnectionService - Handles arrow spawning and attachment mechanisms
 * Provides draw.io-style connection experience with visual feedback and smart attachment
 */
class ConnectionService {
  constructor(options = {}) {
    this.connectionStartPoint = null;
    this.connectionEndPoint = null;
    this.isConnecting = false;
    this.sourceNode = null;
    this.targetNode = null;
    this.connectionPreview = null;
    this.connectionPointRadius = options.connectionPointRadius || 6;
    this.connectionPointMargin = options.connectionPointMargin || 10;
    this.visualFeedbackEnabled = options.visualFeedbackEnabled !== false;
    this.smartAttachmentEnabled = options.smartAttachmentEnabled !== false;
    this.connectionValidationEnabled = options.connectionValidationEnabled !== false;
  }

  /**
   * Start connection process from a source node
   */
  startConnection(sourceNode, sourceHandle, position) {
    this.isConnecting = true;
    this.sourceNode = sourceNode;
    this.connectionStartPoint = this.calculateConnectionPoint(sourceNode, sourceHandle, position);
    this.connectionPreview = {
      source: this.connectionStartPoint,
      target: position,
      isValid: false
    };
    
    return {
      isConnecting: true,
      startPoint: this.connectionStartPoint,
      preview: this.connectionPreview
    };
  }

  /**
   * Update connection preview during dragging
   */
  updateConnectionPreview(targetPosition, targetNode = null, targetHandle = null) {
    if (!this.isConnecting) return null;

    this.connectionEndPoint = targetPosition;
    this.targetNode = targetNode;

    // Calculate optimal target connection point
    const targetConnectionPoint = targetNode 
      ? this.calculateConnectionPoint(targetNode, targetHandle, targetPosition)
      : targetPosition;

    // Validate connection
    const isValid = this.validateConnection(this.sourceNode, this.targetNode);
    
    this.connectionPreview = {
      source: this.connectionStartPoint,
      target: targetConnectionPoint,
      isValid,
      targetNode: this.targetNode
    };

    return this.connectionPreview;
  }

  /**
   * Complete connection process
   */
  completeConnection(targetNode, targetHandle) {
    if (!this.isConnecting || !this.sourceNode) {
      return null;
    }

    const targetConnectionPoint = this.calculateConnectionPoint(targetNode, targetHandle);
    const isValid = this.validateConnection(this.sourceNode, targetNode);

    const connection = {
      source: this.sourceNode.id,
      target: targetNode.id,
      sourceHandle: this.getSourceHandle(),
      targetHandle: targetHandle,
      sourcePoint: this.connectionStartPoint,
      targetPoint: targetConnectionPoint,
      isValid,
      connectionType: 'orthogonal'
    };

    // Reset connection state
    this.resetConnection();

    return connection;
  }

  /**
   * Cancel connection process
   */
  cancelConnection() {
    this.resetConnection();
    return { isConnecting: false };
  }

  /**
   * Reset connection state
   */
  resetConnection() {
    this.isConnecting = false;
    this.connectionStartPoint = null;
    this.connectionEndPoint = null;
    this.sourceNode = null;
    this.targetNode = null;
    this.connectionPreview = null;
  }

  /**
   * Calculate optimal connection point on a node
   */
  calculateConnectionPoint(node, handle = null, position = null) {
    const { x, y, width = 100, height = 100 } = node.position;
    const nodeWidth = node.width || width;
    const nodeHeight = node.height || height;

    if (handle) {
      // Use specific handle position
      switch (handle) {
        case 'top-source':
        case 'top-target':
          return { x: x + nodeWidth / 2, y: y - this.connectionPointMargin };
        case 'right-source':
        case 'right-target':
          return { x: x + nodeWidth + this.connectionPointMargin, y: y + nodeHeight / 2 };
        case 'bottom-source':
        case 'bottom-target':
          return { x: x + nodeWidth / 2, y: y + nodeHeight + this.connectionPointMargin };
        case 'left-source':
        case 'left-target':
          return { x: x - this.connectionPointMargin, y: y + nodeHeight / 2 };
        default:
          return { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
      }
    }

    if (position) {
      // Calculate closest connection point to position
      const centerX = x + nodeWidth / 2;
      const centerY = y + nodeHeight / 2;
      const dx = position.x - centerX;
      const dy = position.y - centerY;

      // Determine which side is closest
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const halfWidth = nodeWidth / 2;
      const halfHeight = nodeHeight / 2;

      if (absDx / halfWidth > absDy / halfHeight) {
        // Closer to left or right side
        return {
          x: dx > 0 ? x + nodeWidth + this.connectionPointMargin : x - this.connectionPointMargin,
          y: centerY
        };
      } else {
        // Closer to top or bottom side
        return {
          x: centerX,
          y: dy > 0 ? y + nodeHeight + this.connectionPointMargin : y - this.connectionPointMargin
        };
      }
    }

    // Default to center
    return { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
  }

  /**
   * Get source handle from current connection
   */
  getSourceHandle() {
    if (!this.sourceNode || !this.connectionStartPoint) return null;

    const { x, y, width = 100, height = 100 } = this.sourceNode.position;
    const nodeWidth = this.sourceNode.width || width;
    const nodeHeight = this.sourceNode.height || height;
    const centerX = x + nodeWidth / 2;
    const centerY = y + nodeHeight / 2;

    const startX = this.connectionStartPoint.x;
    const startY = this.connectionStartPoint.y;

    // Determine which handle was used
    if (Math.abs(startX - centerX) < 5) {
      // Vertical alignment
      return startY < centerY ? 'top-source' : 'bottom-source';
    } else {
      // Horizontal alignment
      return startX < centerX ? 'left-source' : 'right-source';
    }
  }

  /**
   * Validate if connection is allowed
   */
  validateConnection(sourceNode, targetNode) {
    if (!sourceNode || !targetNode) return false;

    // Prevent self-connection
    if (sourceNode.id === targetNode.id) return false;

    // Check if target node is a valid connection target
    if (targetNode.type === 'container') {
      // Containers can receive connections
      return true;
    }

    // Check for existing connections between these nodes
    // This would need to be implemented with access to current edges
    return true;
  }

  /**
   * Find the best connection point on target node
   */
  findBestConnectionPoint(sourceNode, targetNode, mousePosition) {
    const sourcePoint = this.calculateConnectionPoint(sourceNode);
    const targetPoint = this.calculateConnectionPoint(targetNode);

    // Calculate direction from source to target
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;

    // Determine optimal connection side based on direction
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      // Horizontal connection preferred
      return dx > 0 ? 'left-target' : 'right-target';
    } else {
      // Vertical connection preferred
      return dy > 0 ? 'top-target' : 'bottom-target';
    }
  }

  /**
   * Get visual feedback for connection preview
   */
  getConnectionPreviewStyle(isValid) {
    return {
      stroke: isValid ? '#10b981' : '#ef4444',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      opacity: 0.8,
      pointerEvents: 'none'
    };
  }

  /**
   * Check if a point is near a connection handle
   */
  isNearConnectionHandle(point, node, handle) {
    const handlePoint = this.calculateConnectionPoint(node, handle);
    const distance = Math.sqrt(
      Math.pow(point.x - handlePoint.x, 2) + 
      Math.pow(point.y - handlePoint.y, 2)
    );
    return distance <= this.connectionPointRadius * 2;
  }

  /**
   * Get connection handles for a node
   */
  getConnectionHandles(node) {
    const { x, y, width = 100, height = 100 } = node.position;
    const nodeWidth = node.width || width;
    const nodeHeight = node.height || height;

    return {
      'top-source': { x: x + nodeWidth / 2, y: y - this.connectionPointMargin },
      'right-source': { x: x + nodeWidth + this.connectionPointMargin, y: y + nodeHeight / 2 },
      'bottom-source': { x: x + nodeWidth / 2, y: y + nodeHeight + this.connectionPointMargin },
      'left-source': { x: x - this.connectionPointMargin, y: y + nodeHeight / 2 },
      'top-target': { x: x + nodeWidth / 2, y: y - this.connectionPointMargin },
      'right-target': { x: x + nodeWidth + this.connectionPointMargin, y: y + nodeHeight / 2 },
      'bottom-target': { x: x + nodeWidth / 2, y: y + nodeHeight + this.connectionPointMargin },
      'left-target': { x: x - this.connectionPointMargin, y: y + nodeHeight / 2 }
    };
  }

  /**
   * Update configuration
   */
  updateConfiguration(config) {
    this.connectionPointRadius = config.connectionPointRadius || this.connectionPointRadius;
    this.connectionPointMargin = config.connectionPointMargin || this.connectionPointMargin;
    this.visualFeedbackEnabled = config.visualFeedbackEnabled !== false;
    this.smartAttachmentEnabled = config.smartAttachmentEnabled !== false;
    this.connectionValidationEnabled = config.connectionValidationEnabled !== false;
  }
}

export default ConnectionService; 