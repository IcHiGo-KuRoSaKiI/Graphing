/**
 * Base Tool Class
 * Provides common functionality for all MCP tools
 */
export class BaseTool {
    constructor() {
        this.name = 'base_tool';
        this.description = 'Base tool for MCP integration';
    }

    /**
     * Execute the tool with given arguments
     * @param {Object} args - Tool arguments
     * @param {Object} session - Session object
     * @returns {Promise<Object>} Tool execution result
     */
    async execute(args, session) {
        throw new Error('execute method must be implemented by subclass');
    }

    /**
     * Get tool description
     * @returns {string} Tool description
     */
    getDescription() {
        return this.description;
    }

    /**
     * Get input schema for the tool
     * @returns {Object} JSON schema for tool input
     */
    getInputSchema() {
        return {
            type: 'object',
            properties: {},
            required: []
        };
    }

    /**
     * Validate input arguments
     * @param {Object} args - Tool arguments
     * @param {Object} schema - Validation schema
     * @returns {boolean} Validation result
     */
    validateInput(args, schema) {
        // Simple validation - in production, use a proper JSON schema validator
        if (!args || typeof args !== 'object') {
            throw new Error('Invalid arguments: must be an object');
        }

        if (schema.required) {
            for (const required of schema.required) {
                if (!(required in args)) {
                    throw new Error(`Missing required argument: ${required}`);
                }
            }
        }

        return true;
    }

    /**
     * Create success response
     * @param {Object} data - Response data
     * @param {string} message - Success message
     * @returns {Object} Success response
     */
    createSuccessResponse(data, message = 'Operation completed successfully') {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create error response
     * @param {string} error - Error message
     * @param {Object} details - Error details
     * @returns {Object} Error response
     */
    createErrorResponse(error, details = {}) {
        return {
            success: false,
            error,
            details,
            timestamp: new Date().toISOString()
        };
    }
} 