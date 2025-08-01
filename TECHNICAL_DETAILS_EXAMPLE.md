# Technical Details Integration Guide

## 📋 JSON Schema for Technical Details

The system automatically extracts technical details from node labels and descriptions. Here's the expected JSON structure:

### Node Schema
```json
{
  "id": "api-gateway",
  "type": "component",
  "position": { "x": 100, "y": 100 },
  "data": {
    "label": "API Gateway <50ms",
    "description": "Handles authentication, rate limiting, and routing. Uses OAuth2, JWT, and horizontal scaling with Kubernetes. Monitored with Prometheus and Grafana.",
    "color": "#E3F2FD",
    "borderColor": "#2196F3",
    "textColor": "#1976D2",
    "width": 200,
    "height": 80
  }
}
```

### Edge Schema
```json
{
  "id": "api-gateway-to-auth",
  "source": "api-gateway",
  "target": "auth-service",
  "label": "HTTP/2 <20ms",
  "data": {
    "description": "Secure communication with mTLS, retry mechanism with exponential backoff, circuit breaker pattern for failure handling."
  }
}
```

## 🔍 Technical Details Extraction

The system automatically extracts these technical details from your labels and descriptions:

### **Protocols** (from label/description)
- HTTP/2, HTTP/1.1, gRPC, GraphQL, WebSocket
- Kafka, Redis, PostgreSQL, MySQL, MongoDB, Elasticsearch

### **Performance** (from label/description)
- Latency: `<50ms`, `<20ms`, etc.
- Throughput: `1000 req/sec`, `500 req/s`, etc.
- Timeout: `30s timeout`, `5s timeout`, etc.

### **Security** (from description)
- OAuth2, JWT, RBAC, mTLS, TLS, SSL
- Authentication, Authorization, SSO, 2FA

### **Scaling** (from description)
- Horizontal Scaling, Auto-scaling, Load Balancing
- Vertical Scaling, Clustering

### **Infrastructure** (from description)
- Kubernetes, Docker, AWS, Azure, GCP
- Microservices, Serverless, Containers

### **Monitoring** (from description)
- Prometheus, Grafana, Jaeger, ELK Stack
- Health checks, Metrics, Logging

### **Failure Handling** (for edges)
- Retry mechanism, Circuit breaker, Fallback
- Exponential backoff, Dead letter queue

## 🎯 Complete Example

Here's a complete diagram with technical details:

```json
{
  "nodes": [
    {
      "id": "api-gateway",
      "type": "component",
      "position": { "x": 200, "y": 100 },
      "data": {
        "label": "API Gateway <50ms",
        "description": "Handles authentication and routing. Uses OAuth2, JWT, horizontal scaling with Kubernetes. Monitored with Prometheus and Grafana. Auto-scaling enabled with load balancing.",
        "color": "#E3F2FD",
        "borderColor": "#2196F3"
      }
    },
    {
      "id": "auth-service",
      "type": "component",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Auth Service <30ms",
        "description": "OAuth2 provider with JWT tokens. Uses PostgreSQL for user data, Redis for session caching. RBAC implemented with horizontal scaling.",
        "color": "#F3E5F5",
        "borderColor": "#9C27B0"
      }
    },
    {
      "id": "user-service",
      "type": "component",
      "position": { "x": 600, "y": 100 },
      "data": {
        "label": "User Service <40ms",
        "description": "Manages user profiles and preferences. Uses MySQL with read replicas, horizontal scaling with Kubernetes. Monitored with Prometheus.",
        "color": "#E8F5E8",
        "borderColor": "#4CAF50"
      }
    },
    {
      "id": "notification-service",
      "type": "component",
      "position": { "x": 800, "y": 100 },
      "data": {
        "label": "Notification Service <25ms",
        "description": "Handles email, SMS, and push notifications. Uses Kafka for event streaming, Redis for caching. Auto-scaling with AWS Lambda.",
        "color": "#FFF3E0",
        "borderColor": "#FF9800"
      }
    }
  ],
  "edges": [
    {
      "id": "gateway-to-auth",
      "source": "api-gateway",
      "target": "auth-service",
      "label": "HTTP/2 <20ms",
      "data": {
        "description": "Secure communication with mTLS, retry mechanism with exponential backoff, circuit breaker pattern for failure handling."
      }
    },
    {
      "id": "auth-to-user",
      "source": "auth-service",
      "target": "user-service",
      "label": "gRPC <15ms",
      "data": {
        "description": "Internal service communication with TLS encryption, retry with exponential backoff, health checks enabled."
      }
    },
    {
      "id": "user-to-notification",
      "source": "user-service",
      "target": "notification-service",
      "label": "Kafka <10ms",
      "data": {
        "description": "Event-driven communication with dead letter queue, retry mechanism, and monitoring with Prometheus."
      }
    }
  ]
}
```

## 🎨 Visual Results

When you use this JSON:

1. **Node Badges**: Each node will show relevant technical badges:
   - Protocol badges (HTTP/2, gRPC, etc.)
   - Security badges (OAuth2, JWT, etc.)
   - Performance badges (latency values)

2. **Technical Panel**: Click any node/edge to see detailed technical specifications in the minimal floating panel

3. **Color Coding**: Different technical aspects are color-coded:
   - 🔵 Blue: Protocols
   - ⚡ Yellow: Performance
   - 🛡️ Green: Security
   - 🔷 Indigo: Scaling
   - 🔷 Cyan: Infrastructure
   - 🟣 Pink: Monitoring
   - 🔴 Red: Failure Handling

## 💡 Tips for Best Results

1. **Include latency in labels**: `<50ms`, `<20ms`
2. **Add protocols to labels**: `HTTP/2`, `gRPC`, `Kafka`
3. **Use descriptions for details**: Include security, scaling, infrastructure info
4. **Be specific**: Mention exact technologies (Kubernetes, Prometheus, etc.)
5. **Include performance metrics**: Throughput, timeout values

The system will automatically parse and display all this information in a clean, organized way! 🚀 