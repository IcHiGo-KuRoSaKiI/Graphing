import { BaseTool } from './BaseTool.js';

/**
 * Technical Details Tool
 * Allows agents to add technical specifications to diagram components
 */
export class TechnicalDetailsTool extends BaseTool {
    constructor() {
        super();
        this.name = 'add_technical_details';
        this.description = 'Add technical specifications and details to diagram components';
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
                    description: 'Diagram data to enrich'
                },
                technicalSpecs: {
                    type: 'object',
                    description: 'Technical specifications to apply',
                    properties: {
                        nodes: {
                            type: 'array',
                            description: 'Technical specs for nodes',
                            items: {
                                type: 'object',
                                properties: {
                                    nodeId: { type: 'string' },
                                    specifications: { type: 'object' }
                                }
                            }
                        },
                        connections: {
                            type: 'array',
                            description: 'Technical specs for connections',
                            items: {
                                type: 'object',
                                properties: {
                                    connectionId: { type: 'string' },
                                    specifications: { type: 'object' }
                                }
                            }
                        },
                        containers: {
                            type: 'array',
                            description: 'Technical specs for containers',
                            items: {
                                type: 'object',
                                properties: {
                                    containerId: { type: 'string' },
                                    specifications: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                options: {
                    type: 'object',
                    description: 'Enrichment options',
                    properties: {
                        extractFromLabels: {
                            type: 'boolean',
                            description: 'Extract technical details from existing labels'
                        },
                        addPerformanceMetrics: {
                            type: 'boolean',
                            description: 'Add performance metrics to components'
                        },
                        addSecurityProtocols: {
                            type: 'boolean',
                            description: 'Add security protocol information'
                        },
                        addInfrastructureDetails: {
                            type: 'boolean',
                            description: 'Add infrastructure and deployment details'
                        },
                        colorCoding: {
                            type: 'boolean',
                            description: 'Apply color coding based on technical specs'
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

            const { diagram, technicalSpecs, options = {} } = args;
            const {
                extractFromLabels = true,
                addPerformanceMetrics = true,
                addSecurityProtocols = true,
                addInfrastructureDetails = true,
                colorCoding = true
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

            // Enrich diagram with technical details
            const enrichedDiagram = await this.enrichDiagram(diagramData, {
                technicalSpecs,
                extractFromLabels,
                addPerformanceMetrics,
                addSecurityProtocols,
                addInfrastructureDetails,
                colorCoding
            });

            // Store updated diagram in session
            if (session) {
                session.setDiagram(enrichedDiagram);
            }

            return this.createSuccessResponse({
                diagram: enrichedDiagram,
                enrichment: {
                    nodesEnriched: this.countEnrichedNodes(enrichedDiagram),
                    connectionsEnriched: this.countEnrichedConnections(enrichedDiagram),
                    containersEnriched: this.countEnrichedContainers(enrichedDiagram),
                    technicalSpecsApplied: technicalSpecs ? Object.keys(technicalSpecs).length : 0
                }
            }, 'Technical details added successfully to diagram components');

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    /**
     * Enrich diagram with technical details
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Enrichment options
     * @returns {Promise<Object>} Enriched diagram
     */
    async enrichDiagram(diagramData, options = {}) {
        const {
            technicalSpecs,
            extractFromLabels,
            addPerformanceMetrics,
            addSecurityProtocols,
            addInfrastructureDetails,
            colorCoding
        } = options;

        // Create a copy of the diagram data
        const enrichedDiagram = JSON.parse(JSON.stringify(diagramData));

        // Apply provided technical specifications
        if (technicalSpecs) {
            this.applyTechnicalSpecs(enrichedDiagram, technicalSpecs);
        }

        // Extract technical details from labels
        if (extractFromLabels) {
            this.extractFromLabels(enrichedDiagram);
        }

        // Add performance metrics
        if (addPerformanceMetrics) {
            this.addPerformanceMetrics(enrichedDiagram);
        }

        // Add security protocols
        if (addSecurityProtocols) {
            this.addSecurityProtocols(enrichedDiagram);
        }

        // Add infrastructure details
        if (addInfrastructureDetails) {
            this.addInfrastructureDetails(enrichedDiagram);
        }

        // Apply color coding
        if (colorCoding) {
            this.applyColorCoding(enrichedDiagram);
        }

        return enrichedDiagram;
    }

    /**
     * Apply technical specifications to diagram
     * @param {Object} diagramData - Diagram data
     * @param {Object} technicalSpecs - Technical specifications
     */
    applyTechnicalSpecs(diagramData, technicalSpecs) {
        // Apply node specifications
        if (technicalSpecs.nodes && Array.isArray(technicalSpecs.nodes)) {
            technicalSpecs.nodes.forEach(spec => {
                const node = diagramData.nodes?.find(n => n.id === spec.nodeId);
                if (node) {
                    node.technicalDetails = {
                        ...node.technicalDetails,
                        ...spec.specifications
                    };
                }
            });
        }

        // Apply connection specifications
        if (technicalSpecs.connections && Array.isArray(technicalSpecs.connections)) {
            technicalSpecs.connections.forEach(spec => {
                const connection = diagramData.connections?.find(c => c.id === spec.connectionId);
                if (connection) {
                    connection.technicalDetails = {
                        ...connection.technicalDetails,
                        ...spec.specifications
                    };
                }
            });
        }

        // Apply container specifications
        if (technicalSpecs.containers && Array.isArray(technicalSpecs.containers)) {
            technicalSpecs.containers.forEach(spec => {
                const container = diagramData.containers?.find(c => c.id === spec.containerId);
                if (container) {
                    container.technicalDetails = {
                        ...container.technicalDetails,
                        ...spec.specifications
                    };
                }
            });
        }
    }

    /**
     * Extract technical details from existing labels
     * @param {Object} diagramData - Diagram data
     */
    extractFromLabels(diagramData) {
        // Extract from node labels
        if (diagramData.nodes) {
            diagramData.nodes.forEach(node => {
                if (node.label) {
                    const extracted = this.extractTechnicalDetailsFromText(node.label);
                    if (extracted) {
                        node.technicalDetails = {
                            ...node.technicalDetails,
                            ...extracted
                        };
                    }
                }
            });
        }

        // Extract from connection labels
        if (diagramData.connections) {
            diagramData.connections.forEach(connection => {
                if (connection.label) {
                    const extracted = this.extractTechnicalDetailsFromText(connection.label);
                    if (extracted) {
                        connection.technicalDetails = {
                            ...connection.technicalDetails,
                            ...extracted
                        };
                    }
                }
            });
        }
    }

    /**
     * Extract technical details from text
     * @param {string} text - Text to analyze
     * @returns {Object|null} Extracted technical details
     */
    extractTechnicalDetailsFromText(text) {
        const details = {};

        // Extract performance metrics
        const performanceRegex = /(<(\d+ms|\d+s|\d+min))/gi;
        const performanceMatch = text.match(performanceRegex);
        if (performanceMatch) {
            details.performance = performanceMatch[0];
        }

        // Extract protocols
        const protocolRegex = /(HTTP\/\d+|gRPC|WebSocket|TCP|UDP)/gi;
        const protocolMatch = text.match(protocolRegex);
        if (protocolMatch) {
            details.protocol = protocolMatch[0];
        }

        // Extract authentication
        const authRegex = /(OAuth2|JWT|mTLS|SSL|TLS)/gi;
        const authMatch = text.match(authRegex);
        if (authMatch) {
            details.authentication = authMatch[0];
        }

        // Extract deployment type
        const deploymentRegex = /(Stateless|Stateful|Serverless|Containerized)/gi;
        const deploymentMatch = text.match(deploymentRegex);
        if (deploymentMatch) {
            details.deploymentType = deploymentMatch[0];
        }

        return Object.keys(details).length > 0 ? details : null;
    }

    /**
     * Add performance metrics to components
     * @param {Object} diagramData - Diagram data
     */
    addPerformanceMetrics(diagramData) {
        if (diagramData.nodes) {
            diagramData.nodes.forEach(node => {
                if (!node.technicalDetails?.performance) {
                    node.technicalDetails = {
                        ...node.technicalDetails,
                        performance: {
                            responseTime: '<100ms',
                            throughput: 'High',
                            latency: 'Low'
                        }
                    };
                }
            });
        }
    }

    /**
     * Add security protocols to components
     * @param {Object} diagramData - Diagram data
     */
    addSecurityProtocols(diagramData) {
        if (diagramData.connections) {
            diagramData.connections.forEach(connection => {
                if (!connection.technicalDetails?.security) {
                    connection.technicalDetails = {
                        ...connection.technicalDetails,
                        security: {
                            encryption: 'TLS 1.3',
                            authentication: 'OAuth2',
                            authorization: 'RBAC'
                        }
                    };
                }
            });
        }
    }

    /**
     * Add infrastructure details to components
     * @param {Object} diagramData - Diagram data
     */
    addInfrastructureDetails(diagramData) {
        if (diagramData.containers) {
            diagramData.containers.forEach(container => {
                if (!container.technicalDetails?.infrastructure) {
                    container.technicalDetails = {
                        ...container.technicalDetails,
                        infrastructure: {
                            scaling: 'Auto-scaling',
                            availability: '99.9%',
                            monitoring: 'Prometheus + Grafana',
                            logging: 'Centralized'
                        }
                    };
                }
            });
        }
    }

    /**
     * Apply color coding based on technical specifications
     * @param {Object} diagramData - Diagram data
     */
    applyColorCoding(diagramData) {
        // Color code nodes based on performance
        if (diagramData.nodes) {
            diagramData.nodes.forEach(node => {
                if (node.technicalDetails?.performance) {
                    const responseTime = node.technicalDetails.performance.responseTime;
                    if (responseTime && responseTime.includes('<100ms')) {
                        node.color = '#4CAF50'; // Green for fast
                    } else if (responseTime && responseTime.includes('<500ms')) {
                        node.color = '#FF9800'; // Orange for medium
                    } else {
                        node.color = '#F44336'; // Red for slow
                    }
                }
            });
        }

        // Color code connections based on security
        if (diagramData.connections) {
            diagramData.connections.forEach(connection => {
                if (connection.technicalDetails?.security) {
                    connection.style = {
                        ...connection.style,
                        stroke: '#2196F3', // Blue for secure connections
                        strokeWidth: 2
                    };
                }
            });
        }
    }

    /**
     * Count enriched nodes
     * @param {Object} diagramData - Diagram data
     * @returns {number} Number of enriched nodes
     */
    countEnrichedNodes(diagramData) {
        return diagramData.nodes?.filter(node => node.technicalDetails).length || 0;
    }

    /**
     * Count enriched connections
     * @param {Object} diagramData - Diagram data
     * @returns {number} Number of enriched connections
     */
    countEnrichedConnections(diagramData) {
        return diagramData.connections?.filter(connection => connection.technicalDetails).length || 0;
    }

    /**
     * Count enriched containers
     * @param {Object} diagramData - Diagram data
     * @returns {number} Number of enriched containers
     */
    countEnrichedContainers(diagramData) {
        return diagramData.containers?.filter(container => container.technicalDetails).length || 0;
    }
} 