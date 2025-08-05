import { BaseTool } from './BaseTool.js';
import { DescriptionParser } from '../parsers/DescriptionParser.js';
import { ComponentGenerator } from '../generators/ComponentGenerator.js';
import { AutoLayoutTool } from './AutoLayoutTool.js';

/**
 * Create Architecture Diagram Tool
 * Allows agents to create architecture diagrams from descriptions or JSON data
 */
export class CreateDiagramTool extends BaseTool {
    constructor() {
        super();
        this.name = 'create_architecture_diagram';
        this.description = 'Create an architecture diagram from natural language description or JSON data';
        this.descriptionParser = new DescriptionParser();
        this.componentGenerator = new ComponentGenerator();
    }

    /**
     * Get input schema for the tool
     * @returns {Object} JSON schema for tool input
     */
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    description: 'Natural language description of the architecture'
                },
                jsonData: {
                    type: 'object',
                    description: 'Pre-defined JSON data for the diagram'
                },
                template: {
                    type: 'string',
                    description: 'Template to use (microservices, monolith, serverless, etc.)'
                },
                options: {
                    type: 'object',
                    description: 'Additional options for diagram creation',
                    properties: {
                        includeTechnicalDetails: {
                            type: 'boolean',
                            description: 'Include technical specifications in nodes'
                        },
                        autoLayout: {
                            type: 'boolean',
                            description: 'Automatically layout the diagram'
                        },
                        style: {
                            type: 'string',
                            description: 'Visual style (modern, classic, minimal)'
                        }
                    }
                }
            },
            required: []
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

            const { description, jsonData, template, options = {} } = args;
            const {
                includeTechnicalDetails = true,
                autoLayout = true,
                style = 'modern'
            } = options;

            let diagramData;

            // Create diagram from description or JSON data
            if (description) {
                // Parse natural language description
                const parser = new DescriptionParser();
                const components = await parser.parse(description);
                
                // Generate diagram from components
                const generator = new ComponentGenerator();
                diagramData = await generator.generateFromComponents(components, {
                    template,
                    style,
                    includeTechnicalDetails
                });
            } else if (jsonData) {
                // Use provided JSON data
                diagramData = jsonData;
            } else {
                throw new Error('Either description or jsonData must be provided');
            }

            // Apply auto-layout if requested
            if (autoLayout && diagramData) {
                const layoutTool = new AutoLayoutTool();
                const layoutResult = await layoutTool.execute({
                    diagram: diagramData,
                    algorithm: 'hierarchical',
                    options: { direction: 'TB' }
                }, session);
                
                // Extract the diagram data from the layout result
                if (layoutResult.success && layoutResult.data) {
                    diagramData = layoutResult.data.diagram;
                }
            }

            // Store diagram in session
            if (session && session.setDiagram) {
                session.setDiagram(diagramData);
            }

            return diagramData;

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    /**
     * Validate and process JSON data
     * @param {Object} jsonData - JSON data to validate
     * @returns {Object} Validated diagram data
     */
    validateAndProcessJsonData(jsonData) {
        // Basic validation
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Invalid JSON data: must be an object');
        }

        // Ensure required fields exist
        const requiredFields = ['containers', 'nodes', 'connections'];
        for (const field of requiredFields) {
            if (!jsonData[field] || !Array.isArray(jsonData[field])) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Add metadata if not present
        if (!jsonData.metadata) {
            jsonData.metadata = {
                name: 'Architecture Diagram',
                description: 'Created via MCP tool',
                version: '1.0',
                createdDate: new Date().toISOString(),
                createdBy: 'MCP Agent'
            };
        }

        return jsonData;
    }

    /**
     * Apply auto-layout to diagram
     * @param {Object} diagramData - Diagram data
     * @returns {Promise<Object>} Diagram data with layout applied
     */
    async applyAutoLayout(diagramData) {
        // This would integrate with the LayoutService from the main application
        // For now, we'll return the data as-is
        // In a full implementation, this would call the LayoutService
        return diagramData;
    }
} 