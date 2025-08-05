/**
 * Description Parser
 * Parses natural language descriptions into diagram components
 */
export class DescriptionParser {
    constructor() {
        this.componentPatterns = [
            // Service patterns
            { pattern: /(\w+)\s+service/gi, type: 'service', category: 'component' },
            { pattern: /(\w+)\s+api/gi, type: 'api', category: 'component' },
            { pattern: /(\w+)\s+server/gi, type: 'server', category: 'component' },
            { pattern: /(\w+)\s+client/gi, type: 'client', category: 'component' },
            
            // Database patterns
            { pattern: /(\w+)\s+database/gi, type: 'database', category: 'storage' },
            { pattern: /(\w+)\s+db/gi, type: 'database', category: 'storage' },
            { pattern: /(\w+)\s+store/gi, type: 'storage', category: 'storage' },
            
            // Infrastructure patterns
            { pattern: /(\w+)\s+container/gi, type: 'container', category: 'infrastructure' },
            { pattern: /(\w+)\s+pod/gi, type: 'pod', category: 'infrastructure' },
            { pattern: /(\w+)\s+node/gi, type: 'node', category: 'infrastructure' },
            
            // Network patterns
            { pattern: /(\w+)\s+gateway/gi, type: 'gateway', category: 'network' },
            { pattern: /(\w+)\s+load\s+balancer/gi, type: 'load_balancer', category: 'network' },
            { pattern: /(\w+)\s+proxy/gi, type: 'proxy', category: 'network' },
            
            // External patterns
            { pattern: /(\w+)\s+external/gi, type: 'external', category: 'external' },
            { pattern: /(\w+)\s+third\s+party/gi, type: 'external', category: 'external' }
        ];

        this.connectionPatterns = [
            // HTTP patterns
            { pattern: /(\w+)\s+calls\s+(\w+)/gi, type: 'http', protocol: 'HTTP' },
            { pattern: /(\w+)\s+communicates\s+with\s+(\w+)/gi, type: 'http', protocol: 'HTTP' },
            { pattern: /(\w+)\s+connects\s+to\s+(\w+)/gi, type: 'http', protocol: 'HTTP' },
            
            // gRPC patterns
            { pattern: /(\w+)\s+gRPC\s+(\w+)/gi, type: 'grpc', protocol: 'gRPC' },
            
            // Database patterns
            { pattern: /(\w+)\s+stores\s+data\s+in\s+(\w+)/gi, type: 'database', protocol: 'SQL' },
            { pattern: /(\w+)\s+queries\s+(\w+)/gi, type: 'database', protocol: 'SQL' },
            
            // Message patterns
            { pattern: /(\w+)\s+publishes\s+to\s+(\w+)/gi, type: 'message', protocol: 'Kafka' },
            { pattern: /(\w+)\s+subscribes\s+to\s+(\w+)/gi, type: 'message', protocol: 'Kafka' }
        ];

        this.technicalPatterns = [
            // Performance patterns
            { pattern: /<(\d+ms|\d+s)/gi, type: 'performance', field: 'responseTime' },
            { pattern: /(\d+)\s+requests\/sec/gi, type: 'performance', field: 'throughput' },
            
            // Protocol patterns
            { pattern: /(HTTP\/\d+|gRPC|WebSocket)/gi, type: 'protocol', field: 'protocol' },
            
            // Security patterns
            { pattern: /(OAuth2|JWT|mTLS|SSL|TLS)/gi, type: 'security', field: 'authentication' },
            
            // Deployment patterns
            { pattern: /(Stateless|Stateful|Serverless)/gi, type: 'deployment', field: 'deploymentType' }
        ];
    }

    /**
     * Parse natural language description into diagram components
     * @param {string} description - Natural language description
     * @returns {Promise<Object>} Parsed components
     */
    async parse(description) {
        if (!description || typeof description !== 'string') {
            throw new Error('Invalid description: must be a non-empty string');
        }

        const components = {
            containers: [],
            nodes: [],
            connections: [],
            metadata: {
                parsedFrom: description,
                parsedAt: new Date().toISOString(),
                confidence: 0.8
            }
        };

        // Extract containers
        components.containers = this.extractContainers(description);
        
        // Extract nodes
        components.nodes = this.extractNodes(description);
        
        // Extract connections
        components.connections = this.extractConnections(description);
        
        // Extract technical details
        this.extractTechnicalDetails(components, description);
        
        // Calculate confidence based on extraction results
        components.metadata.confidence = this.calculateConfidence(components);
        
        return components;
    }

    /**
     * Extract containers from description
     * @param {string} description - Description text
     * @returns {Array} Array of containers
     */
    extractContainers(description) {
        const containers = [];
        const containerKeywords = ['system', 'platform', 'application', 'service', 'environment'];
        
        // Look for container-like entities
        containerKeywords.forEach(keyword => {
            const regex = new RegExp(`(\\w+)\\s+${keyword}`, 'gi');
            let match;
            
            while ((match = regex.exec(description)) !== null) {
                const containerName = match[1];
                const existingContainer = containers.find(c => c.label.toLowerCase().includes(containerName.toLowerCase()));
                
                if (!existingContainer) {
                    containers.push({
                        id: `container_${containers.length + 1}`,
                        label: `${containerName} ${keyword}`,
                        type: 'container',
                        position: { x: 0, y: 0 },
                        size: { width: 200, height: 100 },
                        color: this.getContainerColor(containers.length),
                        description: `Container for ${containerName} ${keyword}`
                    });
                }
            }
        });

        return containers;
    }

    /**
     * Extract nodes from description
     * @param {string} description - Description text
     * @returns {Array} Array of nodes
     */
    extractNodes(description) {
        const nodes = [];
        
        this.componentPatterns.forEach(pattern => {
            const regex = new RegExp(pattern.pattern.source, 'gi');
            let match;
            
            while ((match = regex.exec(description)) !== null) {
                const componentName = match[1];
                const existingNode = nodes.find(n => n.label.toLowerCase().includes(componentName.toLowerCase()));
                
                if (!existingNode) {
                    nodes.push({
                        id: `node_${nodes.length + 1}`,
                        label: `${componentName} ${pattern.type}`,
                        type: pattern.type,
                        category: pattern.category,
                        position: { x: 0, y: 0 },
                        size: { width: 120, height: 60 },
                        color: this.getNodeColor(pattern.category),
                        description: `${componentName} ${pattern.type} component`,
                        technicalDetails: {
                            type: pattern.type,
                            category: pattern.category
                        }
                    });
                }
            }
        });

        return nodes;
    }

    /**
     * Extract connections from description
     * @param {string} description - Description text
     * @returns {Array} Array of connections
     */
    extractConnections(description) {
        const connections = [];
        
        // Extract connections using patterns
        this.connectionPatterns.forEach(pattern => {
            const regex = new RegExp(pattern.pattern.source, 'gi');
            let match;
            
            while ((match = regex.exec(description)) !== null) {
                const sourceName = match[1];
                const targetName = match[2];
                
                // Find corresponding nodes
                const sourceNode = this.findNodeByName(sourceName);
                const targetNode = this.findNodeByName(targetName);
                
                if (sourceNode && targetNode) {
                    connections.push({
                        id: `conn_${connections.length + 1}`,
                        source: sourceNode.id,
                        target: targetNode.id,
                        label: `${pattern.protocol} connection`,
                        type: pattern.type,
                        protocol: pattern.protocol,
                        description: `${sourceName} connects to ${targetName} via ${pattern.protocol}`,
                        technicalDetails: {
                            protocol: pattern.protocol,
                            type: pattern.type
                        }
                    });
                }
            }
        });

        // Generate logical connections based on component types
        const nodes = this.extractNodes(description);
        const containers = this.extractContainers(description);
        
        // Connect services to database
        const services = nodes.filter(node => node.type === 'service');
        const databases = nodes.filter(node => node.type === 'database');
        
        services.forEach(service => {
            databases.forEach(db => {
                connections.push({
                    id: `conn_${connections.length + 1}`,
                    source: service.id,
                    target: db.id,
                    label: 'Database connection',
                    type: 'database',
                    protocol: 'SQL',
                    description: `${service.label} connects to ${db.label}`,
                    technicalDetails: {
                        protocol: 'SQL',
                        type: 'database'
                    }
                });
            });
        });

        // Connect API gateway to services
        const gateways = nodes.filter(node => node.type === 'gateway' || node.type === 'api');
        gateways.forEach(gateway => {
            services.forEach(service => {
                connections.push({
                    id: `conn_${connections.length + 1}`,
                    source: gateway.id,
                    target: service.id,
                    label: 'API call',
                    type: 'http',
                    protocol: 'HTTP',
                    description: `${gateway.label} calls ${service.label}`,
                    technicalDetails: {
                        protocol: 'HTTP',
                        type: 'http'
                    }
                });
            });
        });

        // Connect load balancer to services
        const loadBalancers = nodes.filter(node => node.type === 'load_balancer');
        loadBalancers.forEach(lb => {
            services.forEach(service => {
                connections.push({
                    id: `conn_${connections.length + 1}`,
                    source: lb.id,
                    target: service.id,
                    label: 'Load balanced',
                    type: 'http',
                    protocol: 'HTTP',
                    description: `${lb.label} distributes traffic to ${service.label}`,
                    technicalDetails: {
                        protocol: 'HTTP',
                        type: 'http'
                    }
                });
            });
        });

        return connections;
    }

    /**
     * Extract technical details from description
     * @param {Object} components - Components object
     * @param {string} description - Description text
     */
    extractTechnicalDetails(components, description) {
        // Extract technical details for nodes
        components.nodes.forEach(node => {
            const nodeText = node.label.toLowerCase();
            const technicalDetails = {};
            
            this.technicalPatterns.forEach(pattern => {
                const regex = new RegExp(pattern.pattern.source, 'gi');
                const match = description.match(regex);
                
                if (match) {
                    technicalDetails[pattern.field] = match[0];
                }
            });
            
            if (Object.keys(technicalDetails).length > 0) {
                node.technicalDetails = {
                    ...node.technicalDetails,
                    ...technicalDetails
                };
            }
        });
    }

    /**
     * Find node by name (case-insensitive)
     * @param {string} name - Node name to find
     * @returns {Object|null} Node object or null
     */
    findNodeByName(name) {
        // This would be implemented to find nodes in the current context
        // For now, return a mock node
        return {
            id: `node_${name.toLowerCase()}`,
            label: name
        };
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
     * Get node color based on category
     * @param {string} category - Node category
     * @returns {string} Color hex code
     */
    getNodeColor(category) {
        const colorMap = {
            'component': '#4CAF50',
            'storage': '#2196F3',
            'infrastructure': '#FF9800',
            'network': '#9C27B0',
            'external': '#F44336'
        };
        return colorMap[category] || '#607D8B';
    }

    /**
     * Calculate parsing confidence
     * @param {Object} components - Parsed components
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidence(components) {
        let score = 0;
        let total = 0;
        
        // Score based on number of components found
        if (components.containers.length > 0) {
            score += 0.2;
            total += 0.2;
        }
        
        if (components.nodes.length > 0) {
            score += 0.3;
            total += 0.3;
        }
        
        if (components.connections.length > 0) {
            score += 0.3;
            total += 0.3;
        }
        
        // Score based on technical details
        const nodesWithTechDetails = components.nodes.filter(n => n.technicalDetails && Object.keys(n.technicalDetails).length > 1);
        if (nodesWithTechDetails.length > 0) {
            score += 0.2;
            total += 0.2;
        }
        
        return total > 0 ? score / total : 0.5;
    }

    /**
     * Validate parsed components
     * @param {Object} components - Parsed components
     * @returns {Object} Validation result
     */
    validateComponents(components) {
        const errors = [];
        const warnings = [];
        
        // Check for required fields
        if (!components.containers || components.containers.length === 0) {
            warnings.push('No containers found in description');
        }
        
        if (!components.nodes || components.nodes.length === 0) {
            warnings.push('No nodes found in description');
        }
        
        // Check for orphaned connections
        if (components.connections) {
            components.connections.forEach(conn => {
                const sourceExists = components.nodes.some(n => n.id === conn.source);
                const targetExists = components.nodes.some(n => n.id === conn.target);
                
                if (!sourceExists || !targetExists) {
                    errors.push(`Connection ${conn.id} references non-existent nodes`);
                }
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
} 