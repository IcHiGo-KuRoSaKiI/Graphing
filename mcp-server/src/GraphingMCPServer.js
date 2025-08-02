import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CreateDiagramTool } from './tools/CreateDiagramTool.js';
import { ExportDiagramTool } from './tools/ExportDiagramTool.js';
import { AutoLayoutTool } from './tools/AutoLayoutTool.js';
import { TechnicalDetailsTool } from './tools/TechnicalDetailsTool.js';
import { SessionManager } from './session/SessionManager.js';

/**
 * Graphing MCP Server
 * Implements the Model Context Protocol for AI agent communication
 */
export class GraphingMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'graphing-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.sessionManager = new SessionManager();
        this.tools = new Map();
        this.initializeTools();
        this.setupToolHandlers();
    }

    /**
     * Initialize all MCP tools
     */
    initializeTools() {
        this.tools.set('create_architecture_diagram', new CreateDiagramTool());
        this.tools.set('export_diagram', new ExportDiagramTool());
        this.tools.set('auto_layout_diagram', new AutoLayoutTool());
        this.tools.set('add_technical_details', new TechnicalDetailsTool());
    }

    /**
     * Setup tool handlers for MCP protocol
     */
    setupToolHandlers() {
        // Handle tool calls
        this.server.setRequestHandler('tools/call', async (params) => {
            const { name, arguments: args } = params;
            
            if (!this.tools.has(name)) {
                throw new Error(`Unknown tool: ${name}`);
            }

            try {
                const tool = this.tools.get(name);
                const session = await this.sessionManager.getOrCreateSession(args?.sessionId);
                const result = await tool.execute(args, session);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });

        // List available tools
        this.server.setRequestHandler('tools/list', async () => {
            const tools = [];
            for (const [name, tool] of this.tools) {
                tools.push({
                    name,
                    description: tool.getDescription(),
                    inputSchema: tool.getInputSchema(),
                });
            }
            return { tools };
        });
    }

    /**
     * Start the MCP server
     */
    async start() {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.log('Graphing MCP Server started successfully');
        } catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    }

    /**
     * Stop the MCP server
     */
    async stop() {
        try {
            await this.sessionManager.cleanup();
            console.log('Graphing MCP Server stopped');
        } catch (error) {
            console.error('Error stopping MCP server:', error);
        }
    }
} 