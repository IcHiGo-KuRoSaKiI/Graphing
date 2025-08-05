#!/usr/bin/env node

import { CreateDiagramTool } from './src/tools/CreateDiagramTool.js';

async function testToolDirect() {
    console.log('=== Testing CreateDiagramTool Directly ===');
    
    const tool = new CreateDiagramTool();
    
    try {
        const result = await tool.execute({
            description: "Create a microservices architecture with user service, product service, PostgreSQL database, load balancer, and API gateway. Include authentication service and monitoring.",
            template: "microservices",
            options: {
                includeTechnicalDetails: true,
                autoLayout: true,
                style: "modern"
            }
        }, { id: 'test-session' });
        
        console.log('Tool result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testToolDirect(); 