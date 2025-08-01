import { ServiceFactory } from '../services/ServiceFactory.js';

/**
 * Example demonstrating the new service layer architecture
 */
export class ServiceLayerExample {
    constructor() {
        this.factory = null;
    }

    /**
     * Initialize the example
     */
    async initialize() {
        console.log('Initializing Service Layer Example...');
        
        // Create and initialize the service factory
        this.factory = ServiceFactory.create();
        await this.factory.initialize();
        
        console.log('Service Layer Example initialized successfully');
        console.log('Available services:', this.factory.getAvailableServices());
        console.log('Available plugins:', this.factory.getAvailablePlugins());
    }

    /**
     * Example: Create a simple diagram
     */
    async createSimpleDiagram() {
        console.log('\n--- Creating Simple Diagram ---');
        
        const diagramData = {
            containers: [
                {
                    id: 'container-1',
                    label: 'Frontend Layer',
                    position: { x: 100, y: 100 },
                    size: { width: 300, height: 200 },
                    color: '#E3F2FD',
                    borderColor: '#2196F3'
                }
            ],
            nodes: [
                {
                    id: 'node-1',
                    label: 'React App',
                    type: 'component',
                    position: { x: 120, y: 150 },
                    parentContainer: 'container-1',
                    color: '#E8F5E8',
                    borderColor: '#4CAF50'
                },
                {
                    id: 'node-2',
                    label: 'API Gateway',
                    type: 'component',
                    position: { x: 450, y: 100 },
                    color: '#FFF3E0',
                    borderColor: '#FF9800'
                }
            ],
            connections: [
                {
                    id: 'conn-1',
                    source: 'node-1',
                    target: 'node-2',
                    label: 'HTTP/2 <50ms',
                    type: 'adjustable'
                }
            ]
        };

        try {
            const result = await this.factory.createDiagram(diagramData, {
                autoLayout: true,
                includeTechnicalDetails: true
            });

            console.log('Diagram created successfully:', result.success);
            if (result.success) {
                console.log('Diagram metadata:', result.metadata);
            }

            return result;
        } catch (error) {
            console.error('Failed to create diagram:', error);
            throw error;
        }
    }

    /**
     * Example: Export diagram to different formats
     */
    async exportDiagramExample(diagramData) {
        console.log('\n--- Exporting Diagram ---');
        
        const formats = ['json', 'png', 'svg', 'drawio'];
        
        for (const format of formats) {
            try {
                console.log(`Exporting to ${format.toUpperCase()}...`);
                
                const result = await this.factory.exportDiagram(diagramData, format, {
                    filename: `example-diagram.${format}`,
                    includeMetadata: true
                });

                console.log(`${format.toUpperCase()} export:`, result.success ? 'SUCCESS' : 'FAILED');
                if (!result.success) {
                    console.log('Error:', result.error);
                }
            } catch (error) {
                console.error(`Failed to export to ${format}:`, error);
            }
        }
    }

    /**
     * Example: Apply different layout algorithms
     */
    async layoutExample(diagramData) {
        console.log('\n--- Layout Examples ---');
        
        const algorithms = ['default', 'hierarchical', 'circular', 'grid'];
        
        for (const algorithm of algorithms) {
            try {
                console.log(`Applying ${algorithm} layout...`);
                
                const result = await this.factory.layoutDiagram(diagramData, {
                    algorithm: algorithm,
                    spacing: 100
                });

                console.log(`${algorithm} layout applied successfully`);
                console.log(`Nodes positioned: ${result.nodes.length}`);
            } catch (error) {
                console.error(`Failed to apply ${algorithm} layout:`, error);
            }
        }
    }

    /**
     * Example: Validate diagram data
     */
    async validationExample(diagramData) {
        console.log('\n--- Validation Example ---');
        
        try {
            const result = await this.factory.validateDiagram(diagramData);
            console.log('Validation result:', result);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }

    /**
     * Example: Enrich diagram with technical details
     */
    async technicalDetailsExample(diagramData) {
        console.log('\n--- Technical Details Example ---');
        
        try {
            const enriched = await this.factory.enrichDiagramWithTechnicalDetails(diagramData);
            console.log('Diagram enriched with technical details');
            console.log('Enriched nodes:', enriched.nodes.length);
            console.log('Enriched connections:', enriched.connections.length);
            
            return enriched;
        } catch (error) {
            console.error('Failed to enrich diagram:', error);
            throw error;
        }
    }

    /**
     * Example: Plugin system usage
     */
    pluginExample() {
        console.log('\n--- Plugin System Example ---');
        
        // Get node types plugin
        const nodeTypesPlugin = this.factory.getPlugin('nodeTypes');
        console.log('Available node types:', nodeTypesPlugin.getAllNodeTypes().map(t => t.name));
        console.log('Node type categories:', nodeTypesPlugin.getAvailableCategories());
        
        // Get export formats plugin
        const exportFormatsPlugin = this.factory.getPlugin('exportFormats');
        console.log('Available export formats:', exportFormatsPlugin.getAllFormats().map(f => f.name));
        console.log('Format categories:', exportFormatsPlugin.getAvailableCategories());
    }

    /**
     * Example: Configuration system usage
     */
    configurationExample() {
        console.log('\n--- Configuration System Example ---');
        
        const config = this.factory.getConfig();
        
        // Get specific configuration
        const diagramConfig = config.getFeatureConfig('diagram');
        console.log('Diagram configuration:', diagramConfig);
        
        // Check if features are enabled
        console.log('Technical details enabled:', config.isFeatureEnabled('technicalDetails'));
        console.log('Auto-layout enabled:', config.getConfig('diagram').autoLayout);
        
        // Get configuration statistics
        const stats = config.getConfigStats();
        console.log('Configuration statistics:', stats);
    }

    /**
     * Run all examples
     */
    async runAllExamples() {
        console.log('🚀 Starting Service Layer Examples\n');
        
        try {
            // Initialize
            await this.initialize();
            
            // Create a simple diagram
            const diagramResult = await this.createSimpleDiagram();
            if (!diagramResult.success) {
                console.error('Failed to create diagram, stopping examples');
                return;
            }
            
            const diagramData = diagramResult.diagram;
            
            // Export examples
            await this.exportDiagramExample(diagramData);
            
            // Layout examples
            await this.layoutExample(diagramData);
            
            // Validation example
            await this.validationExample(diagramData);
            
            // Technical details example
            await this.technicalDetailsExample(diagramData);
            
            // Plugin system example
            this.pluginExample();
            
            // Configuration system example
            this.configurationExample();
            
            // Show factory statistics
            console.log('\n--- Factory Statistics ---');
            const stats = this.factory.getFactoryStats();
            console.log('Factory stats:', stats);
            
            console.log('\n✅ All examples completed successfully!');
            
        } catch (error) {
            console.error('❌ Example failed:', error);
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.factory) {
            this.factory.reset();
        }
        console.log('Service Layer Example cleaned up');
    }
}

// Example usage
if (typeof window !== 'undefined') {
    // Browser environment
    window.ServiceLayerExample = ServiceLayerExample;
} else {
    // Node.js environment
    module.exports = ServiceLayerExample;
} 