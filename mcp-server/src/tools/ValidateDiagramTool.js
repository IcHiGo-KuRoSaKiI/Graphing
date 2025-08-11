import { BaseTool } from './BaseTool.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Validate Diagram Tool
 * Validates diagrams against the comprehensive schema and business rules
 */
export class ValidateDiagramTool extends BaseTool {
    constructor() {
        super();
        this.name = 'validate_diagram';
        this.description = 'Validate architecture diagrams against schema and best practices';
        this.schema = null;
    }

    /**
     * Load the JSON schema
     */
    async loadSchema() {
        if (!this.schema) {
            try {
                const schemaPath = path.join(process.cwd(), 'schemas', 'architecture-diagram-schema.json');
                const schemaContent = await fs.readFile(schemaPath, 'utf-8');
                this.schema = JSON.parse(schemaContent);
            } catch (error) {
                console.warn('Could not load schema:', error.message);
                this.schema = {}; // Fallback to basic validation
            }
        }
        return this.schema;
    }

    getInputSchema() {
        return {
            type: 'object',
            properties: {
                diagram: {
                    type: 'object',
                    description: 'Diagram data to validate'
                },
                strict: {
                    type: 'boolean',
                    description: 'Enable strict validation mode',
                    default: false
                },
                validationRules: {
                    type: 'object',
                    description: 'Custom validation rules',
                    properties: {
                        minNodes: { type: 'number' },
                        maxNodes: { type: 'number' },
                        minConnections: { type: 'number' },
                        maxConnections: { type: 'number' },
                        requireTechnicalDetails: { type: 'boolean' },
                        requireContainers: { type: 'boolean' }
                    }
                }
            },
            required: ['diagram']
        };
    }

    async execute(args, session) {
        try {
            this.validateInput(args, this.getInputSchema());
            
            const { diagram, strict = false, validationRules = {} } = args;
            await this.loadSchema();

            const validationResults = {
                isValid: true,
                errors: [],
                warnings: [],
                metrics: {},
                suggestions: []
            };

            // Basic structure validation
            await this.validateStructure(diagram, validationResults);
            
            // Content validation
            await this.validateContent(diagram, validationResults, validationRules);
            
            // Quality metrics calculation
            await this.calculateQualityMetrics(diagram, validationResults);
            
            // Architecture best practices
            await this.validateBestPractices(diagram, validationResults);

            // Generate suggestions
            await this.generateSuggestions(diagram, validationResults);

            validationResults.isValid = validationResults.errors.length === 0;

            return this.createSuccessResponse(validationResults, 'Diagram validation completed');

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    async validateStructure(diagram, results) {
        // Check required top-level properties
        const requiredProps = ['metadata', 'nodes'];
        for (const prop of requiredProps) {
            if (!diagram[prop]) {
                results.errors.push(`Missing required property: ${prop}`);
            }
        }

        // Validate metadata
        if (diagram.metadata) {
            const metadataRequired = ['name', 'description', 'version', 'author', 'created'];
            for (const prop of metadataRequired) {
                if (!diagram.metadata[prop]) {
                    results.errors.push(`Missing required metadata property: ${prop}`);
                }
            }
        }

        // Validate arrays
        if (diagram.nodes && !Array.isArray(diagram.nodes)) {
            results.errors.push('nodes must be an array');
        }
        if (diagram.containers && !Array.isArray(diagram.containers)) {
            results.errors.push('containers must be an array');
        }
        if (diagram.connections && !Array.isArray(diagram.connections)) {
            results.errors.push('connections must be an array');
        }
    }

    async validateContent(diagram, results, rules) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const containers = diagram.containers || [];

        // Apply custom validation rules
        if (rules.minNodes && nodes.length < rules.minNodes) {
            results.errors.push(`Minimum ${rules.minNodes} nodes required, found ${nodes.length}`);
        }
        if (rules.maxNodes && nodes.length > rules.maxNodes) {
            results.errors.push(`Maximum ${rules.maxNodes} nodes allowed, found ${nodes.length}`);
        }
        if (rules.minConnections && connections.length < rules.minConnections) {
            results.errors.push(`Minimum ${rules.minConnections} connections required, found ${connections.length}`);
        }
        if (rules.maxConnections && connections.length > rules.maxConnections) {
            results.errors.push(`Maximum ${rules.maxConnections} connections allowed, found ${connections.length}`);
        }

        // Validate node structure
        for (const node of nodes) {
            this.validateNode(node, results);
        }

        // Validate connections
        for (const connection of connections) {
            this.validateConnection(connection, nodes, results);
        }

        // Validate containers
        for (const container of containers) {
            this.validateContainer(container, results);
        }

        // Check for orphaned nodes
        this.checkOrphanedNodes(nodes, connections, results);

        // Technical details validation
        if (rules.requireTechnicalDetails) {
            this.validateTechnicalDetails(nodes, connections, results);
        }
    }

    validateNode(node, results) {
        const required = ['id', 'type', 'label', 'position'];
        for (const prop of required) {
            if (!node[prop]) {
                results.errors.push(`Node ${node.id || 'unknown'}: Missing required property ${prop}`);
            }
        }

        // Validate position
        if (node.position) {
            if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
                results.errors.push(`Node ${node.id}: Invalid position coordinates`);
            }
        }

        // Validate type
        const validTypes = ['component', 'container', 'diamond', 'circle', 'hexagon', 'triangle', 'database', 'api', 'service', 'ui', 'queue', 'cache', 'load-balancer'];
        if (node.type && !validTypes.includes(node.type)) {
            results.warnings.push(`Node ${node.id}: Unknown node type '${node.type}'`);
        }

        // Validate colors
        this.validateColorFormat(node.style?.backgroundColor, `Node ${node.id} backgroundColor`, results);
        this.validateColorFormat(node.style?.borderColor, `Node ${node.id} borderColor`, results);
        this.validateColorFormat(node.style?.textColor, `Node ${node.id} textColor`, results);
    }

    validateConnection(connection, nodes, results) {
        const required = ['id', 'source', 'target', 'type'];
        for (const prop of required) {
            if (!connection[prop]) {
                results.errors.push(`Connection ${connection.id || 'unknown'}: Missing required property ${prop}`);
            }
        }

        // Validate source and target exist
        const nodeIds = new Set(nodes.map(n => n.id));
        if (connection.source && !nodeIds.has(connection.source)) {
            results.errors.push(`Connection ${connection.id}: Source node '${connection.source}' not found`);
        }
        if (connection.target && !nodeIds.has(connection.target)) {
            results.errors.push(`Connection ${connection.id}: Target node '${connection.target}' not found`);
        }

        // Validate edge type
        const validTypes = ['default', 'straight', 'step', 'smoothstep', 'bezier', 'adjustable', 'orthogonal', 'smart-orthogonal', 'floating', 'enhanced-orthogonal', 'optimized-orthogonal'];
        if (connection.type && !validTypes.includes(connection.type)) {
            results.warnings.push(`Connection ${connection.id}: Unknown edge type '${connection.type}'`);
        }

        // Validate style
        if (connection.style?.stroke) {
            this.validateColorFormat(connection.style.stroke, `Connection ${connection.id} stroke`, results);
        }
    }

    validateContainer(container, results) {
        const required = ['id', 'label', 'position', 'size'];
        for (const prop of required) {
            if (!container[prop]) {
                results.errors.push(`Container ${container.id || 'unknown'}: Missing required property ${prop}`);
            }
        }

        // Validate size
        if (container.size) {
            if (typeof container.size.width !== 'number' || typeof container.size.height !== 'number') {
                results.errors.push(`Container ${container.id}: Invalid size dimensions`);
            }
            if (container.size.width < 100 || container.size.height < 100) {
                results.warnings.push(`Container ${container.id}: Minimum recommended size is 100x100`);
            }
        }
    }

    validateColorFormat(color, context, results) {
        if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
            results.errors.push(`${context}: Invalid color format '${color}'. Use #RRGGBB format`);
        }
    }

    checkOrphanedNodes(nodes, connections, results) {
        const connectedNodes = new Set();
        for (const conn of connections) {
            connectedNodes.add(conn.source);
            connectedNodes.add(conn.target);
        }

        const orphanedNodes = nodes.filter(node => !connectedNodes.has(node.id));
        if (orphanedNodes.length > 0) {
            results.warnings.push(`Found ${orphanedNodes.length} orphaned nodes: ${orphanedNodes.map(n => n.id).join(', ')}`);
        }
    }

    validateTechnicalDetails(nodes, connections, results) {
        for (const node of nodes) {
            if (!node.technicalDetails || Object.keys(node.technicalDetails).length === 0) {
                results.warnings.push(`Node ${node.id}: Missing technical details`);
            }
        }

        for (const connection of connections) {
            if (!connection.technicalDetails || Object.keys(connection.technicalDetails).length === 0) {
                results.warnings.push(`Connection ${connection.id}: Missing technical details`);
            }
        }
    }

    async calculateQualityMetrics(diagram, results) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const containers = diagram.containers || [];

        // Completeness score
        let completenessScore = 0;
        if (diagram.metadata) completenessScore += 0.2;
        if (nodes.length > 0) completenessScore += 0.3;
        if (connections.length > 0) completenessScore += 0.3;
        if (containers.length > 0) completenessScore += 0.1;
        if (nodes.some(n => n.technicalDetails)) completenessScore += 0.1;

        // Connectivity score
        const connectedNodes = new Set();
        connections.forEach(conn => {
            connectedNodes.add(conn.source);
            connectedNodes.add(conn.target);
        });
        const connectivityScore = nodes.length > 0 ? connectedNodes.size / nodes.length : 0;

        // Complexity balance (0.5 is ideal)
        const complexityRatio = connections.length / Math.max(nodes.length, 1);
        const complexityScore = 1 - Math.abs(0.5 - Math.min(complexityRatio, 1));

        results.metrics = {
            completenessScore: Math.round(completenessScore * 100) / 100,
            connectivityScore: Math.round(connectivityScore * 100) / 100,
            complexityScore: Math.round(complexityScore * 100) / 100,
            nodeCount: nodes.length,
            connectionCount: connections.length,
            containerCount: containers.length,
            orphanedNodeCount: nodes.length - connectedNodes.size
        };
    }

    async validateBestPractices(diagram, results) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];

        // Check for self-references
        const selfReferences = connections.filter(conn => conn.source === conn.target);
        if (selfReferences.length > 0) {
            results.warnings.push(`Found ${selfReferences.length} self-referencing connections`);
        }

        // Check for duplicate connections
        const connectionPairs = new Set();
        const duplicates = [];
        for (const conn of connections) {
            const pair = `${conn.source}-${conn.target}`;
            const reversePair = `${conn.target}-${conn.source}`;
            
            if (connectionPairs.has(pair) || (!conn.bidirectional && connectionPairs.has(reversePair))) {
                duplicates.push(conn.id);
            }
            connectionPairs.add(pair);
        }
        if (duplicates.length > 0) {
            results.warnings.push(`Found duplicate connections: ${duplicates.join(', ')}`);
        }

        // Check for reasonable node distribution
        if (nodes.length > 20) {
            const containerCount = diagram.containers?.length || 0;
            if (containerCount === 0) {
                results.suggestions.push('Consider using containers to group related components in large diagrams');
            } else if (nodes.length / containerCount > 15) {
                results.suggestions.push('Consider adding more containers to better organize components');
            }
        }

        // Check for consistent naming patterns
        const nodeLabels = nodes.map(n => n.label);
        const hasConsistentNaming = this.checkNamingConsistency(nodeLabels);
        if (!hasConsistentNaming) {
            results.suggestions.push('Consider using consistent naming patterns for components');
        }
    }

    checkNamingConsistency(labels) {
        // Simple heuristic: check if most labels follow a pattern
        const patterns = {
            camelCase: /^[a-z][a-zA-Z0-9]*$/,
            pascalCase: /^[A-Z][a-zA-Z0-9]*$/,
            kebabCase: /^[a-z0-9-]+$/,
            snakeCase: /^[a-z0-9_]+$/
        };

        const counts = Object.keys(patterns).reduce((acc, pattern) => {
            acc[pattern] = labels.filter(label => patterns[pattern].test(label)).length;
            return acc;
        }, {});

        const maxCount = Math.max(...Object.values(counts));
        return maxCount >= labels.length * 0.7; // 70% consistency threshold
    }

    async generateSuggestions(diagram, results) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];

        // Suggest adding missing technical details
        const nodesWithoutTech = nodes.filter(n => !n.technicalDetails || Object.keys(n.technicalDetails).length === 0);
        if (nodesWithoutTech.length > 0) {
            results.suggestions.push(`Add technical details to ${nodesWithoutTech.length} nodes for better documentation`);
        }

        // Suggest connection labels
        const connectionsWithoutLabels = connections.filter(c => !c.label);
        if (connectionsWithoutLabels.length > 0) {
            results.suggestions.push(`Add labels to ${connectionsWithoutLabels.length} connections to clarify relationships`);
        }

        // Suggest using smart routing
        const basicConnections = connections.filter(c => c.type === 'default' || !c.type);
        if (basicConnections.length > connections.length * 0.5) {
            results.suggestions.push('Consider using smart orthogonal routing for cleaner diagram appearance');
        }

        // Performance suggestions
        if (nodes.length > 50) {
            results.suggestions.push('Large diagrams may benefit from container grouping and layered views');
        }

        if (connections.length > 100) {
            results.suggestions.push('Consider using edge bundling or hierarchical connections for complex relationships');
        }
    }
}