import { autoLayoutNodes } from '../components/utils/autoLayout';

export class LayoutService {
    constructor() {
        this.layoutAlgorithms = new Map();
        this.setupDefaultAlgorithms();
    }

    /**
     * Setup default layout algorithms
     */
    setupDefaultAlgorithms() {
        // Register the default auto-layout algorithm
        this.registerAlgorithm('default', this.defaultAutoLayout.bind(this));
        
        // Register hierarchical layout algorithm
        this.registerAlgorithm('hierarchical', this.hierarchicalLayout.bind(this));
        
        // Register circular layout algorithm
        this.registerAlgorithm('circular', this.circularLayout.bind(this));
        
        // Register grid layout algorithm
        this.registerAlgorithm('grid', this.gridLayout.bind(this));
    }

    /**
     * Register a new layout algorithm
     * @param {string} name - Algorithm name
     * @param {Function} algorithm - Layout function
     */
    registerAlgorithm(name, algorithm) {
        this.layoutAlgorithms.set(name, algorithm);
    }

    /**
     * Get available layout algorithms
     * @returns {Array} Array of algorithm names
     */
    getAvailableAlgorithms() {
        return Array.from(this.layoutAlgorithms.keys());
    }

    /**
     * Apply layout to diagram data
     * @param {Object} diagramData - Diagram data to layout
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram data
     */
    async layout(diagramData, options = {}) {
        const algorithm = options.algorithm || 'default';
        const layoutAlgorithm = this.layoutAlgorithms.get(algorithm);
        
        if (!layoutAlgorithm) {
            throw new Error(`Layout algorithm '${algorithm}' not found`);
        }

        try {
            const layoutedData = await layoutAlgorithm(diagramData, options);
            return layoutedData;
        } catch (error) {
            throw new Error(`Layout failed: ${error.message}`);
        }
    }

    /**
     * Default auto-layout algorithm (from existing autoLayout.js)
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram data
     */
    async defaultAutoLayout(diagramData, options = {}) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        
        // Convert to React Flow format for auto-layout
        const reactFlowData = this.convertToReactFlowFormat(containers, nodes);
        
        // Apply auto-layout using existing utility
        const layoutedNodes = autoLayoutNodes(reactFlowData.nodes);
        
        // Convert back to diagram format
        const layoutedData = this.convertFromReactFlowFormat(layoutedNodes, connections);
        
        return layoutedData;
    }

    /**
     * Hierarchical layout algorithm
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram data
     */
    async hierarchicalLayout(diagramData, options = {}) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        const { spacing = 100, direction = 'vertical' } = options;
        
        const layoutedContainers = [...containers];
        const layoutedNodes = [...nodes];
        
        // Group nodes by containers
        const containerGroups = new Map();
        layoutedNodes.forEach(node => {
            const containerId = node.parentContainer;
            if (!containerGroups.has(containerId)) {
                containerGroups.set(containerId, []);
            }
            containerGroups.get(containerId).push(node);
        });
        
        // Layout containers in a hierarchical structure
        let currentY = 0;
        layoutedContainers.forEach((container, index) => {
            container.position = { x: 0, y: currentY };
            currentY += (container.size?.height || 300) + spacing;
        });
        
        // Layout nodes within containers
        containerGroups.forEach((nodesInContainer, containerId) => {
            const container = layoutedContainers.find(c => c.id === containerId);
            if (container) {
                let nodeY = container.position.y + 50; // Offset from container top
                nodesInContainer.forEach(node => {
                    node.position = { 
                        x: container.position.x + 50, 
                        y: nodeY 
                    };
                    nodeY += (node.size?.height || 80) + 20;
                });
            }
        });
        
        return {
            containers: layoutedContainers,
            nodes: layoutedNodes,
            connections
        };
    }

    /**
     * Circular layout algorithm
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram data
     */
    async circularLayout(diagramData, options = {}) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        const { radius = 200, centerX = 400, centerY = 300 } = options;
        
        const layoutedContainers = [...containers];
        const layoutedNodes = [...nodes];
        
        // Layout containers in a circle
        const totalContainers = layoutedContainers.length;
        layoutedContainers.forEach((container, index) => {
            const angle = (2 * Math.PI * index) / totalContainers;
            container.position = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        
        // Layout nodes in a smaller circle within their containers
        const nodeGroups = new Map();
        layoutedNodes.forEach(node => {
            const containerId = node.parentContainer;
            if (!nodeGroups.has(containerId)) {
                nodeGroups.set(containerId, []);
            }
            nodeGroups.get(containerId).push(node);
        });
        
        nodeGroups.forEach((nodesInContainer, containerId) => {
            const container = layoutedContainers.find(c => c.id === containerId);
            if (container) {
                const nodeRadius = 50;
                const totalNodes = nodesInContainer.length;
                nodesInContainer.forEach((node, index) => {
                    const angle = (2 * Math.PI * index) / totalNodes;
                    node.position = {
                        x: container.position.x + nodeRadius * Math.cos(angle),
                        y: container.position.y + nodeRadius * Math.sin(angle)
                    };
                });
            }
        });
        
        return {
            containers: layoutedContainers,
            nodes: layoutedNodes,
            connections
        };
    }

    /**
     * Grid layout algorithm
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram data
     */
    async gridLayout(diagramData, options = {}) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        const { columns = 3, spacing = 100 } = options;
        
        const layoutedContainers = [...containers];
        const layoutedNodes = [...nodes];
        
        // Layout containers in a grid
        layoutedContainers.forEach((container, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            container.position = {
                x: col * (container.size?.width || 400) + col * spacing,
                y: row * (container.size?.height || 300) + row * spacing
            };
        });
        
        // Layout nodes in a grid within their containers
        const nodeGroups = new Map();
        layoutedNodes.forEach(node => {
            const containerId = node.parentContainer;
            if (!nodeGroups.has(containerId)) {
                nodeGroups.set(containerId, []);
            }
            nodeGroups.get(containerId).push(node);
        });
        
        nodeGroups.forEach((nodesInContainer, containerId) => {
            const container = layoutedContainers.find(c => c.id === containerId);
            if (container) {
                const nodeColumns = Math.ceil(Math.sqrt(nodesInContainer.length));
                nodesInContainer.forEach((node, index) => {
                    const row = Math.floor(index / nodeColumns);
                    const col = index % nodeColumns;
                    node.position = {
                        x: container.position.x + 50 + col * ((node.size?.width || 150) + 20),
                        y: container.position.y + 50 + row * ((node.size?.height || 80) + 20)
                    };
                });
            }
        });
        
        return {
            containers: layoutedContainers,
            nodes: layoutedNodes,
            connections
        };
    }

    /**
     * Convert diagram data to React Flow format for layout
     * @param {Array} containers - Container nodes
     * @param {Array} nodes - Regular nodes
     * @returns {Object} React Flow format data
     */
    convertToReactFlowFormat(containers, nodes) {
        const reactFlowNodes = [];
        
        // Convert containers
        containers.forEach(container => {
            reactFlowNodes.push({
                id: container.id,
                type: 'container',
                position: container.position,
                data: {
                    label: container.label,
                    color: container.color || '#E3F2FD',
                    bgColor: container.bgColor || '#ffffff',
                    borderColor: container.borderColor || '#ddd',
                    icon: container.icon,
                    description: container.description
                },
                style: {
                    width: container.size?.width || 400,
                    height: container.size?.height || 300,
                    zIndex: container.zIndex || 1
                },
                zIndex: container.zIndex || 1
            });
        });
        
        // Convert nodes
        nodes.forEach(node => {
            reactFlowNodes.push({
                id: node.id,
                type: node.type || 'component',
                position: node.position,
                parentNode: node.parentContainer,
                data: {
                    label: node.label,
                    color: node.color || '#E3F2FD',
                    borderColor: node.borderColor || '#ddd',
                    icon: node.icon,
                    description: node.description
                },
                style: {
                    width: node.size?.width || 150,
                    height: node.size?.height || 80,
                    zIndex: node.zIndex || 10
                },
                zIndex: node.zIndex || 10
            });
        });
        
        return { nodes: reactFlowNodes };
    }

    /**
     * Convert React Flow format back to diagram format
     * @param {Array} reactFlowNodes - React Flow nodes
     * @param {Array} connections - Connections
     * @returns {Object} Diagram format data
     */
    convertFromReactFlowFormat(reactFlowNodes, connections) {
        const containers = reactFlowNodes
            .filter(node => node.type === 'container')
            .map(container => ({
                id: container.id,
                label: container.data.label,
                position: container.position,
                size: {
                    width: container.style?.width || 400,
                    height: container.style?.height || 300,
                },
                color: container.data.color,
                bgColor: container.data.bgColor,
                borderColor: container.data.borderColor,
                icon: container.data.icon,
                description: container.data.description,
                zIndex: container.zIndex || 1
            }));

        const nodes = reactFlowNodes
            .filter(node => node.type !== 'container')
            .map(node => ({
                id: node.id,
                label: node.data.label,
                type: node.type,
                position: node.position,
                parentContainer: node.parentNode,
                size: {
                    width: node.style?.width || 150,
                    height: node.style?.height || 80,
                },
                color: node.data.color,
                borderColor: node.data.borderColor,
                icon: node.data.icon,
                description: node.data.description,
                zIndex: node.zIndex || 10
            }));

        return {
            containers,
            nodes,
            connections
        };
    }

    /**
     * Calculate optimal spacing between elements
     * @param {Array} elements - Elements to calculate spacing for
     * @param {Object} options - Spacing options
     * @returns {number} Optimal spacing value
     */
    calculateOptimalSpacing(elements, options = {}) {
        const { minSpacing = 50, maxSpacing = 200, defaultSpacing = 100 } = options;
        
        if (elements.length <= 1) {
            return defaultSpacing;
        }
        
        // Calculate average element size
        const totalSize = elements.reduce((sum, element) => {
            const width = element.size?.width || 150;
            const height = element.size?.height || 80;
            return sum + Math.max(width, height);
        }, 0);
        
        const averageSize = totalSize / elements.length;
        
        // Return spacing based on average size
        return Math.max(minSpacing, Math.min(maxSpacing, averageSize * 0.5));
    }
} 