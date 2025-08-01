import Ajv from 'ajv';

export class ValidationService {
    constructor() {
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true
        });
        this.schemas = new Map();
        this.setupDefaultSchemas();
    }

    /**
     * Setup default validation schemas
     */
    setupDefaultSchemas() {
        // Main diagram schema
        const diagramSchema = {
            type: 'object',
            properties: {
                containers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'label', 'position', 'size'],
                        properties: {
                            id: { type: 'string' },
                            label: { type: 'string' },
                            position: {
                                type: 'object',
                                required: ['x', 'y'],
                                properties: {
                                    x: { type: 'number' },
                                    y: { type: 'number' }
                                }
                            },
                            size: {
                                type: 'object',
                                required: ['width', 'height'],
                                properties: {
                                    width: { type: 'number' },
                                    height: { type: 'number' }
                                }
                            },
                            color: { type: 'string' },
                            bgColor: { type: 'string' },
                            borderColor: { type: 'string' },
                            icon: { type: 'string' },
                            description: { type: 'string' },
                            zIndex: { type: 'number' }
                        }
                    }
                },
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'label', 'position'],
                        properties: {
                            id: { type: 'string' },
                            label: { type: 'string' },
                            type: { type: 'string' },
                            position: {
                                type: 'object',
                                required: ['x', 'y'],
                                properties: {
                                    x: { type: 'number' },
                                    y: { type: 'number' }
                                }
                            },
                            parentContainer: { type: 'string' },
                            size: {
                                type: 'object',
                                properties: {
                                    width: { type: 'number' },
                                    height: { type: 'number' }
                                }
                            },
                            color: { type: 'string' },
                            borderColor: { type: 'string' },
                            icon: { type: 'string' },
                            description: { type: 'string' },
                            zIndex: { type: 'number' }
                        }
                    }
                },
                connections: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'source', 'target'],
                        properties: {
                            id: { type: 'string' },
                            source: { type: 'string' },
                            target: { type: 'string' },
                            label: { type: 'string' },
                            type: { type: 'string' },
                            animated: { type: 'boolean' },
                            description: { type: 'string' },
                            waypoints: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        x: { type: 'number' },
                                        y: { type: 'number' }
                                    }
                                }
                            },
                            markerStart: { type: 'string' },
                            markerEnd: { type: 'string' },
                            intersection: { type: 'string' },
                            style: {
                                type: 'object',
                                properties: {
                                    strokeWidth: { type: 'number' },
                                    strokeDasharray: { type: 'string' },
                                    stroke: { type: 'string' }
                                }
                            },
                            zIndex: { type: 'number' }
                        }
                    }
                },
                metadata: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        version: { type: 'string' },
                        exportDate: { type: 'string' }
                    }
                }
            },
            required: ['containers', 'nodes', 'connections']
        };

        this.registerSchema('diagram', diagramSchema);

        // Node validation schema
        const nodeSchema = {
            type: 'object',
            required: ['id', 'label', 'position'],
            properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                type: { type: 'string' },
                position: {
                    type: 'object',
                    required: ['x', 'y'],
                    properties: {
                        x: { type: 'number' },
                        y: { type: 'number' }
                    }
                }
            }
        };

        this.registerSchema('node', nodeSchema);

        // Connection validation schema
        const connectionSchema = {
            type: 'object',
            required: ['id', 'source', 'target'],
            properties: {
                id: { type: 'string' },
                source: { type: 'string' },
                target: { type: 'string' },
                label: { type: 'string' },
                type: { type: 'string' }
            }
        };

        this.registerSchema('connection', connectionSchema);
    }

    /**
     * Register a new validation schema
     * @param {string} name - Schema name
     * @param {Object} schema - JSON Schema object
     */
    registerSchema(name, schema) {
        const validate = this.ajv.compile(schema);
        this.schemas.set(name, { schema, validate });
    }

    /**
     * Validate data against a registered schema
     * @param {string} schemaName - Name of the schema to use
     * @param {Object} data - Data to validate
     * @returns {Object} Validation result
     */
    validate(schemaName, data) {
        const schemaInfo = this.schemas.get(schemaName);
        if (!schemaInfo) {
            throw new Error(`Schema '${schemaName}' not found`);
        }

        const isValid = schemaInfo.validate(data);
        return {
            isValid,
            errors: schemaInfo.validate.errors || [],
            errorText: this.ajv.errorsText(schemaInfo.validate.errors)
        };
    }

    /**
     * Validate diagram data (default validation)
     * @param {Object} data - Diagram data to validate
     * @returns {Object} Validated data or throws error
     */
    async validateDiagram(data) {
        // Use simple validation instead of strict schema validation
        if (!this.isValidDiagramStructure(data)) {
            throw new Error('Diagram validation failed: Invalid diagram structure. Required fields: containers, nodes, connections');
        }

        // Additional validation for required fields in containers, nodes, and connections
        const validationErrors = [];

        // Validate containers
        if (data.containers && Array.isArray(data.containers)) {
            data.containers.forEach((container, index) => {
                if (!container.id || !container.label || !container.position) {
                    validationErrors.push(`Container ${index}: Missing required fields (id, label, position)`);
                }
            });
        }

        // Validate nodes
        if (data.nodes && Array.isArray(data.nodes)) {
            data.nodes.forEach((node, index) => {
                if (!node.id || !node.label || !node.position) {
                    validationErrors.push(`Node ${index}: Missing required fields (id, label, position)`);
                }
            });
        }

        // Validate connections
        if (data.connections && Array.isArray(data.connections)) {
            data.connections.forEach((connection, index) => {
                if (!connection.id || !connection.source || !connection.target) {
                    validationErrors.push(`Connection ${index}: Missing required fields (id, source, target)`);
                }
            });
        }

        if (validationErrors.length > 0) {
            throw new Error(`Diagram validation failed: ${validationErrors.join('; ')}`);
        }

        return data;
    }

    /**
     * Validate a single node
     * @param {Object} node - Node data to validate
     * @returns {Object} Validation result
     */
    validateNode(node) {
        return this.validate('node', node);
    }

    /**
     * Validate a single connection
     * @param {Object} connection - Connection data to validate
     * @returns {Object} Validation result
     */
    validateConnection(connection) {
        return this.validate('connection', connection);
    }

    /**
     * Validate JSON string
     * @param {string} jsonString - JSON string to validate
     * @returns {Object} Parsed and validated data
     */
    validateJsonString(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return this.validate('diagram', data);
        } catch (parseError) {
            return {
                isValid: false,
                errors: [{ message: `JSON parse error: ${parseError.message}` }],
                errorText: `Invalid JSON: ${parseError.message}`
            };
        }
    }

    /**
     * Get validation errors in a human-readable format
     * @param {Array} errors - Validation errors array
     * @returns {string} Formatted error message
     */
    formatValidationErrors(errors) {
        if (!errors || errors.length === 0) {
            return 'No validation errors';
        }

        return errors.map(error => {
            const path = error.instancePath || 'root';
            return `${path}: ${error.message}`;
        }).join('\n');
    }

    /**
     * Check if data structure is valid for diagram creation
     * @param {Object} data - Data to check
     * @returns {boolean} True if valid structure
     */
    isValidDiagramStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const requiredArrays = ['containers', 'nodes', 'connections'];
        return requiredArrays.every(key => Array.isArray(data[key]));
    }

    /**
     * Validate technical details format
     * @param {Object} technicalDetails - Technical details object
     * @returns {Object} Validation result
     */
    validateTechnicalDetails(technicalDetails) {
        const schema = {
            type: 'object',
            properties: {
                protocol: { type: 'string' },
                performance: {
                    type: 'object',
                    properties: {
                        latency: { type: 'string' },
                        throughput: { type: 'string' },
                        timeout: { type: 'string' }
                    }
                },
                security: { type: 'string' },
                scaling: { type: 'string' },
                infrastructure: { type: 'string' },
                monitoring: { type: 'string' }
            }
        };

        const validate = this.ajv.compile(schema);
        const isValid = validate(technicalDetails);

        return {
            isValid,
            errors: validate.errors || [],
            errorText: this.ajv.errorsText(validate.errors)
        };
    }
} 