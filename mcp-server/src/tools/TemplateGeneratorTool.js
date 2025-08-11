import { BaseTool } from './BaseTool.js';

/**
 * Template Generator Tool
 * Generates pre-configured architecture diagram templates
 */
export class TemplateGeneratorTool extends BaseTool {
    constructor() {
        super();
        this.name = 'generate_template';
        this.description = 'Generate pre-configured architecture diagram templates for common patterns';
    }

    getInputSchema() {
        return {
            type: 'object',
            properties: {
                template: {
                    type: 'string',
                    enum: [
                        'microservices',
                        'monolith',
                        'serverless',
                        'event-driven',
                        'layered',
                        'hexagonal',
                        'service-mesh',
                        'data-pipeline',
                        'ml-pipeline',
                        'e-commerce',
                        'social-media',
                        'iot',
                        'blockchain',
                        'gaming'
                    ],
                    description: 'Template type to generate'
                },
                scale: {
                    type: 'string',
                    enum: ['small', 'medium', 'large', 'enterprise'],
                    default: 'medium',
                    description: 'Template scale and complexity'
                },
                technology: {
                    type: 'string',
                    enum: ['cloud-native', 'traditional', 'hybrid', 'kubernetes', 'docker', 'aws', 'azure', 'gcp'],
                    default: 'cloud-native',
                    description: 'Technology preference'
                },
                includeDetails: {
                    type: 'boolean',
                    default: true,
                    description: 'Include technical details and specifications'
                },
                customization: {
                    type: 'object',
                    description: 'Template customization options',
                    properties: {
                        businessDomain: { type: 'string' },
                        primaryTechnology: { type: 'string' },
                        userLoad: { type: 'string', enum: ['low', 'medium', 'high', 'enterprise'] },
                        dataComplexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
                        securityLevel: { type: 'string', enum: ['basic', 'enhanced', 'enterprise'] }
                    }
                }
            },
            required: ['template']
        };
    }

    async execute(args, session) {
        try {
            this.validateInput(args, this.getInputSchema());
            
            const { 
                template, 
                scale = 'medium', 
                technology = 'cloud-native',
                includeDetails = true,
                customization = {}
            } = args;

            // Generate template based on type
            const templateData = await this.generateTemplate(template, scale, technology, includeDetails, customization);

            // Store template in session if available
            if (session && session.setDiagram) {
                session.setDiagram(templateData);
            }

            return this.createSuccessResponse(templateData, `Generated ${template} architecture template`);

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    async generateTemplate(template, scale, technology, includeDetails, customization) {
        const templateGenerators = {
            'microservices': () => this.generateMicroservicesTemplate(scale, technology, includeDetails, customization),
            'monolith': () => this.generateMonolithTemplate(scale, technology, includeDetails, customization),
            'serverless': () => this.generateServerlessTemplate(scale, technology, includeDetails, customization),
            'event-driven': () => this.generateEventDrivenTemplate(scale, technology, includeDetails, customization),
            'layered': () => this.generateLayeredTemplate(scale, technology, includeDetails, customization),
            'hexagonal': () => this.generateHexagonalTemplate(scale, technology, includeDetails, customization),
            'service-mesh': () => this.generateServiceMeshTemplate(scale, technology, includeDetails, customization),
            'data-pipeline': () => this.generateDataPipelineTemplate(scale, technology, includeDetails, customization),
            'ml-pipeline': () => this.generateMLPipelineTemplate(scale, technology, includeDetails, customization),
            'e-commerce': () => this.generateECommerceTemplate(scale, technology, includeDetails, customization),
            'social-media': () => this.generateSocialMediaTemplate(scale, technology, includeDetails, customization),
            'iot': () => this.generateIoTTemplate(scale, technology, includeDetails, customization),
            'blockchain': () => this.generateBlockchainTemplate(scale, technology, includeDetails, customization),
            'gaming': () => this.generateGamingTemplate(scale, technology, includeDetails, customization)
        };

        const generator = templateGenerators[template];
        if (!generator) {
            throw new Error(`Unknown template: ${template}`);
        }

        return generator();
    }

    generateMicroservicesTemplate(scale, technology, includeDetails, customization) {
        const complexity = this.getComplexityConfig(scale);
        const timestamp = new Date().toISOString();
        
        return {
            metadata: {
                name: `${customization.businessDomain || 'Generic'} Microservices Architecture`,
                description: 'Microservices architecture with service discovery, API gateway, and distributed data management',
                version: '1.0.0',
                author: 'Template Generator',
                created: timestamp,
                updated: timestamp,
                tags: ['microservices', 'distributed', 'scalable', 'cloud-native'],
                domain: 'microservices',
                technology_stack: [technology, 'docker', 'kubernetes'],
                complexity_level: scale,
                architecture_patterns: ['api-gateway', 'service-discovery', 'circuit-breaker', 'bulkhead'],
                quality_attributes: ['scalability', 'reliability', 'maintainability', 'observability']
            },
            viewport: { x: 0, y: 0, zoom: 1.0 },
            style: {
                theme: 'light',
                colorScheme: 'blue',
                gridSize: 20,
                snapToGrid: true,
                showGrid: true
            },
            containers: [
                {
                    id: 'frontend-zone',
                    type: 'container',
                    label: 'Frontend Zone',
                    position: { x: -400, y: -200 },
                    size: { width: 300, height: 150 },
                    style: {
                        backgroundColor: '#F8FAFC',
                        borderColor: '#E2E8F0',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    icon: '🖥️',
                    description: 'Client-facing applications and interfaces'
                },
                {
                    id: 'api-gateway-zone',
                    type: 'container',
                    label: 'API Gateway Zone',
                    position: { x: -50, y: -200 },
                    size: { width: 300, height: 150 },
                    style: {
                        backgroundColor: '#F0F9FF',
                        borderColor: '#CBD5E1',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    icon: '🚪',
                    description: 'API gateway and load balancing'
                },
                {
                    id: 'services-zone',
                    type: 'container',
                    label: 'Microservices Zone',
                    position: { x: -400, y: 100 },
                    size: { width: 800, height: 300 },
                    style: {
                        backgroundColor: '#F1F5F9',
                        borderColor: '#E2E8F0',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    icon: '🔧',
                    description: 'Core business microservices'
                },
                {
                    id: 'data-zone',
                    type: 'container',
                    label: 'Data Zone',
                    position: { x: -400, y: 450 },
                    size: { width: 800, height: 200 },
                    style: {
                        backgroundColor: '#FFFBEB',
                        borderColor: '#E2E8F0',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    icon: '🗄️',
                    description: 'Databases and data storage'
                }
            ],
            nodes: [
                // Frontend
                {
                    id: 'web-app',
                    type: 'component',
                    label: 'Web Application (React, SPA, OAuth2)',
                    position: { x: -300, y: -150 },
                    parentContainer: 'frontend-zone',
                    size: { width: 180, height: 80 },
                    style: {
                        backgroundColor: '#DBEAFE',
                        borderColor: '#6B7280',
                        textColor: '#374151'
                    },
                    icon: '⚛️',
                    description: 'Single-page web application built with React',
                    ...this.getTechnicalDetails(includeDetails, 'web-frontend')
                },
                // API Gateway
                {
                    id: 'api-gateway',
                    type: 'component',
                    label: 'API Gateway (HTTPS, Rate Limiting, JWT)',
                    position: { x: 100, y: -150 },
                    parentContainer: 'api-gateway-zone',
                    size: { width: 200, height: 80 },
                    style: {
                        backgroundColor: '#E2E8F0',
                        borderColor: '#6B7280',
                        textColor: '#374151'
                    },
                    icon: '🚪',
                    description: 'Central entry point for all client requests',
                    ...this.getTechnicalDetails(includeDetails, 'api-gateway')
                },
                // Core Services
                ...this.generateCoreServices(complexity, includeDetails),
                // Databases
                ...this.generateDatabases(complexity, includeDetails)
            ],
            connections: [
                {
                    id: 'web-to-gateway',
                    source: 'web-app',
                    target: 'api-gateway',
                    type: 'smart-orthogonal',
                    label: 'HTTPS (REST API, JWT)',
                    animated: true,
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Secure API calls with JWT authentication'
                },
                ...this.generateServiceConnections(complexity, includeDetails)
            ],
            layout: {
                algorithm: 'hierarchical',
                direction: 'TB',
                spacing: { nodeSpacing: 150, rankSpacing: 200, containerPadding: 40 },
                autoApply: true
            }
        };
    }

    generateMonolithTemplate(scale, technology, includeDetails, customization) {
        const timestamp = new Date().toISOString();
        
        return {
            metadata: {
                name: `${customization.businessDomain || 'Generic'} Monolithic Architecture`,
                description: 'Traditional monolithic architecture with layered design',
                version: '1.0.0',
                author: 'Template Generator',
                created: timestamp,
                updated: timestamp,
                tags: ['monolith', 'layered', 'traditional'],
                domain: 'monolith',
                technology_stack: [technology],
                complexity_level: scale,
                architecture_patterns: ['layered', 'mvc'],
                quality_attributes: ['simplicity', 'consistency', 'performance']
            },
            containers: [
                {
                    id: 'presentation-layer',
                    type: 'container',
                    label: 'Presentation Layer',
                    position: { x: -300, y: -200 },
                    size: { width: 600, height: 120 },
                    style: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
                    icon: '🖼️',
                    description: 'User interface and presentation logic'
                },
                {
                    id: 'business-layer',
                    type: 'container',
                    label: 'Business Logic Layer',
                    position: { x: -300, y: 0 },
                    size: { width: 600, height: 200 },
                    style: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
                    icon: '⚙️',
                    description: 'Core business logic and processing'
                },
                {
                    id: 'data-layer',
                    type: 'container',
                    label: 'Data Access Layer',
                    position: { x: -300, y: 250 },
                    size: { width: 600, height: 150 },
                    style: { backgroundColor: '#FFFBEB', borderColor: '#E2E8F0' },
                    icon: '🗃️',
                    description: 'Data access and persistence'
                }
            ],
            nodes: [
                {
                    id: 'web-ui',
                    type: 'component',
                    label: 'Web UI (MVC, Server-side Rendering)',
                    position: { x: -200, y: -150 },
                    parentContainer: 'presentation-layer',
                    size: { width: 200, height: 60 },
                    style: { backgroundColor: '#DBEAFE', borderColor: '#6B7280' },
                    icon: '🖥️',
                    description: 'Server-side rendered web interface',
                    ...this.getTechnicalDetails(includeDetails, 'monolith-ui')
                },
                {
                    id: 'api-controller',
                    type: 'component',
                    label: 'API Controller (REST, JSON)',
                    position: { x: 100, y: -150 },
                    parentContainer: 'presentation-layer',
                    size: { width: 180, height: 60 },
                    style: { backgroundColor: '#E2E8F0', borderColor: '#6B7280' },
                    icon: '📡',
                    description: 'RESTful API endpoints',
                    ...this.getTechnicalDetails(includeDetails, 'api-controller')
                },
                {
                    id: 'business-service',
                    type: 'component',
                    label: 'Business Services (Domain Logic, Transactions)',
                    position: { x: -100, y: 50 },
                    parentContainer: 'business-layer',
                    size: { width: 250, height: 80 },
                    style: { backgroundColor: '#E2E8F0', borderColor: '#6B7280' },
                    icon: '⚙️',
                    description: 'Core business logic implementation',
                    ...this.getTechnicalDetails(includeDetails, 'business-service')
                },
                {
                    id: 'data-access',
                    type: 'component',
                    label: 'Data Access (ORM, Connection Pool)',
                    position: { x: -200, y: 300 },
                    parentContainer: 'data-layer',
                    size: { width: 200, height: 60 },
                    style: { backgroundColor: '#FEF3C7', borderColor: '#6B7280' },
                    icon: '🔗',
                    description: 'Database access layer',
                    ...this.getTechnicalDetails(includeDetails, 'data-access')
                },
                {
                    id: 'database',
                    type: 'database',
                    label: 'Database (SQL, ACID)',
                    position: { x: 100, y: 300 },
                    parentContainer: 'data-layer',
                    size: { width: 160, height: 60 },
                    style: { backgroundColor: '#FED7AA', borderColor: '#6B7280' },
                    icon: '🗄️',
                    description: 'Primary application database',
                    ...this.getTechnicalDetails(includeDetails, 'sql-database')
                }
            ],
            connections: [
                {
                    id: 'ui-to-business',
                    source: 'web-ui',
                    target: 'business-service',
                    type: 'straight',
                    label: 'Method Calls (Sync, Local)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Direct method invocations'
                },
                {
                    id: 'api-to-business',
                    source: 'api-controller',
                    target: 'business-service',
                    type: 'straight',
                    label: 'Service Calls (JSON, Validation)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'API request processing'
                },
                {
                    id: 'business-to-data',
                    source: 'business-service',
                    target: 'data-access',
                    type: 'straight',
                    label: 'Repository Pattern (ORM)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Data access through repository pattern'
                },
                {
                    id: 'data-to-db',
                    source: 'data-access',
                    target: 'database',
                    type: 'straight',
                    label: 'SQL (Connection Pool, Transactions)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Database queries and transactions'
                }
            ]
        };
    }

    generateServerlessTemplate(scale, technology, includeDetails, customization) {
        const timestamp = new Date().toISOString();
        
        return {
            metadata: {
                name: `${customization.businessDomain || 'Generic'} Serverless Architecture`,
                description: 'Event-driven serverless architecture with functions and managed services',
                version: '1.0.0',
                author: 'Template Generator',
                created: timestamp,
                updated: timestamp,
                tags: ['serverless', 'event-driven', 'functions', 'cloud'],
                domain: 'serverless',
                technology_stack: [technology, 'aws-lambda', 'api-gateway'],
                complexity_level: scale,
                architecture_patterns: ['event-sourcing', 'cqrs', 'lambda'],
                quality_attributes: ['scalability', 'cost-efficiency', 'elasticity']
            },
            containers: [
                {
                    id: 'api-layer',
                    type: 'container',
                    label: 'API Gateway Layer',
                    position: { x: -400, y: -100 },
                    size: { width: 800, height: 120 },
                    style: { backgroundColor: '#F0F9FF', borderColor: '#CBD5E1' },
                    icon: '🚪',
                    description: 'Managed API gateway services'
                },
                {
                    id: 'compute-layer',
                    type: 'container',
                    label: 'Serverless Functions',
                    position: { x: -400, y: 100 },
                    size: { width: 800, height: 200 },
                    style: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
                    icon: '⚡',
                    description: 'Event-driven serverless functions'
                },
                {
                    id: 'storage-layer',
                    type: 'container',
                    label: 'Managed Storage',
                    position: { x: -400, y: 350 },
                    size: { width: 800, height: 150 },
                    style: { backgroundColor: '#FFFBEB', borderColor: '#E2E8F0' },
                    icon: '☁️',
                    description: 'Cloud-managed storage services'
                }
            ],
            nodes: [
                {
                    id: 'api-gateway',
                    type: 'component',
                    label: 'API Gateway (REST, WebSocket, Throttling)',
                    position: { x: 0, y: -50 },
                    parentContainer: 'api-layer',
                    size: { width: 250, height: 60 },
                    style: { backgroundColor: '#DBEAFE', borderColor: '#6B7280' },
                    icon: '🚪',
                    description: 'Managed API gateway with built-in features',
                    ...this.getTechnicalDetails(includeDetails, 'serverless-gateway')
                },
                {
                    id: 'auth-function',
                    type: 'component',
                    label: 'Auth Function (JWT, OAuth2, 100ms)',
                    position: { x: -250, y: 150 },
                    parentContainer: 'compute-layer',
                    size: { width: 200, height: 70 },
                    style: { backgroundColor: '#E2E8F0', borderColor: '#6B7280' },
                    icon: '🔐',
                    description: 'Authentication and authorization',
                    ...this.getTechnicalDetails(includeDetails, 'auth-lambda')
                },
                {
                    id: 'business-function',
                    type: 'component',
                    label: 'Business Function (Event-driven, Auto-scale)',
                    position: { x: 0, y: 150 },
                    parentContainer: 'compute-layer',
                    size: { width: 220, height: 70 },
                    style: { backgroundColor: '#E2E8F0', borderColor: '#6B7280' },
                    icon: '⚙️',
                    description: 'Core business logic processing',
                    ...this.getTechnicalDetails(includeDetails, 'business-lambda')
                },
                {
                    id: 'data-function',
                    type: 'component',
                    label: 'Data Function (NoSQL, Event sourcing)',
                    position: { x: 250, y: 150 },
                    parentContainer: 'compute-layer',
                    size: { width: 200, height: 70 },
                    style: { backgroundColor: '#E2E8F0', borderColor: '#6B7280' },
                    icon: '📊',
                    description: 'Data processing and persistence',
                    ...this.getTechnicalDetails(includeDetails, 'data-lambda')
                },
                {
                    id: 'nosql-db',
                    type: 'database',
                    label: 'NoSQL DB (DynamoDB, Auto-scaling)',
                    position: { x: -100, y: 400 },
                    parentContainer: 'storage-layer',
                    size: { width: 200, height: 60 },
                    style: { backgroundColor: '#FED7AA', borderColor: '#6B7280' },
                    icon: '🗄️',
                    description: 'Managed NoSQL database',
                    ...this.getTechnicalDetails(includeDetails, 'dynamodb')
                },
                {
                    id: 'object-storage',
                    type: 'component',
                    label: 'Object Storage (S3, CDN)',
                    position: { x: 150, y: 400 },
                    parentContainer: 'storage-layer',
                    size: { width: 180, height: 60 },
                    style: { backgroundColor: '#FEF3C7', borderColor: '#6B7280' },
                    icon: '📦',
                    description: 'Scalable object storage',
                    ...this.getTechnicalDetails(includeDetails, 's3-storage')
                }
            ],
            connections: [
                {
                    id: 'gateway-to-auth',
                    source: 'api-gateway',
                    target: 'auth-function',
                    type: 'smart-orthogonal',
                    label: 'Event Trigger (HTTP, Async)',
                    animated: true,
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Event-driven function invocation'
                },
                {
                    id: 'gateway-to-business',
                    source: 'api-gateway',
                    target: 'business-function',
                    type: 'smart-orthogonal',
                    label: 'Event Trigger (REST, JSON)',
                    animated: true,
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Business logic invocation'
                },
                {
                    id: 'business-to-data',
                    source: 'business-function',
                    target: 'data-function',
                    type: 'smart-orthogonal',
                    label: 'Event Chain (SQS, SNS)',
                    animated: true,
                    style: { stroke: '#6B7280', strokeWidth: 2, strokeDasharray: '5,5' },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Asynchronous event processing'
                },
                {
                    id: 'data-to-nosql',
                    source: 'data-function',
                    target: 'nosql-db',
                    type: 'smart-orthogonal',
                    label: 'NoSQL API (JSON, High throughput)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'NoSQL data operations'
                },
                {
                    id: 'data-to-storage',
                    source: 'data-function',
                    target: 'object-storage',
                    type: 'smart-orthogonal',
                    label: 'REST API (Binary, Multipart)',
                    style: { stroke: '#6B7280', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' },
                    description: 'Object storage operations'
                }
            ]
        };
    }

    getComplexityConfig(scale) {
        const configs = {
            'small': { services: 3, databases: 2, connections: 4 },
            'medium': { services: 5, databases: 3, connections: 8 },
            'large': { services: 8, databases: 4, connections: 15 },
            'enterprise': { services: 12, databases: 6, connections: 25 }
        };
        return configs[scale] || configs.medium;
    }

    generateCoreServices(complexity, includeDetails) {
        const services = [
            { id: 'user-service', name: 'User Service', icon: '👤', type: 'user-management' },
            { id: 'product-service', name: 'Product Service', icon: '📦', type: 'business-logic' },
            { id: 'order-service', name: 'Order Service', icon: '🛒', type: 'business-logic' },
            { id: 'payment-service', name: 'Payment Service', icon: '💳', type: 'payment' },
            { id: 'notification-service', name: 'Notification Service', icon: '📧', type: 'communication' },
            { id: 'analytics-service', name: 'Analytics Service', icon: '📊', type: 'analytics' },
            { id: 'search-service', name: 'Search Service', icon: '🔍', type: 'search' },
            { id: 'inventory-service', name: 'Inventory Service', icon: '📋', type: 'inventory' },
            { id: 'auth-service', name: 'Auth Service', icon: '🔐', type: 'authentication' },
            { id: 'file-service', name: 'File Service', icon: '📁', type: 'file-management' },
            { id: 'recommendation-service', name: 'Recommendation Service', icon: '🎯', type: 'ml-service' },
            { id: 'reporting-service', name: 'Reporting Service', icon: '📈', type: 'reporting' }
        ];

        const selectedServices = services.slice(0, complexity.services);
        const servicesPerRow = Math.ceil(Math.sqrt(complexity.services));
        
        return selectedServices.map((service, index) => {
            const row = Math.floor(index / servicesPerRow);
            const col = index % servicesPerRow;
            
            return {
                id: service.id,
                type: 'component',
                label: `${service.name} (HTTP, Circuit Breaker, Metrics)`,
                position: {
                    x: -300 + col * 200,
                    y: 180 + row * 100
                },
                parentContainer: 'services-zone',
                size: { width: 180, height: 70 },
                style: {
                    backgroundColor: '#E2E8F0',
                    borderColor: '#6B7280',
                    textColor: '#374151'
                },
                icon: service.icon,
                description: `Microservice handling ${service.name.toLowerCase()} functionality`,
                ...this.getTechnicalDetails(includeDetails, service.type)
            };
        });
    }

    generateDatabases(complexity, includeDetails) {
        const databases = [
            { id: 'user-db', name: 'User Database', type: 'postgresql', icon: '🐘' },
            { id: 'product-db', name: 'Product Database', type: 'mongodb', icon: '🍃' },
            { id: 'order-db', name: 'Order Database', type: 'mysql', icon: '🗄️' },
            { id: 'analytics-db', name: 'Analytics Database', type: 'elasticsearch', icon: '🔍' },
            { id: 'cache-db', name: 'Cache Database', type: 'redis', icon: '⚡' },
            { id: 'timeseries-db', name: 'Metrics Database', type: 'influxdb', icon: '📊' }
        ];

        const selectedDbs = databases.slice(0, complexity.databases);
        
        return selectedDbs.map((db, index) => ({
            id: db.id,
            type: 'database',
            label: `${db.name} (${db.type.toUpperCase()}, Replication)`,
            position: {
                x: -300 + index * 250,
                y: 520
            },
            parentContainer: 'data-zone',
            size: { width: 200, height: 60 },
            style: {
                backgroundColor: '#FED7AA',
                borderColor: '#6B7280',
                textColor: '#374151'
            },
            icon: db.icon,
            description: `${db.type} database for ${db.name.toLowerCase()}`,
            ...this.getTechnicalDetails(includeDetails, `${db.type}-database`)
        }));
    }

    generateServiceConnections(complexity, includeDetails) {
        const connections = [];
        
        // Gateway to services
        for (let i = 0; i < Math.min(3, complexity.services); i++) {
            connections.push({
                id: `gateway-to-service-${i}`,
                source: 'api-gateway',
                target: `user-service`, // Simplified - in real implementation would vary
                type: 'smart-orthogonal',
                label: 'HTTP (Load Balanced, Timeout)',
                animated: false,
                style: { stroke: '#6B7280', strokeWidth: 2 },
                markerEnd: { type: 'arrowclosed' },
                description: 'API gateway routing to microservices'
            });
        }

        return connections;
    }

    getTechnicalDetails(includeDetails, type) {
        if (!includeDetails) return {};

        const techDetails = {
            'web-frontend': {
                technicalDetails: {
                    protocol: ['HTTPS', 'WebSocket'],
                    security: {
                        authentication: ['OAuth2', 'JWT'],
                        authorization: ['RBAC'],
                        encryption: ['TLS-1.3']
                    },
                    performance: {
                        throughput: '1000 RPS',
                        latency: '< 100ms',
                        availability: '99.9%'
                    },
                    infrastructure: {
                        runtime: 'Node.js 18',
                        deployment: 'Docker + CDN',
                        monitoring: ['DataDog', 'New-Relic']
                    }
                }
            },
            'api-gateway': {
                technicalDetails: {
                    protocol: ['HTTPS', 'HTTP/2'],
                    security: {
                        authentication: ['JWT', 'API-Key'],
                        authorization: ['Claims-based'],
                        encryption: ['TLS-1.3']
                    },
                    performance: {
                        throughput: '10000 RPS',
                        latency: '< 50ms',
                        availability: '99.99%'
                    },
                    scaling: {
                        horizontal: true,
                        autoScaling: true,
                        maxInstances: 10
                    }
                }
            },
            'user-management': {
                technicalDetails: {
                    protocol: ['HTTP/2', 'gRPC'],
                    security: {
                        authentication: ['JWT'],
                        authorization: ['RBAC'],
                        encryption: ['AES-256']
                    },
                    performance: {
                        throughput: '5000 RPS',
                        latency: '< 200ms',
                        concurrency: '1000 connections'
                    },
                    scaling: {
                        horizontal: true,
                        vertical: true,
                        autoScaling: true
                    }
                }
            }
            // Add more technical details as needed...
        };

        return techDetails[type] || {
            technicalDetails: {
                protocol: ['HTTP'],
                performance: { latency: '< 500ms' },
                scaling: { horizontal: true }
            }
        };
    }

    // Additional template generators would follow similar patterns...
    generateEventDrivenTemplate(scale, technology, includeDetails, customization) {
        // Implementation for event-driven architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateLayeredTemplate(scale, technology, includeDetails, customization) {
        // Implementation for layered architecture
        return this.generateMonolithTemplate(scale, technology, includeDetails, customization);
    }

    generateHexagonalTemplate(scale, technology, includeDetails, customization) {
        // Implementation for hexagonal architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateServiceMeshTemplate(scale, technology, includeDetails, customization) {
        // Implementation for service mesh architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateDataPipelineTemplate(scale, technology, includeDetails, customization) {
        // Implementation for data pipeline architecture
        return this.generateServerlessTemplate(scale, technology, includeDetails, customization);
    }

    generateMLPipelineTemplate(scale, technology, includeDetails, customization) {
        // Implementation for ML pipeline architecture
        return this.generateServerlessTemplate(scale, technology, includeDetails, customization);
    }

    generateECommerceTemplate(scale, technology, includeDetails, customization) {
        // Implementation for e-commerce specific architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateSocialMediaTemplate(scale, technology, includeDetails, customization) {
        // Implementation for social media architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateIoTTemplate(scale, technology, includeDetails, customization) {
        // Implementation for IoT architecture
        return this.generateEventDrivenTemplate(scale, technology, includeDetails, customization);
    }

    generateBlockchainTemplate(scale, technology, includeDetails, customization) {
        // Implementation for blockchain architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }

    generateGamingTemplate(scale, technology, includeDetails, customization) {
        // Implementation for gaming architecture
        return this.generateMicroservicesTemplate(scale, technology, includeDetails, customization);
    }
}