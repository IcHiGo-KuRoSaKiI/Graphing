export class DiagramService {
    constructor(validationService, layoutService, exportService, technicalDetailsService) {
        this.validationService = validationService;
        this.layoutService = layoutService;
        this.exportService = exportService;
        this.technicalDetailsService = technicalDetailsService;
    }

    /**
     * Create a new diagram from data
     * @param {Object} diagramData - The diagram data
     * @param {Object} options - Creation options
     * @returns {Promise<Object>} The created diagram
     */
    async createDiagram(diagramData, options = {}) {
        try {
            // Validate the diagram data
            const validatedData = await this.validationService.validateDiagram(diagramData);
            
            // Apply auto-layout if requested
            let processedData = validatedData;
            if (options.autoLayout !== false) {
                processedData = await this.layoutService.layout(validatedData);
            }

            // Enrich with technical details if requested
            if (options.includeTechnicalDetails !== false) {
                processedData = await this.technicalDetailsService.enrichDiagram(processedData);
            }

            return {
                success: true,
                diagram: processedData,
                metadata: {
                    createdAt: new Date().toISOString(),
                    version: '1.0',
                    autoLayout: options.autoLayout !== false,
                    technicalDetails: options.includeTechnicalDetails !== false
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                diagram: null
            };
        }
    }

    /**
     * Convert JSON diagram data to React Flow format
     * @param {Object} config - The diagram configuration
     * @returns {Object} React Flow compatible data
     */
    jsonToReactFlow(config) {
        const { containers = [], nodes = [], connections = [] } = config;
        
        const reactFlowNodes = [];
        const reactFlowEdges = [];

        // Convert containers to React Flow nodes
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
                    description: container.description,
                    width: container.size?.width || 400,
                    height: container.size?.height || 300
                },
                style: {
                    width: container.size?.width || 400,
                    height: container.size?.height || 300,
                    zIndex: container.zIndex || 1
                },
                zIndex: container.zIndex || 1
            });
        });

        // Convert nodes to React Flow nodes
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
                    description: node.description,
                    width: node.size?.width || 150,
                    height: node.size?.height || 80
                },
                style: {
                    width: node.size?.width || 150,
                    height: node.size?.height || 80,
                    zIndex: node.zIndex || 10
                },
                zIndex: node.zIndex || 10
            });
        });

        // Convert connections to React Flow edges
        connections.forEach(connection => {
            reactFlowEdges.push({
                id: connection.id,
                source: connection.source,
                target: connection.target,
                label: connection.label,
                type: connection.type || 'adjustable',
                animated: connection.animated || false,
                data: {
                    label: connection.label,
                    description: connection.description,
                    waypoints: connection.waypoints,
                    intersection: connection.intersection
                },
                markerStart: connection.markerStart,
                markerEnd: connection.markerEnd,
                style: {
                    strokeWidth: connection.style?.strokeWidth || 2,
                    strokeDasharray: connection.style?.strokeDasharray,
                    stroke: connection.style?.stroke || '#000000'
                },
                zIndex: connection.zIndex || 5
            });
        });

        return {
            nodes: reactFlowNodes,
            edges: reactFlowEdges
        };
    }

    /**
     * Convert React Flow data to JSON format
     * @param {Array} nodes - React Flow nodes
     * @param {Array} edges - React Flow edges
     * @returns {Object} JSON format diagram data
     */
    reactFlowToJson(nodes, edges) {
        const containers = nodes
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

        const diagramNodes = nodes
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

        const connections = edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.data?.label,
            type: edge.type,
            animated: edge.animated,
            description: edge.data?.description,
            waypoints: edge.data?.waypoints,
            markerStart: edge.markerStart,
            markerEnd: edge.markerEnd,
            intersection: edge.data?.intersection,
            style: {
                strokeWidth: edge.style?.strokeWidth || 2,
                strokeDasharray: edge.style?.strokeDasharray,
            },
            zIndex: edge.zIndex || 5
        }));

        return {
            metadata: {
                name: 'Architecture Diagram',
                description: 'Exported architecture diagram',
                version: '1.0',
                exportDate: new Date().toISOString(),
            },
            containers,
            nodes: diagramNodes,
            connections
        };
    }

    /**
     * Get diagram bounds for viewport calculations
     * @param {Array} nodes - React Flow nodes
     * @returns {Object} Bounds object with x, y, width, height
     */
    getDiagramBounds(nodes) {
        if (nodes.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach((node) => {
            const width = node.__rf?.width || node.style?.width || 150;
            const height = node.__rf?.height || node.style?.height || 80;
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + width);
            maxY = Math.max(maxY, node.position.y + height);
        });

        return { 
            x: minX, 
            y: minY, 
            width: maxX - minX, 
            height: maxY - minY 
        };
    }

    /**
     * Validate diagram data against schema
     * @param {Object} diagramData - The diagram data to validate
     * @returns {boolean} True if valid, throws error if invalid
     */
    validateDiagramData(diagramData) {
        // Simple validation - check if required fields exist
        if (!diagramData || !diagramData.containers || !diagramData.nodes || !diagramData.connections) {
            throw new Error('Validation failed: Missing required fields (containers, nodes, connections)');
        }
        return true;
    }
} 