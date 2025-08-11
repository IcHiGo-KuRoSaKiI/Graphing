# Enhanced Graphing MCP Server

An advanced Model Context Protocol (MCP) server for generating, validating, and managing architecture diagrams with comprehensive features including smart routing, template generation, and detailed technical specifications.

## 🚀 Features

### Core Capabilities
- **Architecture Diagram Creation**: Generate complex diagrams from natural language or structured input
- **Smart Layout Algorithms**: Multiple layout algorithms (hierarchical, force-directed, circular, etc.)
- **Template Generation**: Pre-configured templates for common architecture patterns
- **Schema Generation**: Generate JSON schemas for LLM structured output
- **Diagram Validation**: Comprehensive validation with quality metrics
- **Technical Details**: Rich technical specifications for all components

### Advanced Features
- **Smart Orthogonal Routing**: Intelligent edge routing with obstacle avoidance
- **Container Management**: Automatic grouping and boundary management
- **Quality Metrics**: Architecture quality assessment and suggestions
- **Multi-format Export**: Support for PNG, SVG, PDF, JSON, and Draw.io formats
- **Session Management**: Persistent diagram state across interactions

## 📋 Available Tools

### 1. `create_architecture_diagram`
Generate architecture diagrams from descriptions or JSON data.

**Parameters:**
- `description` (string): Natural language description of the architecture
- `jsonData` (object): Pre-defined JSON data for the diagram
- `template` (string): Template to use (microservices, monolith, serverless, etc.)
- `options` (object): Additional options for diagram creation

**Example:**
```json
{
  "description": "E-commerce microservices platform with user management, product catalog, and payment processing",
  "template": "microservices",
  "options": {
    "includeTechnicalDetails": true,
    "autoLayout": true,
    "style": "modern"
  }
}
```

### 2. `generate_template`
Generate pre-configured architecture diagram templates.

**Parameters:**
- `template` (enum): Template type (microservices, serverless, monolith, etc.)
- `scale` (enum): Template scale (small, medium, large, enterprise)
- `technology` (enum): Technology preference (cloud-native, kubernetes, etc.)
- `includeDetails` (boolean): Include technical details
- `customization` (object): Template customization options

**Example:**
```json
{
  "template": "microservices",
  "scale": "large",
  "technology": "kubernetes",
  "includeDetails": true,
  "customization": {
    "businessDomain": "e-commerce",
    "userLoad": "high",
    "securityLevel": "enterprise"
  }
}
```

### 3. `validate_diagram`
Validate diagrams against schema and best practices.

**Parameters:**
- `diagram` (object): Diagram data to validate
- `strict` (boolean): Enable strict validation mode
- `validationRules` (object): Custom validation rules

**Example:**
```json
{
  "diagram": {...},
  "strict": true,
  "validationRules": {
    "minNodes": 5,
    "requireTechnicalDetails": true
  }
}
```

### 4. `smart_layout`
Apply intelligent layout algorithms with advanced positioning.

**Parameters:**
- `diagram` (object): Diagram data to layout
- `algorithm` (enum): Layout algorithm (hierarchical, force-directed, etc.)
- `direction` (enum): Layout direction (TB, BT, LR, RL)
- `spacing` (object): Spacing configuration
- `constraints` (object): Layout constraints

**Example:**
```json
{
  "diagram": {...},
  "algorithm": "hierarchical",
  "direction": "TB",
  "constraints": {
    "minimizeEdgeCrossings": true,
    "respectContainerBounds": true
  }
}
```

### 5. `generate_schema`
Generate JSON-RPC schemas for LLM structured output.

**Parameters:**
- `schemaType` (enum): Type of schema (full, minimal, template-specific)
- `templateType` (enum): Specific template type for targeted schemas
- `complexity` (enum): Schema complexity level
- `outputFormat` (enum): Output format (json-schema, openai-function, etc.)

**Example:**
```json
{
  "schemaType": "template-specific",
  "templateType": "microservices",
  "complexity": "complex",
  "outputFormat": "openai-function",
  "includeExamples": true
}
```

### 6. `export_diagram`
Export diagrams in various formats.

**Parameters:**
- `diagram` (object): Diagram to export
- `format` (enum): Export format (png, svg, pdf, json, drawio)
- `options` (object): Export configuration

### 7. `auto_layout_diagram`
Apply automatic layout with basic algorithms.

### 8. `add_technical_details`
Enhance diagrams with technical specifications.

## 🏗️ Architecture Templates

### Microservices
- API Gateway pattern
- Service discovery
- Circuit breakers
- Distributed data management
- Event-driven communication

### Serverless
- Function-as-a-Service (FaaS)
- Event-driven architecture
- Managed services integration
- Auto-scaling capabilities

### Monolithic
- Layered architecture
- MVC pattern
- Centralized data management
- Traditional deployment

### Additional Templates
- Event-driven architecture
- Hexagonal architecture
- Service mesh
- Data pipelines
- ML pipelines
- IoT systems
- Blockchain applications

## 🔧 Technical Specifications

### Node Types
- `component`: Generic service component
- `database`: Data storage systems
- `api`: API endpoints and gateways
- `service`: Business logic services
- `ui`: User interface components
- `queue`: Message queues
- `cache`: Caching systems
- `load-balancer`: Load balancing components

### Edge Types
- `smart-orthogonal`: Intelligent routing with obstacle avoidance
- `orthogonal`: Right-angle routing
- `straight`: Direct connections
- `bezier`: Curved connections
- `step`: Step-wise routing

### Smart Features
- **Obstacle Avoidance**: Automatic routing around nodes
- **Grid Snapping**: Alignment to grid for clean layouts
- **Jetty System**: Draw.io style connection points
- **Performance Optimization**: Caching and debouncing
- **Container Auto-sizing**: Dynamic boundary adjustment

## 🎯 Quality Metrics

### Validation Checks
- Schema compliance
- Reference integrity
- Technical detail completeness
- Naming consistency
- Color scheme adherence

### Quality Scores
- **Completeness Score**: How complete the diagram is
- **Connectivity Score**: How well connected components are
- **Complexity Score**: Appropriate complexity level
- **Architecture Quality**: Best practices compliance

## 📊 Usage with Different LLM Providers

### OpenAI
```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "create_architecture_diagram",
            "description": "Generate architecture diagrams with smart routing",
            "parameters": schema
        }
    }
]
```

### Anthropic Claude
```xml
<tool_use>
<tool_name>generate_template</tool_name>
<parameters>
{
  "template": "microservices",
  "scale": "enterprise"
}
</parameters>
</tool_use>
```

### JSON-RPC
```json
{
  "jsonrpc": "2.0",
  "method": "validate_diagram",
  "params": {
    "diagram": {...},
    "strict": true
  },
  "id": 1
}
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Use with MCP Client**
   The server implements the Model Context Protocol and can be used with any MCP-compatible client.

## 🔍 Schema Structure

The enhanced schema includes:

- **Comprehensive metadata** with domain, technology stack, and patterns
- **Advanced styling** with gradients, shadows, and themes
- **Technical specifications** for protocols, security, and performance
- **Smart routing configuration** for intelligent edge placement
- **Validation rules** and quality metrics
- **Container management** with automatic sizing
- **Export configuration** for multiple formats

## 💡 Best Practices

1. **Use Templates**: Start with predefined templates for common patterns
2. **Include Technical Details**: Enhance diagrams with comprehensive specifications
3. **Validate Early**: Use validation tools to ensure quality
4. **Smart Routing**: Leverage orthogonal routing for cleaner diagrams
5. **Container Organization**: Group related components in containers
6. **Consistent Naming**: Follow naming conventions for better readability

## 🤝 Integration Examples

### With Claude Desktop
```json
{
  "mcpServers": {
    "graphing": {
      "command": "node",
      "args": ["path/to/mcp-server/index.js"]
    }
  }
}
```

### With Custom Applications
```javascript
import { GraphingMCPServer } from './src/GraphingMCPServer.js';

const server = new GraphingMCPServer();
await server.start();
```

## 📈 Performance Features

- **Caching**: Route caching for improved performance
- **Debouncing**: Debounced updates for responsive editing
- **Lazy Loading**: On-demand component loading
- **Memory Management**: Efficient session handling
- **Batch Operations**: Optimized batch processing

## 🛠️ Extensibility

The server is designed for extensibility:

- **Custom Tools**: Add new tools by extending BaseTool
- **Template Customization**: Create custom architecture templates
- **Validation Rules**: Define custom validation logic
- **Export Formats**: Add new export format support
- **Layout Algorithms**: Implement custom layout algorithms

---

For more information, see the [API documentation](./docs/api.md) and [examples](./examples/).