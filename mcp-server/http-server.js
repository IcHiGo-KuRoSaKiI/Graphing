#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { CreateDiagramTool } from './src/tools/CreateDiagramTool.js';
import { ExportDiagramTool } from './src/tools/ExportDiagramTool.js';
import { AutoLayoutTool } from './src/tools/AutoLayoutTool.js';
import { TechnicalDetailsTool } from './src/tools/TechnicalDetailsTool.js';
import { SessionManager } from './src/session/SessionManager.js';

/**
 * HTTP Server for MCP Tools
 * Provides REST API endpoints for testing and integration
 */
class HTTPServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3003;
        this.sessionManager = new SessionManager();
        this.tools = new Map();
        this.initializeTools();
        this.setupMiddleware();
        this.setupRoutes();
    }

    initializeTools() {
        this.tools.set('create_architecture_diagram', new CreateDiagramTool());
        this.tools.set('export_diagram', new ExportDiagramTool());
        this.tools.set('auto_layout_diagram', new AutoLayoutTool());
        this.tools.set('add_technical_details', new TechnicalDetailsTool());
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                server: 'Graphing MCP HTTP Server',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
        });

        // List available tools
        this.app.get('/tools', (req, res) => {
            const tools = [];
            for (const [name, tool] of this.tools) {
                tools.push({
                    name,
                    description: tool.getDescription(),
                    inputSchema: tool.getInputSchema()
                });
            }
            res.json({ tools });
        });

        // Execute tool
        this.app.post('/tools/:toolName', async (req, res) => {
            try {
                const { toolName } = req.params;
                const { sessionId, ...args } = req.body;

                if (!this.tools.has(toolName)) {
                    return res.status(404).json({
                        error: `Unknown tool: ${toolName}`,
                        availableTools: Array.from(this.tools.keys())
                    });
                }

                const tool = this.tools.get(toolName);
                const session = await this.sessionManager.getOrCreateSession(sessionId);
                const result = await tool.execute(args, session);

                res.json(result);
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Create diagram endpoint
        this.app.post('/create-diagram', async (req, res) => {
            try {
                const { description, template, options, sessionId } = req.body;
                const tool = this.tools.get('create_architecture_diagram');
                const session = await this.sessionManager.getOrCreateSession(sessionId);
                
                const result = await tool.execute({
                    description,
                    template,
                    options
                }, session);

                res.json(result);
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Export diagram endpoint
        this.app.post('/export-diagram', async (req, res) => {
            try {
                const { diagram, format, options, sessionId } = req.body;
                const tool = this.tools.get('export_diagram');
                const session = await this.sessionManager.getOrCreateSession(sessionId);
                
                const result = await tool.execute({
                    diagram,
                    format,
                    options
                }, session);

                res.json(result);
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Auto layout endpoint
        this.app.post('/auto-layout', async (req, res) => {
            try {
                const { diagram, algorithm, options, sessionId } = req.body;
                const tool = this.tools.get('auto_layout_diagram');
                const session = await this.sessionManager.getOrCreateSession(sessionId);
                
                const result = await tool.execute({
                    diagram,
                    algorithm,
                    options
                }, session);

                res.json(result);
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Add technical details endpoint
        this.app.post('/add-technical-details', async (req, res) => {
            try {
                const { diagram, technicalSpecs, options, sessionId } = req.body;
                const tool = this.tools.get('add_technical_details');
                const session = await this.sessionManager.getOrCreateSession(sessionId);
                
                const result = await tool.execute({
                    diagram,
                    technicalSpecs,
                    options
                }, session);

                res.json(result);
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Session management
        this.app.get('/sessions', (req, res) => {
            const sessions = this.sessionManager.listSessions();
            res.json({ sessions });
        });

        this.app.get('/sessions/:sessionId', (req, res) => {
            const { sessionId } = req.params;
            const session = this.sessionManager.getSession(sessionId);
            if (session) {
                res.json(session);
            } else {
                res.status(404).json({ error: 'Session not found' });
            }
        });

        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Graphing MCP HTTP Server running on http://localhost:${this.port}`);
            console.log(`📋 Available endpoints:`);
            console.log(`   GET  /health - Health check`);
            console.log(`   GET  /tools - List available tools`);
            console.log(`   POST /tools/:toolName - Execute any tool`);
            console.log(`   POST /create-diagram - Create architecture diagram`);
            console.log(`   POST /export-diagram - Export diagram`);
            console.log(`   POST /auto-layout - Apply auto layout`);
            console.log(`   POST /add-technical-details - Add technical details`);
            console.log(`   GET  /sessions - List sessions`);
            console.log(`   GET  /sessions/:sessionId - Get session`);
            console.log(`\n🎯 Ready to receive requests!`);
        });
    }
}

// Start the server
const server = new HTTPServer();
server.start(); 