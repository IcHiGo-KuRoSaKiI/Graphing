#!/usr/bin/env node

import { DescriptionParser } from './src/parsers/DescriptionParser.js';
import { ComponentGenerator } from './src/generators/ComponentGenerator.js';

async function testParser() {
    console.log('=== Testing Description Parser ===');
    
    const description = "Create a microservices architecture with user service, product service, PostgreSQL database, load balancer, and API gateway. Include authentication service and monitoring.";
    
    try {
        const parser = new DescriptionParser();
        console.log('Parsing description:', description);
        
        const components = await parser.parse(description);
        console.log('Parsed components:', JSON.stringify(components, null, 2));
        
        const generator = new ComponentGenerator();
        const diagram = await generator.generateFromComponents(components, {
            template: 'microservices',
            style: 'modern',
            includeTechnicalDetails: true
        });
        
        console.log('Generated diagram:', JSON.stringify(diagram, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testParser(); 