/**
 * Component Generator
 * Generates diagram components from parsed descriptions
 */
export class ComponentGenerator {
    constructor() {
        this.templates = {
            microservices: {
                containers: [
                    { name: 'Frontend', type: 'web' },
                    { name: 'API Gateway', type: 'gateway' },
                    { name: 'Backend Services', type: 'services' },
                    { name: 'Database', type: 'storage' }
                ],
                nodes: [
                    { name: 'React App', type: 'spa', container: 'Frontend' },
                    { name: 'API Gateway', type: 'gateway', container: 'API Gateway' },
                    { name: 'User Service', type: 'service', container: 'Backend Services' },
                    { name: 'Product Service', type: 'service', container: 'Backend Services' },
                    { name: 'Order Service', type: 'service', container: 'Backend Services' },
                    { name: 'PostgreSQL', type: 'database', container: 'Database' }
                ],
                connections: [
                    { source: 'React App', target: 'API Gateway', type: 'http' },
                    { source: 'API Gateway', target: 'User Service', type: 'http' },
                    { source: 'API Gateway', target: 'Product Service', type: 'http' },
                    { source: 'API Gateway', target: 'Order Service', type: 'http' },
                    { source: 'User Service', target: 'PostgreSQL', type: 'database' },
                    { source: 'Product Service', target: 'PostgreSQL', type: 'database' },
                    { source: 'Order Service', target: 'PostgreSQL', type: 'database' }
                ]
            },
            monolith: {
                containers: [
                    { name: 'Application', type: 'monolith' },
                    { name: 'Database', type: 'storage' }
                ],
                nodes: [
                    { name: 'Web Server', type: 'server', container: 'Application' },
                    { name: 'Business Logic', type: 'component', container: 'Application' },
                    { name: 'Data Access', type: 'component', container: 'Application' },
                    { name: 'MySQL', type: 'database', container: 'Database' }
                ],
                connections: [
                    { source: 'Web Server', target: 'Business Logic', type: 'internal' },
                    { source: 'Business Logic', target: 'Data Access', type: 'internal' },
                    { source: 'Data Access', target: 'MySQL', type: 'database' }
                ]
            },
            serverless: {
                containers: [
                    { name: 'Frontend', type: 'web' },
                    { name: 'Serverless Functions', type: 'functions' },
                    { name: 'Database', type: 'storage' }
                ],
                nodes: [
                    { name: 'React App', type: 'spa', container: 'Frontend' },
                    { name: 'Auth Function', type: 'function', container: 'Serverless Functions' },
                    { name: 'API Function', type: 'function', container: 'Serverless Functions' },
                    { name: 'DynamoDB', type: 'database', container: 'Database' }
                ],
                connections: [
                    { source: 'React App', target: 'Auth Function', type: 'http' },
                    { source: 'React App', target: 'API Function', type: 'http' },
                    { source: 'Auth Function', target: 'DynamoDB', type: 'database' },
                    { source: 'API Function', target: 'DynamoDB', type: 'database' }
                ]
            }
        };
    }

    /**
     * Generate diagram from parsed components
     * @param {Object} parsedComponents - Parsed components from DescriptionParser
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated diagram
     */
    async generate(parsedComponents, options = {}) {
        const {
            template = 'custom',
            includeTechnicalDetails = true,
            style = 'modern'
        } = options;

        let diagram = {
            metadata: {
                name: 'Generated Architecture Diagram',
                description: 'Generated from natural language description',
                version: '1.0',
                generatedAt: new Date().toISOString(),
                template,
                style,
                includeTechnicalDetails
            },
            containers: [],
            nodes: [],
            connections: []
        };

        // Use template if specified
        if (template && this.templates[template]) {
            diagram = await this.generateFromTemplate(template, parsedComponents, options);
        } else {
            // Generate from parsed components
            diagram = await this.generateFromComponents(parsedComponents, options);
        }

        // Apply styling
        diagram = this.applyStyling(diagram, style);

        // Add technical details if requested
        if (includeTechnicalDetails) {
            diagram = this.addTechnicalDetails(diagram);
        }

        return diagram;
    }

    /**
     * Generate diagram from template
     * @param {string} template - Template name
     * @param {Object} parsedComponents - Parsed components
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated diagram
     */
    async generateFromTemplate(template, parsedComponents, options) {
        const templateData = this.templates[template];
        const diagram = {
            metadata: {
                name: `${template.charAt(0).toUpperCase() + template.slice(1)} Architecture`,
                description: `Generated using ${template} template`,
                version: '1.0',
                generatedAt: new Date().toISOString(),
                template,
                style: options.style || 'modern'
            },
            containers: [],
            nodes: [],
            connections: []
        };

        // Generate containers
        templateData.containers.forEach((container, index) => {
            diagram.containers.push({
                id: `container_${index + 1}`,
                label: container.name,
                type: container.type,
                position: { x: 50 + index * 250, y: 50 },
                size: { width: 200, height: 100 },
                color: this.getContainerColor(index),
                description: `${container.name} container`
            });
        });

        // Generate nodes
        templateData.nodes.forEach((node, index) => {
            const container = diagram.containers.find(c => c.label === node.container);
            diagram.nodes.push({
                id: `node_${index + 1}`,
                label: node.name,
                type: node.type,
                parentContainer: container ? container.id : null,
                position: { x: 100 + index * 150, y: 100 },
                size: { width: 120, height: 60 },
                color: this.getNodeColor(node.type),
                description: `${node.name} component`
            });
        });

        // Generate connections
        templateData.connections.forEach((connection, index) => {
            const sourceNode = diagram.nodes.find(n => n.label === connection.source);
            const targetNode = diagram.nodes.find(n => n.label === connection.target);
            
            if (sourceNode && targetNode) {
                diagram.connections.push({
                    id: `conn_${index + 1}`,
                    source: sourceNode.id,
                    target: targetNode.id,
                    label: `${connection.type.toUpperCase()} connection`,
                    type: connection.type,
                    description: `${connection.source} connects to ${connection.target}`
                });
            }
        });

        return diagram;
    }

    /**
     * Generate diagram from parsed components
     * @param {Object} parsedComponents - Parsed components
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated diagram
     */
    async generateFromComponents(parsedComponents, options) {
        const diagram = {
            metadata: {
                title: 'Custom Architecture Diagram',
                description: 'Generated from natural language description',
                version: '1.0',
                author: 'MCP Agent',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            containers: [],
            nodes: [],
            edges: []
        };

        // Add containers
        if (parsedComponents.containers) {
            parsedComponents.containers.forEach((container, index) => {
                diagram.containers.push({
                    id: container.id || `container_${index + 1}`,
                    label: container.label,
                    position: { x: 50 + index * 300, y: 50 },
                    size: { width: 250, height: 150 },
                    color: container.color || this.getContainerColor(index),
                    bgColor: container.color || this.getContainerColor(index),
                    borderColor: '#E2E8F0',
                    textColor: '#1F2937',
                    icon: this.getContainerIcon(container.type),
                    description: container.description || `Container for ${container.label}`,
                    zIndex: index + 1
                });
            });
        }

        // Add nodes
        if (parsedComponents.nodes) {
            parsedComponents.nodes.forEach((node, index) => {
                const containerIndex = Math.floor(index / 2); // Distribute nodes across containers
                const parentContainer = parsedComponents.containers && parsedComponents.containers[containerIndex] 
                    ? parsedComponents.containers[containerIndex].id 
                    : undefined;
                
                diagram.nodes.push({
                    id: node.id || `node_${index + 1}`,
                    label: node.label,
                    type: this.mapNodeType(node.type),
                    position: { x: 100 + (index % 2) * 150, y: 100 + Math.floor(index / 2) * 100 },
                    size: { width: 120, height: 60 },
                    parentContainer: parentContainer,
                    color: node.color || this.getNodeColor(node.type),
                    bgColor: node.color || this.getNodeColor(node.type),
                    borderColor: '#E5E7EB',
                    textColor: '#065F46',
                    icon: this.getNodeIcon(node.type),
                    description: node.description || `${node.label} component`,
                    technicalDetails: this.formatTechnicalDetails(node),
                    zIndex: index + 1
                });
            });
        }

        // Add edges (connections)
        if (parsedComponents.connections) {
            parsedComponents.connections.forEach((connection, index) => {
                diagram.edges.push({
                    id: connection.id || `edge_${index + 1}`,
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: 'right-source',
                    targetHandle: 'left-target',
                    type: 'intelligent',
                    label: connection.label || `${connection.source} to ${connection.target}`,
                    animated: false,
                    style: {
                        stroke: '#6B7280',
                        strokeWidth: 2,
                        strokeDasharray: 'none'
                    },
                    markerStart: { type: 'none' },
                    markerEnd: { type: 'arrow' },
                    data: {
                        label: connection.label || `${connection.source} to ${connection.target}`,
                        description: connection.description || `Connection from ${connection.source} to ${connection.target}`,
                        autoRouted: true
                    }
                });
            });
        }

        // Add viewport
        diagram.viewport = {
            x: 0,
            y: 0,
            zoom: 1
        };

        return diagram;
    }

    /**
     * Apply styling to diagram
     * @param {Object} diagram - Diagram data
     * @param {string} style - Style name
     * @returns {Object} Styled diagram
     */
    applyStyling(diagram, style) {
        const styledDiagram = { ...diagram };

        switch (style) {
            case 'modern':
                styledDiagram.containers.forEach(container => {
                    container.style = {
                        borderRadius: '8px',
                        borderWidth: '2px',
                        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    };
                });
                styledDiagram.nodes.forEach(node => {
                    node.style = {
                        borderRadius: '6px',
                        borderWidth: '1px',
                        shadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    };
                });
                break;
            case 'classic':
                styledDiagram.containers.forEach(container => {
                    container.style = {
                        borderRadius: '0px',
                        borderWidth: '3px',
                        shadow: 'none'
                    };
                });
                styledDiagram.nodes.forEach(node => {
                    node.style = {
                        borderRadius: '0px',
                        borderWidth: '2px',
                        shadow: 'none'
                    };
                });
                break;
            case 'minimal':
                styledDiagram.containers.forEach(container => {
                    container.style = {
                        borderRadius: '4px',
                        borderWidth: '1px',
                        shadow: 'none'
                    };
                });
                styledDiagram.nodes.forEach(node => {
                    node.style = {
                        borderRadius: '4px',
                        borderWidth: '1px',
                        shadow: 'none'
                    };
                });
                break;
        }

        return styledDiagram;
    }

    /**
     * Add technical details to diagram
     * @param {Object} diagram - Diagram data
     * @returns {Object} Diagram with technical details
     */
    addTechnicalDetails(diagram) {
        const enhancedDiagram = { ...diagram };

        // Add technical details to nodes
        enhancedDiagram.nodes.forEach(node => {
            if (!node.technicalDetails) {
                node.technicalDetails = {
                    type: node.type,
                    performance: {
                        responseTime: '<100ms',
                        throughput: 'High'
                    },
                    security: {
                        authentication: 'OAuth2',
                        encryption: 'TLS 1.3'
                    }
                };
            }
        });

        // Add technical details to connections
        enhancedDiagram.connections.forEach(connection => {
            if (!connection.technicalDetails) {
                connection.technicalDetails = {
                    protocol: connection.type === 'http' ? 'HTTP/2' : 'gRPC',
                    security: 'TLS 1.3',
                    reliability: 'High'
                };
            }
        });

        // Add technical details to containers
        enhancedDiagram.containers.forEach(container => {
            if (!container.technicalDetails) {
                container.technicalDetails = {
                    scaling: 'Auto-scaling',
                    availability: '99.9%',
                    monitoring: 'Prometheus + Grafana'
                };
            }
        });

        return enhancedDiagram;
    }

    /**
     * Get container color based on index
     * @param {number} index - Container index
     * @returns {string} Color hex code
     */
    getContainerColor(index) {
        const colors = ['#FFD700', '#40E0D0', '#FF6347', '#4682B4', '#32CD32', '#8A2BE2', '#FF8C00', '#00008B'];
        return colors[index % colors.length];
    }

    /**
     * Get node color based on type
     * @param {string} type - Node type
     * @returns {string} Color hex code
     */
    getNodeColor(type) {
        const colorMap = {
            'service': '#4CAF50',
            'api': '#2196F3',
            'server': '#FF9800',
            'client': '#9C27B0',
            'database': '#607D8B',
            'storage': '#795548',
            'gateway': '#E91E63',
            'function': '#00BCD4',
            'spa': '#8BC34A',
            'component': '#FF5722'
        };
        return colorMap[type] || '#607D8B';
    }

    /**
     * Validate generated diagram
     * @param {Object} diagram - Generated diagram
     * @returns {Object} Validation result
     */
    validateDiagram(diagram) {
        const errors = [];
        const warnings = [];

        // Check for required fields
        if (!diagram.containers || diagram.containers.length === 0) {
            warnings.push('No containers in diagram');
        }

        if (!diagram.nodes || diagram.nodes.length === 0) {
            warnings.push('No nodes in diagram');
        }

        // Check for orphaned connections
        if (diagram.connections) {
            diagram.connections.forEach(conn => {
                const sourceExists = diagram.nodes.some(n => n.id === conn.source);
                const targetExists = diagram.nodes.some(n => n.id === conn.target);
                
                if (!sourceExists || !targetExists) {
                    errors.push(`Connection ${conn.id} references non-existent nodes`);
                }
            });
        }

        // Check for nodes without containers
        if (diagram.nodes) {
            diagram.nodes.forEach(node => {
                if (node.parentContainer) {
                    const containerExists = diagram.containers.some(c => c.id === node.parentContainer);
                    if (!containerExists) {
                        warnings.push(`Node ${node.id} references non-existent container ${node.parentContainer}`);
                    }
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Map node type to schema-compliant type
     * @param {string} nodeType - Original node type
     * @returns {string} Schema-compliant type
     */
    mapNodeType(nodeType) {
        const typeMap = {
            'service': 'component',
            'api': 'component',
            'database': 'component',
            'gateway': 'component',
            'load_balancer': 'component',
            'proxy': 'component',
            'external': 'component',
            'client': 'component',
            'server': 'component',
            'storage': 'component',
            'function': 'component',
            'decision': 'diamond',
            'start': 'circle',
            'end': 'circle',
            'process': 'hexagon',
            'subprocess': 'triangle'
        };
        
        return typeMap[nodeType] || 'component';
    }

    /**
     * Format technical details as string
     * @param {Object} node - Node object
     * @returns {string} Formatted technical details
     */
    formatTechnicalDetails(node) {
        if (!node.technicalDetails) {
            return '';
        }

        const details = [];
        
        if (node.technicalDetails.type) {
            details.push(node.technicalDetails.type);
        }
        
        if (node.technicalDetails.category) {
            details.push(node.technicalDetails.category);
        }
        
        if (node.technicalDetails.protocol) {
            details.push(node.technicalDetails.protocol);
        }
        
        if (node.technicalDetails.responseTime) {
            details.push(`<${node.technicalDetails.responseTime}`);
        }
        
        return details.join(', ');
    }

    /**
     * Get container icon based on type
     * @param {string} containerType - Container type
     * @returns {string} Icon emoji
     */
    getContainerIcon(containerType) {
        const iconMap = {
            'web': '🌐',
            'gateway': '🚪',
            'services': '⚙️',
            'storage': '🗄️',
            'functions': '⚡',
            'monolith': '🏢',
            'container': '📦'
        };
        
        return iconMap[containerType] || '📦';
    }

    /**
     * Get node icon based on type
     * @param {string} nodeType - Node type
     * @returns {string} Icon emoji
     */
    getNodeIcon(nodeType) {
        const iconMap = {
            'service': '🔧',
            'api': '🔗',
            'database': '🗄️',
            'gateway': '🚪',
            'load_balancer': '⚖️',
            'proxy': '🔄',
            'external': '🌍',
            'client': '💻',
            'server': '🖥️',
            'storage': '💾',
            'function': '⚡',
            'spa': '📱',
            'component': '🔧'
        };
        
        return iconMap[nodeType] || '🔧';
    }
} 