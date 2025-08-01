// Technical details extraction utilities for L3 Architecture Diagrams
// This module extracts technical specifications from node labels and descriptions

export const extractTechnicalDetails = (node) => {
    const label = node.data?.label || '';
    const description = node.data?.description || '';
    
    return {
        protocol: extractProtocol(label, description),
        performance: extractPerformance(label, description),
        security: extractSecurity(label, description),
        scaling: extractScaling(description),
        infrastructure: extractInfrastructure(description),
        monitoring: extractMonitoring(description)
    };
};

export const extractConnectionTechnicalDetails = (edge) => {
    const label = edge.label || '';
    const description = edge.data?.description || '';
    
    return {
        protocol: extractProtocol(label, description),
        performance: extractPerformance(label, description),
        security: extractSecurity(label, description),
        failureHandling: extractFailureHandling(description)
    };
};

// Helper functions for extracting specific technical details
const extractProtocol = (label, description) => {
    const text = `${label} ${description}`.toLowerCase();
    const protocols = [];
    
    if (text.includes('http/2')) protocols.push('HTTP/2');
    if (text.includes('http/1.1')) protocols.push('HTTP/1.1');
    if (text.includes('grpc')) protocols.push('gRPC');
    if (text.includes('graphql')) protocols.push('GraphQL');
    if (text.includes('websocket')) protocols.push('WebSocket');
    if (text.includes('kafka')) protocols.push('Kafka');
    if (text.includes('redis')) protocols.push('Redis');
    if (text.includes('postgresql')) protocols.push('PostgreSQL');
    if (text.includes('mysql')) protocols.push('MySQL');
    if (text.includes('mongodb')) protocols.push('MongoDB');
    if (text.includes('elasticsearch')) protocols.push('Elasticsearch');
    
    return protocols.join(', ') || 'N/A';
};

const extractPerformance = (label, description) => {
    const text = `${label} ${description}`;
    const performance = {};
    
    // Extract latency
    const latencyMatch = text.match(/<(\d+ms)/i);
    if (latencyMatch) performance.latency = latencyMatch[1];
    
    // Extract throughput
    const throughputMatch = text.match(/(\d+)\s*req\/sec/i);
    if (throughputMatch) performance.throughput = throughputMatch[1];
    
    // Extract timeout
    const timeoutMatch = text.match(/(\d+)s?\s*timeout/i);
    if (timeoutMatch) performance.timeout = timeoutMatch[1];
    
    // Extract response time
    const responseTimeMatch = text.match(/(\d+ms)\s*response/i);
    if (responseTimeMatch) performance.responseTime = responseTimeMatch[1];
    
    return performance;
};

const extractSecurity = (label, description) => {
    const text = `${label} ${description}`.toLowerCase();
    const security = [];
    
    if (text.includes('oauth2')) security.push('OAuth2');
    if (text.includes('jwt')) security.push('JWT');
    if (text.includes('rbac')) security.push('RBAC');
    if (text.includes('mtls')) security.push('mTLS');
    if (text.includes('tls')) security.push('TLS');
    if (text.includes('ssl')) security.push('SSL');
    if (text.includes('encryption')) security.push('Encryption');
    if (text.includes('authentication')) security.push('Auth');
    if (text.includes('authorization')) security.push('AuthZ');
    if (text.includes('sso')) security.push('SSO');
    if (text.includes('2fa')) security.push('2FA');
    
    return security.join(', ') || 'N/A';
};

const extractScaling = (description) => {
    const text = description.toLowerCase();
    const scaling = [];
    
    if (text.includes('horizontal scaling')) scaling.push('Horizontal Scaling');
    if (text.includes('auto-scaling')) scaling.push('Auto-scaling');
    if (text.includes('load balancing')) scaling.push('Load Balancing');
    if (text.includes('vertical scaling')) scaling.push('Vertical Scaling');
    if (text.includes('cluster')) scaling.push('Clustering');
    if (text.includes('replication')) scaling.push('Replication');
    if (text.includes('sharding')) scaling.push('Sharding');
    
    return scaling.join(', ') || 'N/A';
};

const extractInfrastructure = (description) => {
    const text = description.toLowerCase();
    const infrastructure = [];
    
    if (text.includes('kubernetes')) infrastructure.push('Kubernetes');
    if (text.includes('docker')) infrastructure.push('Docker');
    if (text.includes('aws')) infrastructure.push('AWS');
    if (text.includes('azure')) infrastructure.push('Azure');
    if (text.includes('gcp')) infrastructure.push('GCP');
    if (text.includes('vm')) infrastructure.push('VM');
    if (text.includes('container')) infrastructure.push('Container');
    if (text.includes('serverless')) infrastructure.push('Serverless');
    
    // Extract resource requirements
    const cpuMatch = text.match(/(\d+)\s*cpu/i);
    const ramMatch = text.match(/(\d+gb)\s*ram/i);
    const storageMatch = text.match(/(\d+gb)\s*storage/i);
    
    if (cpuMatch) infrastructure.push(`${cpuMatch[1]} CPU`);
    if (ramMatch) infrastructure.push(ramMatch[1]);
    if (storageMatch) infrastructure.push(storageMatch[1]);
    
    return infrastructure.join(', ') || 'N/A';
};

const extractMonitoring = (description) => {
    const text = description.toLowerCase();
    const monitoring = [];
    
    if (text.includes('prometheus')) monitoring.push('Prometheus');
    if (text.includes('jaeger')) monitoring.push('Jaeger');
    if (text.includes('elk')) monitoring.push('ELK');
    if (text.includes('grafana')) monitoring.push('Grafana');
    if (text.includes('datadog')) monitoring.push('Datadog');
    if (text.includes('new relic')) monitoring.push('New Relic');
    if (text.includes('splunk')) monitoring.push('Splunk');
    if (text.includes('logging')) monitoring.push('Logging');
    if (text.includes('metrics')) monitoring.push('Metrics');
    if (text.includes('tracing')) monitoring.push('Tracing');
    if (text.includes('alerting')) monitoring.push('Alerting');
    
    return monitoring.join(', ') || 'N/A';
};

const extractFailureHandling = (description) => {
    const text = description.toLowerCase();
    const failureHandling = [];
    
    if (text.includes('circuit breaker')) {
        const cbMatch = text.match(/circuit breaker[:\s]*(\d+)\s*failures/i);
        if (cbMatch) failureHandling.push(`Circuit Breaker: ${cbMatch[1]} failures`);
        else failureHandling.push('Circuit Breaker');
    }
    
    if (text.includes('retry')) {
        const retryMatch = text.match(/retry[:\s]*(\d+)\s*attempts/i);
        if (retryMatch) failureHandling.push(`Retry: ${retryMatch[1]} attempts`);
        else failureHandling.push('Retry');
    }
    
    if (text.includes('fallback')) failureHandling.push('Fallback');
    if (text.includes('graceful degradation')) failureHandling.push('Graceful Degradation');
    if (text.includes('timeout')) failureHandling.push('Timeout');
    if (text.includes('dead letter queue')) failureHandling.push('Dead Letter Queue');
    
    return failureHandling.join(', ') || 'N/A';
};

// Utility function to get color coding for different technical aspects
export const getTechnicalColor = (type, value) => {
    const colors = {
        protocol: {
            'HTTP/2': 'bg-blue-100 text-blue-800',
            'gRPC': 'bg-purple-100 text-purple-800',
            'GraphQL': 'bg-pink-100 text-pink-800',
            'WebSocket': 'bg-green-100 text-green-800',
            'Kafka': 'bg-orange-100 text-orange-800',
            'Redis': 'bg-red-100 text-red-800'
        },
        security: {
            'OAuth2': 'bg-green-100 text-green-800',
            'JWT': 'bg-blue-100 text-blue-800',
            'RBAC': 'bg-purple-100 text-purple-800',
            'mTLS': 'bg-yellow-100 text-yellow-800',
            'TLS': 'bg-yellow-100 text-yellow-800'
        },
        performance: {
            'latency': 'bg-purple-100 text-purple-800',
            'throughput': 'bg-indigo-100 text-indigo-800'
        },
        scaling: {
            'Horizontal Scaling': 'bg-green-100 text-green-800',
            'Auto-scaling': 'bg-blue-100 text-blue-800',
            'Load Balancing': 'bg-orange-100 text-orange-800'
        },
        infrastructure: {
            'Kubernetes': 'bg-blue-100 text-blue-800',
            'Docker': 'bg-indigo-100 text-indigo-800',
            'AWS': 'bg-orange-100 text-orange-800',
            'Azure': 'bg-blue-100 text-blue-800',
            'GCP': 'bg-red-100 text-red-800'
        },
        monitoring: {
            'Prometheus': 'bg-red-100 text-red-800',
            'Jaeger': 'bg-blue-100 text-blue-800',
            'ELK': 'bg-yellow-100 text-yellow-800',
            'Grafana': 'bg-orange-100 text-orange-800'
        }
    };
    
    return colors[type]?.[value] || 'bg-gray-100 text-gray-800';
}; 