import { BaseTool } from './BaseTool.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Schema Generator Tool
 * Generates JSON-RPC schemas for LLM structured output
 */
export class SchemaGeneratorTool extends BaseTool {
    constructor() {
        super();
        this.name = 'generate_schema';
        this.description = 'Generate JSON-RPC schemas for LLM structured output of architecture diagrams';
    }

    getInputSchema() {
        return {
            type: 'object',
            properties: {
                schemaType: {
                    type: 'string',
                    enum: ['full', 'minimal', 'template-specific', 'custom'],
                    default: 'full',
                    description: 'Type of schema to generate'
                },
                templateType: {
                    type: 'string',
                    enum: [
                        'microservices', 'monolith', 'serverless', 'event-driven',
                        'layered', 'hexagonal', 'service-mesh', 'data-pipeline',
                        'ml-pipeline', 'e-commerce', 'social-media', 'iot',
                        'blockchain', 'gaming'
                    ],
                    description: 'Specific template type for template-specific schemas'
                },
                complexity: {
                    type: 'string',
                    enum: ['simple', 'moderate', 'complex', 'enterprise'],
                    default: 'moderate',
                    description: 'Schema complexity level'
                },
                includeExamples: {
                    type: 'boolean',
                    default: true,
                    description: 'Include example values in schema'
                },
                outputFormat: {
                    type: 'string',
                    enum: ['json-schema', 'openai-function', 'anthropic-tool', 'json-rpc'],
                    default: 'json-schema',
                    description: 'Output format for the schema'
                },
                customFields: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                            description: { type: 'string' },
                            required: { type: 'boolean' }
                        }
                    },
                    description: 'Custom fields to include in schema'
                }
            },
            required: []
        };
    }

    async execute(args, session) {
        try {
            this.validateInput(args, this.getInputSchema());
            
            const {
                schemaType = 'full',
                templateType,
                complexity = 'moderate',
                includeExamples = true,
                outputFormat = 'json-schema',
                customFields = []
            } = args;

            // Load base schema
            const baseSchema = await this.loadBaseSchema();

            // Generate schema based on type
            let generatedSchema;
            switch (schemaType) {
                case 'full':
                    generatedSchema = await this.generateFullSchema(baseSchema, complexity, includeExamples);
                    break;
                case 'minimal':
                    generatedSchema = await this.generateMinimalSchema(baseSchema, complexity);
                    break;
                case 'template-specific':
                    generatedSchema = await this.generateTemplateSpecificSchema(baseSchema, templateType, complexity, includeExamples);
                    break;
                case 'custom':
                    generatedSchema = await this.generateCustomSchema(baseSchema, customFields, complexity);
                    break;
                default:
                    throw new Error(`Unknown schema type: ${schemaType}`);
            }

            // Format output according to specified format
            const formattedSchema = await this.formatSchema(generatedSchema, outputFormat);

            // Add usage instructions
            const result = {
                schema: formattedSchema,
                usage: this.generateUsageInstructions(outputFormat, schemaType),
                examples: includeExamples ? await this.generateExamples(schemaType, templateType) : null,
                metadata: {
                    schemaType,
                    templateType,
                    complexity,
                    outputFormat,
                    generated: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            return this.createSuccessResponse(result, `Generated ${schemaType} schema in ${outputFormat} format`);

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    async loadBaseSchema() {
        try {
            const schemaPath = path.join(process.cwd(), 'schemas', 'architecture-diagram-schema.json');
            const schemaContent = await fs.readFile(schemaPath, 'utf-8');
            return JSON.parse(schemaContent);
        } catch (error) {
            console.warn('Could not load base schema, using fallback');
            return this.getFallbackSchema();
        }
    }

    async generateFullSchema(baseSchema, complexity, includeExamples) {
        const schema = JSON.parse(JSON.stringify(baseSchema)); // Deep copy

        // Add complexity-specific constraints
        this.applyComplexityConstraints(schema, complexity);

        if (includeExamples) {
            this.addExamples(schema);
        }

        // Add LLM-specific instructions
        schema.llmInstructions = {
            purpose: "Generate comprehensive architecture diagrams with detailed technical specifications",
            requirements: [
                "Include all required fields with realistic values",
                "Use appropriate icons from the provided enum lists",
                "Ensure technical details are comprehensive and accurate",
                "Follow color scheme guidelines for visual consistency",
                "Include meaningful descriptions for all components",
                "Use smart orthogonal routing for better diagram appearance"
            ],
            qualityChecks: [
                "Validate all connections reference existing nodes",
                "Ensure parent container references are valid",
                "Check that technical details are realistic and complete",
                "Verify color values follow the specified patterns",
                "Confirm node positions create logical layouts"
            ]
        };

        return schema;
    }

    async generateMinimalSchema(baseSchema, complexity) {
        const requiredFields = {
            type: 'object',
            properties: {
                metadata: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Diagram name' },
                        description: { type: 'string', description: 'Brief description' },
                        version: { type: 'string', default: '1.0.0' },
                        author: { type: 'string', default: 'LLM Generated' },
                        created: { type: 'string', format: 'date-time' }
                    },
                    required: ['name', 'description', 'version', 'author', 'created']
                },
                nodes: {
                    type: 'array',
                    minItems: complexity === 'simple' ? 3 : complexity === 'moderate' ? 5 : 8,
                    maxItems: complexity === 'simple' ? 10 : complexity === 'moderate' ? 20 : 50,
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
                            type: { type: 'string', enum: ['component', 'database', 'api', 'service'] },
                            label: { type: 'string', minLength: 1, maxLength: 100 },
                            position: {
                                type: 'object',
                                properties: {
                                    x: { type: 'number' },
                                    y: { type: 'number' }
                                },
                                required: ['x', 'y']
                            },
                            description: { type: 'string', maxLength: 200 }
                        },
                        required: ['id', 'type', 'label', 'position', 'description']
                    }
                },
                connections: {
                    type: 'array',
                    minItems: 2,
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$' },
                            source: { type: 'string' },
                            target: { type: 'string' },
                            type: { type: 'string', enum: ['default', 'smart-orthogonal'], default: 'smart-orthogonal' },
                            label: { type: 'string', maxLength: 100 },
                            description: { type: 'string', maxLength: 200 }
                        },
                        required: ['id', 'source', 'target', 'type', 'label']
                    }
                }
            },
            required: ['metadata', 'nodes', 'connections'],
            additionalProperties: false
        };

        return {
            ...requiredFields,
            llmInstructions: {
                purpose: "Generate minimal but complete architecture diagrams",
                requirements: [
                    "Focus on core components and relationships",
                    "Use descriptive labels and clear connections",
                    "Ensure all connections reference valid node IDs",
                    "Position nodes for logical flow"
                ]
            }
        };
    }

    async generateTemplateSpecificSchema(baseSchema, templateType, complexity, includeExamples) {
        if (!templateType) {
            throw new Error('templateType is required for template-specific schemas');
        }

        const schema = await this.generateFullSchema(baseSchema, complexity, includeExamples);

        // Customize schema for specific template
        const templateCustomizations = {
            microservices: {
                requiredContainers: ['api-gateway-zone', 'services-zone', 'data-zone'],
                requiredNodeTypes: ['api', 'service', 'database', 'queue'],
                minNodes: 5,
                minConnections: 6,
                patterns: ['api-gateway', 'service-discovery', 'circuit-breaker']
            },
            serverless: {
                requiredContainers: ['compute-layer', 'storage-layer'],
                requiredNodeTypes: ['component', 'database'],
                minNodes: 4,
                minConnections: 4,
                patterns: ['event-sourcing', 'lambda']
            },
            monolith: {
                requiredContainers: ['presentation-layer', 'business-layer', 'data-layer'],
                requiredNodeTypes: ['component', 'database'],
                minNodes: 4,
                minConnections: 3,
                patterns: ['layered', 'mvc']
            }
        };

        const customization = templateCustomizations[templateType];
        if (customization) {
            // Update metadata
            schema.properties.metadata.properties.domain = {
                type: 'string',
                enum: [templateType],
                description: `Architecture domain: ${templateType}`
            };

            schema.properties.metadata.properties.architecture_patterns = {
                type: 'array',
                items: {
                    type: 'string',
                    enum: customization.patterns
                },
                description: `Recommended patterns for ${templateType}`
            };

            // Update nodes constraints
            schema.properties.nodes.minItems = customization.minNodes;
            schema.properties.connections.minItems = customization.minConnections;

            // Add template-specific instructions
            schema.llmInstructions.templateSpecific = {
                type: templateType,
                requiredContainers: customization.requiredContainers,
                requiredNodeTypes: customization.requiredNodeTypes,
                recommendations: [
                    `Follow ${templateType} architecture best practices`,
                    `Include typical components for ${templateType} systems`,
                    `Use appropriate connection patterns for ${templateType}`
                ]
            };
        }

        return schema;
    }

    async generateCustomSchema(baseSchema, customFields, complexity) {
        const schema = await this.generateMinimalSchema(baseSchema, complexity);

        // Add custom fields to nodes
        if (customFields.length > 0) {
            customFields.forEach(field => {
                if (field.name && field.type) {
                    schema.properties.nodes.items.properties[field.name] = {
                        type: field.type,
                        description: field.description || `Custom field: ${field.name}`
                    };

                    if (field.required) {
                        schema.properties.nodes.items.required.push(field.name);
                    }
                }
            });

            schema.llmInstructions.customFields = customFields.map(field => ({
                name: field.name,
                description: field.description,
                required: field.required
            }));
        }

        return schema;
    }

    applyComplexityConstraints(schema, complexity) {
        const constraints = {
            simple: {
                maxNodes: 15,
                maxConnections: 20,
                maxContainers: 3,
                requiredDetails: false
            },
            moderate: {
                maxNodes: 50,
                maxConnections: 80,
                maxContainers: 6,
                requiredDetails: true
            },
            complex: {
                maxNodes: 100,
                maxConnections: 150,
                maxContainers: 10,
                requiredDetails: true
            },
            enterprise: {
                maxNodes: 200,
                maxConnections: 500,
                maxContainers: 20,
                requiredDetails: true
            }
        };

        const constraint = constraints[complexity] || constraints.moderate;

        // Apply constraints
        if (schema.properties.nodes) {
            schema.properties.nodes.maxItems = constraint.maxNodes;
        }
        if (schema.properties.connections) {
            schema.properties.connections.maxItems = constraint.maxConnections;
        }
        if (schema.properties.containers) {
            schema.properties.containers.maxItems = constraint.maxContainers;
        }

        // Technical details requirement
        if (constraint.requiredDetails) {
            schema.llmInstructions.technicalDetailsRequired = true;
        }
    }

    addExamples(schema) {
        // Add example values to schema properties
        if (schema.properties.metadata) {
            schema.properties.metadata.example = {
                name: "E-commerce Microservices Platform",
                description: "Scalable e-commerce platform with microservices architecture",
                version: "1.0.0",
                author: "System Architect",
                created: "2024-01-15T10:00:00Z",
                tags: ["e-commerce", "microservices", "kubernetes"],
                domain: "microservices",
                technology_stack: ["kubernetes", "docker", "node.js", "postgresql"],
                complexity_level: "complex"
            };
        }

        if (schema.properties.nodes) {
            schema.properties.nodes.example = [
                {
                    id: "user-service",
                    type: "service",
                    label: "User Service (gRPC, JWT, Circuit Breaker)",
                    position: { x: 100, y: 200 },
                    parentContainer: "services-zone",
                    size: { width: 180, height: 80 },
                    style: {
                        backgroundColor: "#E2E8F0",
                        borderColor: "#6B7280",
                        textColor: "#374151"
                    },
                    icon: "👤",
                    description: "Manages user authentication, profiles, and permissions",
                    technicalDetails: {
                        protocol: ["gRPC", "HTTP/2"],
                        security: {
                            authentication: ["JWT"],
                            authorization: ["RBAC"],
                            encryption: ["TLS-1.3"]
                        },
                        performance: {
                            throughput: "5000 RPS",
                            latency: "< 200ms",
                            availability: "99.9%"
                        },
                        scaling: {
                            horizontal: true,
                            autoScaling: true,
                            maxInstances: 10
                        }
                    }
                }
            ];
        }

        if (schema.properties.connections) {
            schema.properties.connections.example = [
                {
                    id: "api-gateway-to-user-service",
                    source: "api-gateway",
                    target: "user-service",
                    type: "smart-orthogonal",
                    label: "gRPC (Load Balanced, Circuit Breaker)",
                    animated: false,
                    style: { stroke: "#6B7280", strokeWidth: 2 },
                    markerEnd: { type: "arrowclosed" },
                    description: "Authentication and user management requests",
                    technicalDetails: {
                        protocol: "gRPC",
                        dataFlow: "request-response",
                        security: {
                            encryption: "TLS-1.3",
                            authentication: "mTLS"
                        },
                        performance: {
                            throughput: "3000 RPS",
                            latency: "< 100ms"
                        },
                        reliability: {
                            retryStrategy: "exponential-backoff",
                            timeout: "5s",
                            circuitBreaker: true
                        }
                    }
                }
            ];
        }
    }

    async formatSchema(schema, outputFormat) {
        switch (outputFormat) {
            case 'json-schema':
                return schema;

            case 'openai-function':
                return {
                    name: 'generate_architecture_diagram',
                    description: 'Generate a comprehensive architecture diagram with detailed technical specifications',
                    parameters: schema
                };

            case 'anthropic-tool':
                return {
                    name: 'generate_architecture_diagram',
                    description: 'Generate a comprehensive architecture diagram with detailed technical specifications',
                    input_schema: schema
                };

            case 'json-rpc':
                return {
                    jsonrpc: '2.0',
                    method: 'generate_architecture_diagram',
                    params: {
                        type: 'object',
                        properties: {
                            diagram_request: schema
                        },
                        required: ['diagram_request']
                    },
                    id: 'architecture-diagram-generator'
                };

            default:
                return schema;
        }
    }

    generateUsageInstructions(outputFormat, schemaType) {
        const baseInstructions = {
            purpose: "Use this schema to generate structured architecture diagrams that can be directly loaded into the Graphing tool",
            steps: [
                "1. Analyze the user's requirements and architecture needs",
                "2. Choose appropriate components, containers, and connections",
                "3. Include comprehensive technical details for all elements",
                "4. Follow the schema structure exactly for compatibility",
                "5. Use the provided enums for icons, types, and other constrained values",
                "6. Ensure all references (parentContainer, source, target) are valid"
            ],
            tips: [
                "Use descriptive labels that include technical details",
                "Position nodes logically for good visual flow",
                "Include containers to group related components",
                "Use smart-orthogonal edge types for cleaner routing",
                "Add technical details to enhance diagram value",
                "Follow color scheme guidelines for professional appearance"
            ]
        };

        const formatSpecific = {
            'openai-function': {
                usage: "Call this function when the user requests an architecture diagram. The function will return a complete diagram specification.",
                example: `functions.generate_architecture_diagram({
  template: "microservices",
  scale: "medium", 
  requirements: "e-commerce platform with user management and payments"
})`
            },
            'anthropic-tool': {
                usage: "Use this tool to generate architecture diagrams. Provide the diagram requirements and get a structured response.",
                example: `<tool_use>
<tool_name>generate_architecture_diagram</tool_name>
<parameters>
{
  "template": "serverless",
  "scale": "large",
  "domain": "data-processing"
}
</parameters>
</tool_use>`
            },
            'json-rpc': {
                usage: "Send JSON-RPC requests to generate architecture diagrams with structured responses.",
                example: `{
  "jsonrpc": "2.0",
  "method": "generate_architecture_diagram",
  "params": {
    "diagram_request": {
      "template": "microservices",
      "requirements": "high-availability system"
    }
  },
  "id": 1
}`
            }
        };

        return {
            ...baseInstructions,
            ...formatSpecific[outputFormat]
        };
    }

    async generateExamples(schemaType, templateType) {
        const examples = {
            minimal_microservices: {
                metadata: {
                    name: "Simple Microservices API",
                    description: "Basic microservices setup with gateway and database",
                    version: "1.0.0",
                    author: "Example Generator",
                    created: new Date().toISOString()
                },
                nodes: [
                    {
                        id: "api-gateway",
                        type: "api",
                        label: "API Gateway",
                        position: { x: 0, y: 0 },
                        description: "Main entry point for all requests"
                    },
                    {
                        id: "user-service",
                        type: "service",
                        label: "User Service",
                        position: { x: 200, y: 100 },
                        description: "Handles user management"
                    },
                    {
                        id: "database",
                        type: "database",
                        label: "PostgreSQL",
                        position: { x: 200, y: 200 },
                        description: "Primary data storage"
                    }
                ],
                connections: [
                    {
                        id: "gateway-to-service",
                        source: "api-gateway",
                        target: "user-service",
                        type: "smart-orthogonal",
                        label: "HTTP API",
                        description: "Route requests to user service"
                    },
                    {
                        id: "service-to-db",
                        source: "user-service",
                        target: "database",
                        type: "smart-orthogonal",
                        label: "SQL",
                        description: "Database queries"
                    }
                ]
            }
        };

        const exampleKey = `${schemaType}_${templateType}` || 'minimal_microservices';
        return examples[exampleKey] || examples.minimal_microservices;
    }

    getFallbackSchema() {
        return {
            type: 'object',
            properties: {
                metadata: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        version: { type: 'string' }
                    },
                    required: ['name', 'description', 'version']
                },
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            type: { type: 'string' },
                            label: { type: 'string' },
                            position: {
                                type: 'object',
                                properties: {
                                    x: { type: 'number' },
                                    y: { type: 'number' }
                                }
                            }
                        },
                        required: ['id', 'type', 'label', 'position']
                    }
                },
                connections: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            source: { type: 'string' },
                            target: { type: 'string' },
                            type: { type: 'string' }
                        },
                        required: ['id', 'source', 'target', 'type']
                    }
                }
            },
            required: ['metadata', 'nodes']
        };
    }
}