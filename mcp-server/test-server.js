#!/usr/bin/env node

import { CreateDiagramTool } from './src/tools/CreateDiagramTool.js';
import { ExportDiagramTool } from './src/tools/ExportDiagramTool.js';
import { AutoLayoutTool } from './src/tools/AutoLayoutTool.js';
import { TechnicalDetailsTool } from './src/tools/TechnicalDetailsTool.js';
import { SessionManager } from './src/session/SessionManager.js';

/**
 * Simple test server for MCP tools
 */
class TestServer {
    constructor() {
        this.sessionManager = new SessionManager();
        this.tools = new Map();
        this.initializeTools();
    }

    initializeTools() {
        this.tools.set('create_architecture_diagram', new CreateDiagramTool());
        this.tools.set('export_diagram', new ExportDiagramTool());
        this.tools.set('auto_layout_diagram', new AutoLayoutTool());
        this.tools.set('add_technical_details', new TechnicalDetailsTool());
    }

    async testTool(toolName, args) {
        try {
            const tool = this.tools.get(toolName);
            if (!tool) {
                throw new Error(`Unknown tool: ${toolName}`);
            }

            const session = await this.sessionManager.getOrCreateSession('test-session');
            const result = await tool.execute(args, session);
            
            console.log(`✅ ${toolName} executed successfully:`);
            console.log(JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error(`❌ Error executing ${toolName}:`, error.message);
            throw error;
        }
    }

    async runTests() {
        console.log('🧪 Testing MCP Tools...\n');

        // Test 1: Create diagram
        console.log('1. Testing create_architecture_diagram...');
        await this.testTool('create_architecture_diagram', {
            description: 'Create a simple microservices architecture with user service and database',
            template: 'microservices',
            options: {
                includeTechnicalDetails: true,
                autoLayout: true,
                style: 'modern'
            }
        });

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: List available tools
        console.log('2. Available tools:');
        for (const [name, tool] of this.tools) {
            console.log(`   - ${name}: ${tool.getDescription()}`);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Export diagram
        console.log('3. Testing export_diagram...');
        const testDiagram = {
            containers: [
                {
                    id: 'container1',
                    label: 'User Service',
                    position: { x: 100, y: 100 },
                    size: { width: 200, height: 100 }
                }
            ],
            nodes: [
                {
                    id: 'node1',
                    label: 'User API',
                    position: { x: 120, y: 120 },
                    parentContainer: 'container1'
                }
            ],
            connections: []
        };

        await this.testTool('export_diagram', {
            diagram: testDiagram,
            format: 'json',
            options: {
                filename: 'test-diagram.json',
                includeMetadata: true
            }
        });

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Auto layout
        console.log('4. Testing auto_layout_diagram...');
        await this.testTool('auto_layout_diagram', {
            diagram: testDiagram,
            algorithm: 'hierarchical',
            options: {
                direction: 'TB',
                spacing: 50,
                padding: 20
            }
        });

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 5: Technical details
        console.log('5. Testing add_technical_details...');
        await this.testTool('add_technical_details', {
            diagram: testDiagram,
            technicalSpecs: {
                performance: { responseTime: '<100ms' },
                security: { authentication: 'OAuth2' }
            },
            options: {
                includePerformance: true,
                includeSecurity: true,
                colorCode: true
            }
        });

        console.log('\n🎉 All tests completed successfully!');
    }
}

// Run tests
async function main() {
    try {
        const testServer = new TestServer();
        await testServer.runTests();
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 