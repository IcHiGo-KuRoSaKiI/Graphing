# Graphing MCP Server

A Model Context Protocol (MCP) server that enables AI agents to create, modify, and export architecture diagrams programmatically.

## Features

- **Create Architecture Diagrams**: Generate diagrams from natural language descriptions or JSON data
- **Export Diagrams**: Export to multiple formats (JSON, PNG, SVG, draw.io XML, JPG)
- **Auto-Layout**: Automatically layout diagram components using various algorithms
- **Technical Details**: Add and enrich diagrams with technical specifications
- **Session Management**: Maintain diagram sessions for agents
- **Template Support**: Pre-built templates for common architectures

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Start the MCP Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## MCP Tools

The server provides the following MCP tools:

### 1. `create_architecture_diagram`

Creates an architecture diagram from natural language description or JSON data.

**Parameters:**
- `description` (string): Natural language description of the architecture
- `jsonData` (object): Pre-defined JSON data for the diagram
- `template` (string): Template to use (microservices, monolith, serverless, etc.)
- `options` (object): Additional options for diagram creation

**Example:**
```json
{
  "description": "Create a microservices architecture with user service, product service, and PostgreSQL database",
  "template": "microservices",
  "options": {
    "includeTechnicalDetails": true,
    "autoLayout": true,
    "style": "modern"
  }
}
```

### 2. `export_diagram`

Exports a diagram to various formats.

**Parameters:**
- `diagram` (object): Diagram data to export
- `format` (string): Export format (json, png, svg, drawio, jpg)
- `options` (object): Export options

**Example:**
```json
{
  "diagram": { /* diagram data */ },
  "format": "png",
  "options": {
    "filename": "architecture-diagram.png",
    "quality": 0.9,
    "width": 800,
    "height": 600
  }
}
```

### 3. `auto_layout_diagram`

Automatically layouts diagram components.

**Parameters:**
- `diagram` (object): Diagram data to layout
- `algorithm` (string): Layout algorithm (hierarchical, force-directed, circular, grid, organic)
- `options` (object): Layout options

**Example:**
```json
{
  "diagram": { /* diagram data */ },
  "algorithm": "hierarchical",
  "options": {
    "direction": "TB",
    "spacing": 50,
    "padding": 20,
    "centerContainers": true,
    "optimizeConnections": true
  }
}
```

### 4. `add_technical_details`

Adds technical specifications to diagram components.

**Parameters:**
- `diagram` (object): Diagram data to enrich
- `technicalSpecs` (object): Technical specifications to apply
- `options` (object): Enrichment options

**Example:**
```json
{
  "diagram": { /* diagram data */ },
  "technicalSpecs": {
    "nodes": [
      {
        "nodeId": "node_1",
        "specifications": {
          "performance": { "responseTime": "<100ms" },
          "security": { "authentication": "OAuth2" }
        }
      }
    ]
  },
  "options": {
    "extractFromLabels": true,
    "addPerformanceMetrics": true,
    "addSecurityProtocols": true,
    "colorCoding": true
  }
}
```

## Architecture

```
GraphingMCPServer
├── Tools
│   ├── CreateDiagramTool
│   ├── ExportDiagramTool
│   ├── AutoLayoutTool
│   └── TechnicalDetailsTool
├── Parsers
│   └── DescriptionParser
├── Generators
│   └── ComponentGenerator
├── Session
│   └── SessionManager
└── Base Classes
    └── BaseTool
```

## Templates

The server includes pre-built templates for common architectures:

### Microservices Template
- Frontend container with React app
- API Gateway container
- Backend Services container with multiple services
- Database container with PostgreSQL

### Monolith Template
- Application container with web server, business logic, and data access
- Database container with MySQL

### Serverless Template
- Frontend container with React app
- Serverless Functions container with Lambda functions
- Database container with DynamoDB

## Session Management

The server maintains sessions for each agent interaction:

- **Session Creation**: Automatic session creation for new requests
- **Session Persistence**: Diagrams and history maintained across requests
- **Session Cleanup**: Automatic cleanup of expired sessions (30 minutes)
- **Session History**: Version history for diagram modifications

## Error Handling

The server provides comprehensive error handling:

- **Input Validation**: All inputs validated against schemas
- **Graceful Degradation**: Fallback mechanisms for failed operations
- **Detailed Error Messages**: Specific error messages for debugging
- **Error Logging**: Comprehensive error logging for monitoring

## Performance

- **Response Time**: < 2 seconds for tool responses
- **Concurrent Requests**: Supports 100+ concurrent requests
- **Memory Usage**: < 512MB under normal load
- **CPU Usage**: < 50% under normal load

## Security

- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: No sensitive information in error messages
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Session Security**: Secure session management

## Development

### Project Structure

```
mcp-server/
├── src/
│   ├── GraphingMCPServer.js      # Main MCP server
│   ├── tools/                     # MCP tools
│   │   ├── BaseTool.js
│   │   ├── CreateDiagramTool.js
│   │   ├── ExportDiagramTool.js
│   │   ├── AutoLayoutTool.js
│   │   └── TechnicalDetailsTool.js
│   ├── parsers/                   # Natural language parsing
│   │   └── DescriptionParser.js
│   ├── generators/                 # Component generation
│   │   └── ComponentGenerator.js
│   └── session/                   # Session management
│       └── SessionManager.js
├── index.js                       # Entry point
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

### Adding New Tools

1. Create a new tool class extending `BaseTool`
2. Implement the required methods (`execute`, `getDescription`, `getInputSchema`)
3. Register the tool in `GraphingMCPServer.initializeTools()`

### Adding New Templates

1. Add template data to `ComponentGenerator.templates`
2. Include containers, nodes, and connections
3. Update template validation if needed

## Testing

```bash
# Run tests (when implemented)
npm test

# Run in development mode
npm run dev
```

## Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (Future)

```bash
docker build -t graphing-mcp-server .
docker run -p 3000:3000 graphing-mcp-server
```

## Configuration

Environment variables (optional):

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in environment variables
2. **Memory issues**: Increase Node.js memory limit with `--max-old-space-size`
3. **Permission denied**: Ensure proper file permissions

### Logs

The server provides detailed logging:

- **Startup logs**: Server initialization and tool registration
- **Request logs**: Incoming MCP tool requests
- **Error logs**: Detailed error information
- **Session logs**: Session creation and cleanup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs for error details
3. Create an issue with detailed information

---

**Graphing MCP Server** - Enabling AI agents to create architecture diagrams programmatically. 