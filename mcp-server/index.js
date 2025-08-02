#!/usr/bin/env node

import { GraphingMCPServer } from './src/GraphingMCPServer.js';

/**
 * Main entry point for the Graphing MCP Server
 */
async function main() {
    try {
        console.log('Starting Graphing MCP Server...');
        
        const server = new GraphingMCPServer();
        await server.start();
        
        console.log('Graphing MCP Server is running');
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\nShutting down Graphing MCP Server...');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\nShutting down Graphing MCP Server...');
            await server.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Failed to start Graphing MCP Server:', error);
        process.exit(1);
    }
}

// Start the server
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 