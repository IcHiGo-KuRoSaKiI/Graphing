import { BaseTool } from './BaseTool.js';

/**
 * Auto Layout Tool
 * Allows agents to automatically layout diagram components
 */
export class AutoLayoutTool extends BaseTool {
    constructor() {
        super();
        this.name = 'auto_layout_diagram';
        this.description = 'Automatically layout diagram components for optimal visualization';
    }

    /**
     * Get input schema for the tool
     * @returns {Object} JSON schema for tool input
     */
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                diagram: {
                    type: 'object',
                    description: 'Diagram data to layout'
                },
                algorithm: {
                    type: 'string',
                    enum: ['hierarchical', 'force-directed', 'circular', 'grid', 'organic'],
                    description: 'Layout algorithm to use'
                },
                options: {
                    type: 'object',
                    description: 'Layout options',
                    properties: {
                        direction: {
                            type: 'string',
                            enum: ['TB', 'LR', 'BT', 'RL'],
                            description: 'Layout direction (Top-Bottom, Left-Right, etc.)'
                        },
                        spacing: {
                            type: 'number',
                            description: 'Spacing between nodes',
                            minimum: 10,
                            maximum: 200
                        },
                        padding: {
                            type: 'number',
                            description: 'Padding around the diagram',
                            minimum: 0,
                            maximum: 100
                        },
                        centerContainers: {
                            type: 'boolean',
                            description: 'Center containers in their areas'
                        },
                        optimizeConnections: {
                            type: 'boolean',
                            description: 'Optimize connection routing'
                        }
                    }
                }
            },
            required: ['diagram']
        };
    }

    /**
     * Execute the tool
     * @param {Object} args - Tool arguments
     * @param {Object} session - Session object
     * @returns {Promise<Object>} Tool execution result
     */
    async execute(args, session) {
        try {
            // Validate input
            this.validateInput(args, this.getInputSchema());

            const { diagram, algorithm = 'hierarchical', options = {} } = args;
            const {
                direction = 'TB',
                spacing = 50,
                padding = 20,
                centerContainers = true,
                optimizeConnections = true
            } = options;

            // Validate diagram data
            if (!diagram || typeof diagram !== 'object') {
                throw new Error('Invalid diagram data');
            }

            // Get diagram from session if not provided
            let diagramData = diagram;
            if (!diagramData && session) {
                diagramData = session.getDiagram();
                if (!diagramData) {
                    throw new Error('No diagram available in session');
                }
            }

            // Apply layout algorithm
            const layoutedDiagram = await this.applyLayout(diagramData, {
                algorithm,
                direction,
                spacing,
                padding,
                centerContainers,
                optimizeConnections
            });

            // Store updated diagram in session
            if (session) {
                session.setDiagram(layoutedDiagram);
            }

            return this.createSuccessResponse({
                diagram: layoutedDiagram,
                layout: {
                    algorithm,
                    direction,
                    spacing,
                    padding,
                    bounds: this.calculateBounds(layoutedDiagram)
                }
            }, `Diagram layout applied successfully using ${algorithm} algorithm`);

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    /**
     * Apply layout algorithm to diagram
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Promise<Object>} Layouted diagram
     */
    async applyLayout(diagramData, options = {}) {
        const { algorithm, direction, spacing, padding, centerContainers, optimizeConnections } = options;
        
        // Create a copy of the diagram data
        const layoutedDiagram = JSON.parse(JSON.stringify(diagramData));
        
        switch (algorithm) {
            case 'hierarchical':
                return this.applyHierarchicalLayout(layoutedDiagram, { direction, spacing, padding });
            case 'force-directed':
                return this.applyForceDirectedLayout(layoutedDiagram, { spacing, padding });
            case 'circular':
                return this.applyCircularLayout(layoutedDiagram, { spacing, padding });
            case 'grid':
                return this.applyGridLayout(layoutedDiagram, { spacing, padding });
            case 'organic':
                return this.applyOrganicLayout(layoutedDiagram, { spacing, padding });
            default:
                throw new Error(`Unsupported layout algorithm: ${algorithm}`);
        }
    }

    /**
     * Apply hierarchical layout
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Object} Layouted diagram
     */
    applyHierarchicalLayout(diagramData, options = {}) {
        const { direction = 'TB', spacing = 50, padding = 20 } = options;
        
        // Group nodes by containers
        const containerGroups = new Map();
        const standaloneNodes = [];
        
        if (diagramData.containers) {
            diagramData.containers.forEach(container => {
                containerGroups.set(container.id, []);
            });
        }
        
        // Assign nodes to containers
        if (diagramData.nodes) {
            diagramData.nodes.forEach(node => {
                if (node.parentContainer && containerGroups.has(node.parentContainer)) {
                    containerGroups.get(node.parentContainer).push(node);
                } else {
                    standaloneNodes.push(node);
                }
            });
        }
        
        // Calculate positions
        let currentX = padding;
        let currentY = padding;
        const maxHeight = Math.max(...Array.from(containerGroups.values()).map(nodes => nodes.length), standaloneNodes.length);
        const nodeHeight = 60;
        const nodeWidth = 120;
        
        // Position containers
        if (diagramData.containers) {
            diagramData.containers.forEach(container => {
                container.position = { x: currentX, y: currentY };
                container.size = { width: nodeWidth + spacing, height: (containerGroups.get(container.id)?.length || 0) * (nodeHeight + 10) + spacing };
                
                // Position nodes within container
                const containerNodes = containerGroups.get(container.id) || [];
                containerNodes.forEach((node, index) => {
                    node.position = {
                        x: currentX + 10,
                        y: currentY + 10 + index * (nodeHeight + 10)
                    };
                });
                
                currentX += container.size.width + spacing;
            });
        }
        
        // Position standalone nodes
        standaloneNodes.forEach((node, index) => {
            node.position = {
                x: currentX,
                y: currentY + index * (nodeHeight + spacing)
            };
        });
        
        return diagramData;
    }

    /**
     * Apply force-directed layout
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Object} Layouted diagram
     */
    applyForceDirectedLayout(diagramData, options = {}) {
        const { spacing = 50, padding = 20 } = options;
        
        // Simple force-directed simulation
        if (diagramData.nodes) {
            const nodes = diagramData.nodes;
            const connections = diagramData.connections || [];
            
            // Initialize positions randomly
            nodes.forEach(node => {
                if (!node.position) {
                    node.position = {
                        x: Math.random() * 400 + padding,
                        y: Math.random() * 300 + padding
                    };
                }
            });
            
            // Simple force simulation (simplified)
            for (let iteration = 0; iteration < 50; iteration++) {
                // Repulsion between nodes
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[j].position.x - nodes[i].position.x;
                        const dy = nodes[j].position.y - nodes[i].position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 0) {
                            const force = spacing / (distance * distance);
                            const fx = (dx / distance) * force;
                            const fy = (dy / distance) * force;
                            
                            nodes[i].position.x -= fx;
                            nodes[i].position.y -= fy;
                            nodes[j].position.x += fx;
                            nodes[j].position.y += fy;
                        }
                    }
                }
            }
        }
        
        return diagramData;
    }

    /**
     * Apply circular layout
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Object} Layouted diagram
     */
    applyCircularLayout(diagramData, options = {}) {
        const { spacing = 50, padding = 20 } = options;
        
        if (diagramData.nodes) {
            const nodes = diagramData.nodes;
            const centerX = 400;
            const centerY = 300;
            const radius = Math.max(100, nodes.length * 20);
            
            nodes.forEach((node, index) => {
                const angle = (2 * Math.PI * index) / nodes.length;
                node.position = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            });
        }
        
        return diagramData;
    }

    /**
     * Apply grid layout
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Object} Layouted diagram
     */
    applyGridLayout(diagramData, options = {}) {
        const { spacing = 50, padding = 20 } = options;
        
        if (diagramData.nodes) {
            const nodes = diagramData.nodes;
            const cols = Math.ceil(Math.sqrt(nodes.length));
            const nodeWidth = 120;
            const nodeHeight = 60;
            
            nodes.forEach((node, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                
                node.position = {
                    x: padding + col * (nodeWidth + spacing),
                    y: padding + row * (nodeHeight + spacing)
                };
            });
        }
        
        return diagramData;
    }

    /**
     * Apply organic layout
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Layout options
     * @returns {Object} Layouted diagram
     */
    applyOrganicLayout(diagramData, options = {}) {
        const { spacing = 50, padding = 20 } = options;
        
        // Organic layout is similar to force-directed but with different parameters
        return this.applyForceDirectedLayout(diagramData, { spacing: spacing * 1.5, padding });
    }

    /**
     * Calculate diagram bounds
     * @param {Object} diagramData - Diagram data
     * @returns {Object} Bounds information
     */
    calculateBounds(diagramData) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        // Calculate bounds from nodes
        if (diagramData.nodes) {
            diagramData.nodes.forEach(node => {
                if (node.position) {
                    minX = Math.min(minX, node.position.x);
                    minY = Math.min(minY, node.position.y);
                    maxX = Math.max(maxX, node.position.x + (node.size?.width || 120));
                    maxY = Math.max(maxY, node.position.y + (node.size?.height || 60));
                }
            });
        }
        
        // Calculate bounds from containers
        if (diagramData.containers) {
            diagramData.containers.forEach(container => {
                if (container.position) {
                    minX = Math.min(minX, container.position.x);
                    minY = Math.min(minY, container.position.y);
                    maxX = Math.max(maxX, container.position.x + (container.size?.width || 200));
                    maxY = Math.max(maxY, container.position.y + (container.size?.height || 100));
                }
            });
        }
        
        return {
            x: minX === Infinity ? 0 : minX,
            y: minY === Infinity ? 0 : minY,
            width: maxX === -Infinity ? 0 : maxX - minX,
            height: maxY === -Infinity ? 0 : maxY - minY
        };
    }
} 