import { toPng, toJpeg, toSvg } from 'html-to-image';

export class ExportService {
    constructor() {
        this.exportFormats = new Map();
        this.setupDefaultFormats();
    }

    /**
     * Setup default export formats
     */
    setupDefaultFormats() {
        this.registerFormat('json', this.exportToJSON.bind(this));
        this.registerFormat('png', this.exportToPNG.bind(this));
        this.registerFormat('jpg', this.exportToJPG.bind(this));
        this.registerFormat('svg', this.exportToSVG.bind(this));
        this.registerFormat('drawio', this.exportToDrawioXML.bind(this));
    }

    /**
     * Register a new export format
     * @param {string} format - Format name
     * @param {Function} exporter - Export function
     */
    registerFormat(format, exporter) {
        this.exportFormats.set(format, exporter);
    }

    /**
     * Get available export formats
     * @returns {Array} Array of format names
     */
    getAvailableFormats() {
        return Array.from(this.exportFormats.keys());
    }

    /**
     * Export diagram to specified format
     * @param {Object} diagramData - Diagram data to export
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async export(diagramData, format, options = {}) {
        const exporter = this.exportFormats.get(format);
        
        if (!exporter) {
            throw new Error(`Export format '${format}' not supported`);
        }

        try {
            const result = await exporter(diagramData, options);
            return {
                success: true,
                data: result,
                format: format,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                format: format
            };
        }
    }

    /**
     * Export diagram to JSON format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} JSON export result
     */
    async exportToJSON(diagramData, options = {}) {
        const { includeMetadata = true, prettyPrint = true } = options;
        
        const exportData = {
            ...diagramData
        };

        if (includeMetadata) {
            exportData.metadata = {
                name: 'Architecture Diagram',
                description: 'Exported architecture diagram',
                version: '1.0',
                exportDate: new Date().toISOString(),
                exportFormat: 'json',
                ...options.metadata
            };
        }

        const jsonString = prettyPrint 
            ? JSON.stringify(exportData, null, 2)
            : JSON.stringify(exportData);

        return {
            type: 'json',
            data: jsonString,
            filename: options.filename || 'architecture-diagram.json',
            mimeType: 'application/json'
        };
    }

    /**
     * Export diagram to PNG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} PNG export result
     */
    async exportToPNG(diagramData, options = {}) {
        const { 
            width = 1920, 
            height = 1080, 
            backgroundColor = '#ffffff',
            quality = 1.0,
            filename = 'architecture-diagram.png'
        } = options;

        try {
            // This would need to be implemented with actual DOM manipulation
            // For now, we'll return a placeholder structure
            const pngData = await this.generateImageFromDiagram(diagramData, {
                format: 'png',
                width,
                height,
                backgroundColor,
                quality
            });

            return {
                type: 'png',
                data: pngData,
                filename,
                mimeType: 'image/png',
                dimensions: { width, height }
            };
        } catch (error) {
            throw new Error(`PNG export failed: ${error.message}`);
        }
    }

    /**
     * Export diagram to JPG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} JPG export result
     */
    async exportToJPG(diagramData, options = {}) {
        const { 
            width = 1920, 
            height = 1080, 
            backgroundColor = '#ffffff',
            quality = 0.9,
            filename = 'architecture-diagram.jpg'
        } = options;

        try {
            const jpgData = await this.generateImageFromDiagram(diagramData, {
                format: 'jpg',
                width,
                height,
                backgroundColor,
                quality
            });

            return {
                type: 'jpg',
                data: jpgData,
                filename,
                mimeType: 'image/jpeg',
                dimensions: { width, height }
            };
        } catch (error) {
            throw new Error(`JPG export failed: ${error.message}`);
        }
    }

    /**
     * Export diagram to SVG format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} SVG export result
     */
    async exportToSVG(diagramData, options = {}) {
        const { 
            width = 1920, 
            height = 1080, 
            backgroundColor = '#ffffff',
            filename = 'architecture-diagram.svg'
        } = options;

        try {
            const svgData = await this.generateImageFromDiagram(diagramData, {
                format: 'svg',
                width,
                height,
                backgroundColor
            });

            return {
                type: 'svg',
                data: svgData,
                filename,
                mimeType: 'image/svg+xml',
                dimensions: { width, height }
            };
        } catch (error) {
            throw new Error(`SVG export failed: ${error.message}`);
        }
    }

    /**
     * Export diagram to draw.io XML format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Draw.io XML export result
     */
    async exportToDrawioXML(diagramData, options = {}) {
        const { 
            filename = 'architecture-diagram.drawio',
            includeMetadata = true
        } = options;

        try {
            const xmlData = this.generateDrawioXML(diagramData, includeMetadata);

            return {
                type: 'drawio',
                data: xmlData,
                filename,
                mimeType: 'application/xml'
            };
        } catch (error) {
            throw new Error(`Draw.io XML export failed: ${error.message}`);
        }
    }

    /**
     * Generate image from diagram data
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Image generation options
     * @returns {Promise<string>} Base64 encoded image data
     */
    async generateImageFromDiagram(diagramData, options = {}) {
        const { format, width, height, backgroundColor, quality } = options;
        
        // This is a placeholder implementation
        // In a real implementation, you would:
        // 1. Create a temporary DOM element
        // 2. Render the diagram using React Flow
        // 3. Use html-to-image to capture the rendered diagram
        // 4. Return the base64 data
        
        // For now, we'll return a placeholder
        const placeholderData = `data:image/${format};base64,PLACEHOLDER_${format.toUpperCase()}_DATA`;
        
        return placeholderData;
    }

    /**
     * Generate draw.io XML from diagram data
     * @param {Object} diagramData - Diagram data
     * @param {boolean} includeMetadata - Whether to include metadata
     * @returns {string} Draw.io XML string
     */
    generateDrawioXML(diagramData, includeMetadata = true) {
        const { containers = [], nodes = [], connections = [] } = diagramData;
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Architecture Diagram Editor" version="1.0">
  <diagram name="Architecture Diagram" id="diagram1">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`;

        // Add containers
        containers.forEach(container => {
            const valueText = [container.label || '', container.description || ''].filter(Boolean).join('\n');
            xml += `
        <mxCell id="${container.id}" value="${valueText}" style="swimlane;fillColor=${container.color || '#ffffff'};strokeColor=${container.borderColor || '#000000'};strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="${container.position.x}" y="${container.position.y}" width="${container.size?.width || 400}" height="${container.size?.height || 300}" as="geometry"/>
        </mxCell>`;
        });

        // Add nodes
        nodes.forEach(node => {
            const shape = this.getDrawioShape(node.type);
            const valueText = [node.label || '', node.description || ''].filter(Boolean).join('\n');
            const parentId = node.parentContainer || '1';

            xml += `
        <mxCell id="${node.id}" value="${valueText}" style="${shape}fillColor=${node.color || '#ffffff'};strokeColor=${node.borderColor || '#000000'};strokeWidth=2;" vertex="1" parent="${parentId}">
          <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${node.size?.width || 120}" height="${node.size?.height || 80}" as="geometry"/>
        </mxCell>`;
        });

        // Add connections
        connections.forEach(connection => {
            const strokeWidth = connection.style?.strokeWidth || 2;
            const strokeColor = connection.style?.stroke || '#000000';
            const strokeDash = connection.style?.strokeDasharray ? 'dashed=1;' : '';

            xml += `
        <mxCell id="${connection.id}" value="${connection.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=${strokeWidth};strokeColor=${strokeColor};${strokeDash}" edge="1" parent="1" source="${connection.source}" target="${connection.target}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
        });

        xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

        return xml;
    }

    /**
     * Get draw.io shape style for node type
     * @param {string} nodeType - Node type
     * @returns {string} Draw.io shape style
     */
    getDrawioShape(nodeType) {
        const shapeMap = {
            'component': 'rounded=1;whiteSpace=wrap;html=1;',
            'container': 'swimlane;whiteSpace=wrap;html=1;',
            'diamond': 'rhombus;whiteSpace=wrap;html=1;',
            'circle': 'ellipse;whiteSpace=wrap;html=1;',
            'hexagon': 'shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;',
            'triangle': 'triangle;whiteSpace=wrap;html=1;'
        };

        return shapeMap[nodeType] || shapeMap['component'];
    }

    /**
     * Create download link for exported data
     * @param {Object} exportResult - Export result object
     * @returns {void}
     */
    createDownloadLink(exportResult) {
        const { data, filename, mimeType } = exportResult;
        
        let dataUri;
        if (mimeType.startsWith('image/')) {
            dataUri = data; // Already base64 encoded
        } else {
            dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(data)}`;
        }

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', filename);
        linkElement.click();
    }

    /**
     * Validate export options
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {boolean} True if valid
     */
    validateExportOptions(format, options) {
        const validFormats = this.getAvailableFormats();
        
        if (!validFormats.includes(format)) {
            throw new Error(`Invalid export format: ${format}`);
        }

        // Validate image-specific options
        if (['png', 'jpg', 'svg'].includes(format)) {
            const { width, height } = options;
            if (width && (width < 100 || width > 10000)) {
                throw new Error('Width must be between 100 and 10000');
            }
            if (height && (height < 100 || height > 10000)) {
                throw new Error('Height must be between 100 and 10000');
            }
        }

        return true;
    }

    /**
     * Get export format information
     * @param {string} format - Export format
     * @returns {Object} Format information
     */
    getFormatInfo(format) {
        const formatInfo = {
            json: {
                name: 'JSON',
                description: 'JavaScript Object Notation format',
                mimeType: 'application/json',
                extension: '.json'
            },
            png: {
                name: 'PNG',
                description: 'Portable Network Graphics image format',
                mimeType: 'image/png',
                extension: '.png'
            },
            jpg: {
                name: 'JPEG',
                description: 'Joint Photographic Experts Group image format',
                mimeType: 'image/jpeg',
                extension: '.jpg'
            },
            svg: {
                name: 'SVG',
                description: 'Scalable Vector Graphics format',
                mimeType: 'image/svg+xml',
                extension: '.svg'
            },
            drawio: {
                name: 'Draw.io XML',
                description: 'Draw.io compatible XML format',
                mimeType: 'application/xml',
                extension: '.drawio'
            }
        };

        return formatInfo[format] || null;
    }
} 