import { BaseTool } from './BaseTool.js';

/**
 * Export Diagram Tool
 * Allows agents to export diagrams in various formats
 */
export class ExportDiagramTool extends BaseTool {
    constructor() {
        super();
        this.name = 'export_diagram';
        this.description = 'Export an architecture diagram to various formats (JSON, PNG, SVG, draw.io XML)';
    }

    /**
     * Get input schema for the tool
     * @returns {Object} JSON schema for tool input
     */
    getInputSchema() {
        return {
            type: 'object',
            properties: {
                diagram: {
                    type: 'object',
                    description: 'Diagram data to export'
                },
                format: {
                    type: 'string',
                    enum: ['json', 'png', 'svg', 'drawio', 'jpg'],
                    description: 'Export format'
                },
                options: {
                    type: 'object',
                    description: 'Export options',
                    properties: {
                        filename: {
                            type: 'string',
                            description: 'Output filename'
                        },
                        includeMetadata: {
                            type: 'boolean',
                            description: 'Include metadata in export'
                        },
                        quality: {
                            type: 'number',
                            description: 'Image quality (for PNG/JPG)',
                            minimum: 0.1,
                            maximum: 1.0
                        },
                        width: {
                            type: 'number',
                            description: 'Image width'
                        },
                        height: {
                            type: 'number',
                            description: 'Image height'
                        }
                    }
                }
            },
            required: ['diagram', 'format']
        };
    }

    /**
     * Execute the tool
     * @param {Object} args - Tool arguments
     * @param {Object} session - Session object
     * @returns {Promise<Object>} Tool execution result
     */
    async execute(args, session) {
        try {
            // Validate input
            this.validateInput(args, this.getInputSchema());

            const { diagram, format, options = {} } = args;
            const {
                filename,
                includeMetadata = true,
                quality = 0.9,
                width,
                height
            } = options;

            // Validate diagram data
            if (!diagram || typeof diagram !== 'object') {
                throw new Error('Invalid diagram data');
            }

            // Get diagram from session if not provided
            let diagramData = diagram;
            if (!diagramData && session) {
                diagramData = session.getDiagram();
                if (!diagramData) {
                    throw new Error('No diagram available in session');
                }
            }

            // Export based on format
            let exportResult;
            switch (format.toLowerCase()) {
                case 'json':
                    exportResult = await this.exportToJSON(diagramData, { includeMetadata, filename });
                    break;
                case 'png':
                    exportResult = await this.exportToPNG(diagramData, { quality, width, height, filename });
                    break;
                case 'svg':
                    exportResult = await this.exportToSVG(diagramData, { width, height, filename });
                    break;
                case 'drawio':
                    exportResult = await this.exportToDrawio(diagramData, { includeMetadata, filename });
                    break;
                case 'jpg':
                    exportResult = await this.exportToJPG(diagramData, { quality, width, height, filename });
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            return this.createSuccessResponse({
                export: exportResult,
                format,
                filename: exportResult.filename,
                size: exportResult.size,
                mimeType: exportResult.mimeType
            }, `Diagram exported successfully to ${format.toUpperCase()}`);

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    /**
     * Export to JSON format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToJSON(diagramData, options = {}) {
        const { includeMetadata = true, filename } = options;
        
        const exportData = { ...diagramData };
        
        if (includeMetadata) {
            exportData.metadata = {
                ...exportData.metadata,
                exportDate: new Date().toISOString(),
                exportFormat: 'json',
                exportedBy: 'MCP Tool'
            };
        }

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        return {
            data: jsonString,
            blob,
            filename: filename || 'architecture-diagram.json',
            mimeType: 'application/json',
            size: blob.size
        };
    }

    /**
     * Export to PNG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToPNG(diagramData, options = {}) {
        const { quality = 0.9, width, height, filename } = options;
        
        // This would integrate with the ExportService from the main application
        // For now, we'll create a mock result
        const mockImageData = this.generateMockImageData(diagramData, { width, height });
        
        return {
            data: mockImageData,
            filename: filename || 'architecture-diagram.png',
            mimeType: 'image/png',
            size: mockImageData.length,
            quality
        };
    }

    /**
     * Export to SVG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToSVG(diagramData, options = {}) {
        const { width, height, filename } = options;
        
        // Generate SVG content
        const svgContent = this.generateSVGContent(diagramData, { width, height });
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });

        return {
            data: svgContent,
            blob,
            filename: filename || 'architecture-diagram.svg',
            mimeType: 'image/svg+xml',
            size: blob.size
        };
    }

    /**
     * Export to draw.io XML format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToDrawio(diagramData, options = {}) {
        const { includeMetadata = true, filename } = options;
        
        // Generate draw.io XML content
        const xmlContent = this.generateDrawioXML(diagramData, { includeMetadata });
        const blob = new Blob([xmlContent], { type: 'application/xml' });

        return {
            data: xmlContent,
            blob,
            filename: filename || 'architecture-diagram.drawio',
            mimeType: 'application/xml',
            size: blob.size
        };
    }

    /**
     * Export to JPG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToJPG(diagramData, options = {}) {
        const { quality = 0.9, width, height, filename } = options;
        
        // This would integrate with the ExportService from the main application
        // For now, we'll create a mock result
        const mockImageData = this.generateMockImageData(diagramData, { width, height });
        
        return {
            data: mockImageData,
            filename: filename || 'architecture-diagram.jpg',
            mimeType: 'image/jpeg',
            size: mockImageData.length,
            quality
        };
    }

    /**
     * Generate mock image data for testing
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Image options
     * @returns {string} Mock image data
     */
    generateMockImageData(diagramData, options = {}) {
        const { width = 800, height = 600 } = options;
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }

    /**
     * Generate SVG content
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - SVG options
     * @returns {string} SVG content
     */
    generateSVGContent(diagramData, options = {}) {
        const { width = 800, height = 600 } = options;
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16">
    Architecture Diagram (${diagramData.nodes?.length || 0} nodes, ${diagramData.connections?.length || 0} connections)
  </text>
</svg>`;
    }

    /**
     * Generate draw.io XML content
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - XML options
     * @returns {string} XML content
     */
    generateDrawioXML(diagramData, options = {}) {
        const { includeMetadata = true } = options;
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="MCP Tool" version="22.1.16" etag="xxx" type="device">
  <diagram name="Architecture Diagram" id="architecture-diagram">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />`;

        // Add nodes
        if (diagramData.nodes) {
            diagramData.nodes.forEach((node, index) => {
                xml += `
        <mxCell id="node-${index}" value="${node.label}" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="${node.position?.x || 100}" y="${node.position?.y || 100}" width="120" height="60" as="geometry" />
        </mxCell>`;
            });
        }

        // Add connections
        if (diagramData.connections) {
            diagramData.connections.forEach((connection, index) => {
                const sourceNode = diagramData.nodes?.find(n => n.id === connection.source);
                const targetNode = diagramData.nodes?.find(n => n.id === connection.target);
                
                if (sourceNode && targetNode) {
                    xml += `
        <mxCell id="conn-${index}" value="${connection.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="node-${diagramData.nodes.indexOf(sourceNode)}" target="node-${diagramData.nodes.indexOf(targetNode)}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`;
                }
            });
        }

        xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

        return xml;
    }
} 