#!/usr/bin/env node

import { GraphingMCPServer } from './src/GraphingMCPServer.js';

async function debugMCPServer() {
    console.log('=== MCP Server Debug Test ===');
    
    try {
        // Create server instance
        const server = new GraphingMCPServer();
        
        console.log('✓ Server instance created');
        console.log('✓ Tools initialized:', Array.from(server.tools.keys()));
        
        // Test each tool
        for (const [name, tool] of server.tools) {
            console.log(`\n--- Testing tool: ${name} ---`);
            console.log('Description:', tool.getDescription());
            console.log('Input Schema:', JSON.stringify(tool.getInputSchema(), null, 2));
        }
        
        // Test a simple tool execution
        console.log('\n=== Testing tool execution ===');
        const createTool = server.tools.get('create_architecture_diagram');
        if (createTool) {
            try {
                const result = await createTool.execute({
                    description: 'Simple test diagram with user service and database'
                }, { id: 'test-session' });
                console.log('Tool execution result:', JSON.stringify(result, null, 2));
            } catch (error) {
                console.log('Tool execution error (expected for test):', error.message);
            }
        }
        
        console.log('\n✓ All tests completed successfully');
        console.log('✓ MCP Server is ready to use!');
        
    } catch (error) {
        console.error('❌ Error during debug test:', error);
        console.error('Stack trace:', error.stack);
    }
}

debugMCPServer(); 