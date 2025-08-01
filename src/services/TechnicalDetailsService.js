import { extractTechnicalDetails, extractConnectionTechnicalDetails, getTechnicalColor } from '../components/utils/technicalDetailsParser';

export class TechnicalDetailsService {
    constructor() {
        this.parsingRules = new Map();
        this.setupDefaultParsingRules();
    }

    /**
     * Setup default parsing rules for technical details
     */
    setupDefaultParsingRules() {
        // Protocol parsing rules
        this.registerParsingRule('protocol', {
            patterns: [
                { regex: /http\/2/i, value: 'HTTP/2' },
                { regex: /http\/1\.1/i, value: 'HTTP/1.1' },
                { regex: /grpc/i, value: 'gRPC' },
                { regex: /graphql/i, value: 'GraphQL' },
                { regex: /websocket/i, value: 'WebSocket' },
                { regex: /kafka/i, value: 'Kafka' },
                { regex: /redis/i, value: 'Redis' },
                { regex: /postgresql/i, value: 'PostgreSQL' },
                { regex: /mysql/i, value: 'MySQL' },
                { regex: /mongodb/i, value: 'MongoDB' },
                { regex: /elasticsearch/i, value: 'Elasticsearch' }
            ]
        });

        // Performance parsing rules
        this.registerParsingRule('performance', {
            patterns: [
                { regex: /<(\d+ms)/i, type: 'latency', extract: true },
                { regex: /(\d+)\s*req\/sec/i, type: 'throughput', extract: true },
                { regex: /(\d+)s?\s*timeout/i, type: 'timeout', extract: true },
                { regex: /(\d+ms)\s*response/i, type: 'responseTime', extract: true }
            ]
        });

        // Security parsing rules
        this.registerParsingRule('security', {
            patterns: [
                { regex: /oauth2/i, value: 'OAuth2' },
                { regex: /jwt/i, value: 'JWT' },
                { regex: /rbac/i, value: 'RBAC' },
                { regex: /mtls/i, value: 'mTLS' },
                { regex: /tls/i, value: 'TLS' },
                { regex: /ssl/i, value: 'SSL' },
                { regex: /encryption/i, value: 'Encryption' },
                { regex: /authentication/i, value: 'Auth' },
                { regex: /authorization/i, value: 'AuthZ' },
                { regex: /sso/i, value: 'SSO' },
                { regex: /2fa/i, value: '2FA' }
            ]
        });

        // Scaling parsing rules
        this.registerParsingRule('scaling', {
            patterns: [
                { regex: /horizontal scaling/i, value: 'Horizontal Scaling' },
                { regex: /auto-scaling/i, value: 'Auto-scaling' },
                { regex: /load balancing/i, value: 'Load Balancing' },
                { regex: /vertical scaling/i, value: 'Vertical Scaling' },
                { regex: /cluster/i, value: 'Clustering' }
            ]
        });

        // Infrastructure parsing rules
        this.registerParsingRule('infrastructure', {
            patterns: [
                { regex: /kubernetes/i, value: 'Kubernetes' },
                { regex: /docker/i, value: 'Docker' },
                { regex: /aws/i, value: 'AWS' },
                { regex: /azure/i, value: 'Azure' },
                { regex: /gcp/i, value: 'GCP' },
                { regex: /microservices/i, value: 'Microservices' },
                { regex: /serverless/i, value: 'Serverless' },
                { regex: /containers/i, value: 'Containers' }
            ]
        });

        // Monitoring parsing rules
        this.registerParsingRule('monitoring', {
            patterns: [
                { regex: /prometheus/i, value: 'Prometheus' },
                { regex: /grafana/i, value: 'Grafana' },
                { regex: /jaeger/i, value: 'Jaeger' },
                { regex: /elk stack/i, value: 'ELK Stack' },
                { regex: /health checks/i, value: 'Health Checks' },
                { regex: /metrics/i, value: 'Metrics' },
                { regex: /logging/i, value: 'Logging' }
            ]
        });

        // Failure handling parsing rules
        this.registerParsingRule('failureHandling', {
            patterns: [
                { regex: /retry mechanism/i, value: 'Retry Mechanism' },
                { regex: /circuit breaker/i, value: 'Circuit Breaker' },
                { regex: /fallback/i, value: 'Fallback' },
                { regex: /exponential backoff/i, value: 'Exponential Backoff' },
                { regex: /dead letter queue/i, value: 'Dead Letter Queue' }
            ]
        });
    }

    /**
     * Register a new parsing rule
     * @param {string} category - Rule category
     * @param {Object} rule - Parsing rule object
     */
    registerParsingRule(category, rule) {
        if (!this.parsingRules.has(category)) {
            this.parsingRules.set(category, []);
        }
        this.parsingRules.get(category).push(rule);
    }

    /**
     * Extract technical details from node
     * @param {Object} node - Node object
     * @returns {Object} Technical details object
     */
    extractTechnicalDetails(node) {
        const label = node.data?.label || '';
        const description = node.data?.description || '';
        
        return {
            protocol: this.extractProtocol(label, description),
            performance: this.extractPerformance(label, description),
            security: this.extractSecurity(label, description),
            scaling: this.extractScaling(description),
            infrastructure: this.extractInfrastructure(description),
            monitoring: this.extractMonitoring(description)
        };
    }

    /**
     * Extract technical details from connection
     * @param {Object} edge - Edge object
     * @returns {Object} Technical details object
     */
    extractConnectionTechnicalDetails(edge) {
        const label = edge.label || '';
        const description = edge.data?.description || '';
        
        return {
            protocol: this.extractProtocol(label, description),
            performance: this.extractPerformance(label, description),
            security: this.extractSecurity(label, description),
            failureHandling: this.extractFailureHandling(description)
        };
    }

    /**
     * Extract protocol information
     * @param {string} label - Node/edge label
     * @param {string} description - Node/edge description
     * @returns {string} Protocol information
     */
    extractProtocol(label, description) {
        const text = `${label} ${description}`.toLowerCase();
        const protocols = [];
        
        const protocolRules = this.parsingRules.get('protocol');
        if (protocolRules) {
            protocolRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        protocols.push(pattern.value);
                    }
                });
            });
        }
        
        return protocols.join(', ') || 'N/A';
    }

    /**
     * Extract performance information
     * @param {string} label - Node/edge label
     * @param {string} description - Node/edge description
     * @returns {Object} Performance information
     */
    extractPerformance(label, description) {
        const text = `${label} ${description}`;
        const performance = {};
        
        const performanceRules = this.parsingRules.get('performance');
        if (performanceRules) {
            performanceRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    const match = text.match(pattern.regex);
                    if (match && pattern.extract) {
                        performance[pattern.type] = match[1];
                    }
                });
            });
        }
        
        return performance;
    }

    /**
     * Extract security information
     * @param {string} label - Node/edge label
     * @param {string} description - Node/edge description
     * @returns {string} Security information
     */
    extractSecurity(label, description) {
        const text = `${label} ${description}`.toLowerCase();
        const security = [];
        
        const securityRules = this.parsingRules.get('security');
        if (securityRules) {
            securityRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        security.push(pattern.value);
                    }
                });
            });
        }
        
        return security.join(', ') || 'N/A';
    }

    /**
     * Extract scaling information
     * @param {string} description - Node/edge description
     * @returns {string} Scaling information
     */
    extractScaling(description) {
        const text = description.toLowerCase();
        const scaling = [];
        
        const scalingRules = this.parsingRules.get('scaling');
        if (scalingRules) {
            scalingRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        scaling.push(pattern.value);
                    }
                });
            });
        }
        
        return scaling.join(', ') || 'N/A';
    }

    /**
     * Extract infrastructure information
     * @param {string} description - Node/edge description
     * @returns {string} Infrastructure information
     */
    extractInfrastructure(description) {
        const text = description.toLowerCase();
        const infrastructure = [];
        
        const infrastructureRules = this.parsingRules.get('infrastructure');
        if (infrastructureRules) {
            infrastructureRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        infrastructure.push(pattern.value);
                    }
                });
            });
        }
        
        return infrastructure.join(', ') || 'N/A';
    }

    /**
     * Extract monitoring information
     * @param {string} description - Node/edge description
     * @returns {string} Monitoring information
     */
    extractMonitoring(description) {
        const text = description.toLowerCase();
        const monitoring = [];
        
        const monitoringRules = this.parsingRules.get('monitoring');
        if (monitoringRules) {
            monitoringRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        monitoring.push(pattern.value);
                    }
                });
            });
        }
        
        return monitoring.join(', ') || 'N/A';
    }

    /**
     * Extract failure handling information
     * @param {string} description - Node/edge description
     * @returns {string} Failure handling information
     */
    extractFailureHandling(description) {
        const text = description.toLowerCase();
        const failureHandling = [];
        
        const failureHandlingRules = this.parsingRules.get('failureHandling');
        if (failureHandlingRules) {
            failureHandlingRules.forEach(rule => {
                rule.patterns.forEach(pattern => {
                    if (pattern.regex.test(text)) {
                        failureHandling.push(pattern.value);
                    }
                });
            });
        }
        
        return failureHandling.join(', ') || 'N/A';
    }

    /**
     * Enrich diagram with technical details
     * @param {Object} diagramData - Diagram data
     * @returns {Promise<Object>} Enriched diagram data
     */
    async enrichDiagram(diagramData) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        
        // Enrich containers
        const enrichedContainers = containers.map(container => ({
            ...container,
            technicalDetails: this.extractTechnicalDetails({ data: container })
        }));

        // Enrich nodes
        const enrichedNodes = nodes.map(node => ({
            ...node,
            technicalDetails: this.extractTechnicalDetails({ data: node })
        }));

        // Enrich connections
        const enrichedConnections = connections.map(connection => ({
            ...connection,
            technicalDetails: this.extractConnectionTechnicalDetails(connection)
        }));

        return {
            containers: enrichedContainers,
            nodes: enrichedNodes,
            connections: enrichedConnections
        };
    }

    /**
     * Get technical color for a specific type and value
     * @param {string} type - Technical detail type
     * @param {string} value - Technical detail value
     * @returns {string} Color code
     */
    getTechnicalColor(type, value) {
        return getTechnicalColor(type, value);
    }

    /**
     * Validate technical details format
     * @param {Object} technicalDetails - Technical details object
     * @returns {Object} Validation result
     */
    validateTechnicalDetails(technicalDetails) {
        const requiredFields = ['protocol', 'performance', 'security', 'scaling', 'infrastructure', 'monitoring'];
        const missingFields = requiredFields.filter(field => !technicalDetails[field]);
        
        return {
            isValid: missingFields.length === 0,
            missingFields,
            errorMessage: missingFields.length > 0 
                ? `Missing required fields: ${missingFields.join(', ')}`
                : null
        };
    }

    /**
     * Generate technical badges for display
     * @param {Object} technicalDetails - Technical details object
     * @returns {Array} Array of badge objects
     */
    generateTechnicalBadges(technicalDetails) {
        const badges = [];
        
        Object.entries(technicalDetails).forEach(([type, value]) => {
            if (value && value !== 'N/A') {
                badges.push({
                    type,
                    value,
                    color: this.getTechnicalColor(type, value),
                    label: this.getBadgeLabel(type, value)
                });
            }
        });
        
        return badges;
    }

    /**
     * Get badge label for display
     * @param {string} type - Technical detail type
     * @param {string} value - Technical detail value
     * @returns {string} Badge label
     */
    getBadgeLabel(type, value) {
        const labelMap = {
            protocol: 'Protocol',
            performance: 'Performance',
            security: 'Security',
            scaling: 'Scaling',
            infrastructure: 'Infrastructure',
            monitoring: 'Monitoring',
            failureHandling: 'Failure Handling'
        };
        
        return labelMap[type] || type;
    }

    /**
     * Get available technical detail categories
     * @returns {Array} Array of category names
     */
    getAvailableCategories() {
        return Array.from(this.parsingRules.keys());
    }

    /**
     * Get parsing rules for a specific category
     * @param {string} category - Category name
     * @returns {Array} Array of parsing rules
     */
    getParsingRules(category) {
        return this.parsingRules.get(category) || [];
    }
} 