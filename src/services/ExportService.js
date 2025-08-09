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
     * Export diagram to PNG format with transparency support
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} PNG export result
     */
    async exportToPNG(diagramData, options = {}) {
        const { 
            width, 
            height, 
            backgroundColor = 'transparent',
            quality = 1.0,
            filename = 'architecture-diagram.png',
            scale = 1,
            includeBackground = false
        } = options;

        try {
            const pngData = await this.generateImageFromDiagram(diagramData, {
                format: 'png',
                width: width,
                height: height,
                backgroundColor: includeBackground ? backgroundColor : 'transparent',
                quality,
                scale,
                includeBackground
            });

            // Calculate actual dimensions from bounds
            const bounds = this.calculateDiagramBounds(diagramData);
            const margin = 50;
            const actualWidth = width || (bounds.width + margin * 2);
            const actualHeight = height || (bounds.height + margin * 2);

            return {
                type: 'png',
                data: pngData,
                filename,
                mimeType: 'image/png',
                dimensions: { width: actualWidth * scale, height: actualHeight * scale },
                quality,
                scale
            };
        } catch (error) {
            throw new Error(`PNG export failed: ${error.message}`);
        }
    }

    /**
     * Export diagram to JPG format with quality settings
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} JPG export result
     */
    async exportToJPG(diagramData, options = {}) {
        const { 
            width, 
            height, 
            backgroundColor = '#ffffff',
            quality = 0.9,
            filename = 'architecture-diagram.jpg',
            scale = 1
        } = options;

        // Validate quality (0.6 to 1.0)
        const validatedQuality = Math.max(0.6, Math.min(1.0, quality));

        try {
            const jpgData = await this.generateImageFromDiagram(diagramData, {
                format: 'jpg',
                width: width,
                height: height,
                backgroundColor,
                quality: validatedQuality,
                scale
            });

            // Calculate actual dimensions from bounds
            const bounds = this.calculateDiagramBounds(diagramData);
            const margin = 50;
            const actualWidth = width || (bounds.width + margin * 2);
            const actualHeight = height || (bounds.height + margin * 2);

            return {
                type: 'jpg',
                data: jpgData,
                filename,
                mimeType: 'image/jpeg',
                dimensions: { width: actualWidth * scale, height: actualHeight * scale },
                quality: validatedQuality,
                scale
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
            width, 
            height, 
            backgroundColor = '#ffffff',
            filename = 'architecture-diagram.svg'
        } = options;

        try {
            const svgData = await this.generateImageFromDiagram(diagramData, {
                format: 'svg',
                width: width,
                height: height,
                backgroundColor
            });

            // Calculate actual dimensions from bounds
            const bounds = this.calculateDiagramBounds(diagramData);
            const margin = 50;
            const actualWidth = width || (bounds.width + margin * 2);
            const actualHeight = height || (bounds.height + margin * 2);

            return {
                type: 'svg',
                data: svgData,
                filename,
                mimeType: 'image/svg+xml',
                dimensions: { width: actualWidth, height: actualHeight }
            };
        } catch (error) {
            throw new Error(`SVG export failed: ${error.message}`);
        }
    }

    /**
     * Export diagram to Draw.io XML format
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Draw.io XML export result
     */
    async exportToDrawioXML(diagramData, options = {}) {
        const { includeMetadata = true, filename = 'architecture-diagram.drawio' } = options;

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
     * Generate image from diagram data using html-to-image
     * @param {Object} diagramData - Diagram data
     * @param {Object} options - Export options
     * @returns {Promise<string>} Base64 image data
     */
    async generateImageFromDiagram(diagramData, options = {}) {
        const { format, width, height, backgroundColor, quality, scale = 1, includeBackground = false } = options;
        
        try {
            // Find the React Flow container element - try multiple selectors
            let reactFlowContainer = document.querySelector('.react-flow__viewport') || 
                                   document.querySelector('[data-testid="rf__viewport"]') ||
                                   document.querySelector('.react-flow') ||
                                   document.querySelector('.react-flow__renderer');
            
            if (!reactFlowContainer) {
                // Try to find any element with react-flow classes
                reactFlowContainer = document.querySelector('[class*="react-flow"]');
            }
            
            if (!reactFlowContainer) {
                throw new Error('React Flow container not found. Please ensure the diagram is rendered.');
            }

            // Calculate diagram bounds from nodes and containers
            const bounds = this.calculateDiagramBounds(diagramData);
            
            // Add margin around the diagram
            const margin = 50;
            const diagramWidth = Math.max(bounds.width + margin * 2, 800);
            const diagramHeight = Math.max(bounds.height + margin * 2, 600);
            
            // Use provided dimensions or calculate from bounds
            const exportWidth = width || diagramWidth;
            const exportHeight = height || diagramHeight;

            // Create export options based on format with enhanced text quality
            const devicePixelRatio = window.devicePixelRatio || 1;
            const highQualityPixelRatio = Math.max(devicePixelRatio * 2, 3); // Minimum 3x for crisp text
            
            const exportOptions = {
                width: exportWidth * scale,
                height: exportHeight * scale,
                quality: quality || 1.0,
                pixelRatio: highQualityPixelRatio, // Enhanced pixel ratio for sharp text
                backgroundColor: includeBackground ? backgroundColor : undefined,
                style: {
                    transform: `translate(${-bounds.x + margin}px, ${-bounds.y + margin}px) scale(${scale})`,
                    transformOrigin: 'top left',
                    width: `${diagramWidth}px`,
                    height: `${diagramHeight}px`,
                    // Enhanced text rendering for crisp quality
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    fontVariantLigatures: 'none',
                    // Force high-quality rendering
                    imageRendering: 'crisp-edges'
                },
                filter: (node) => {
                    // Filter out unwanted elements during export
                    let classNameString = '';
                    
                    if (node.className) {
                        if (typeof node.className === 'string') {
                            classNameString = node.className;
                        } else if (node.className.toString) {
                            // Handle DOMTokenList or other objects
                            classNameString = node.className.toString();
                        } else {
                            classNameString = '';
                        }
                    }
                    
                    return !classNameString.includes('react-flow__controls') && 
                           !classNameString.includes('react-flow__minimap') &&
                           !classNameString.includes('react-flow__panel') &&
                           !classNameString.includes('export-exclude');
                }
            };

            let imageData;
            switch (format.toLowerCase()) {
                case 'png':
                    imageData = await toPng(reactFlowContainer, exportOptions);
                    break;
                case 'jpg':
                    imageData = await toJpeg(reactFlowContainer, exportOptions);
                    break;
                case 'svg':
                    imageData = await toSvg(reactFlowContainer, exportOptions);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            return imageData;
        } catch (error) {
            console.error('Image generation failed:', error);
            throw new Error(`Failed to generate ${format.toUpperCase()} image: ${error.message}`);
        }
    }

    /**
     * Calculate diagram bounds from nodes and containers
     * @param {Object} diagramData - Diagram data
     * @returns {Object} Bounds object with x, y, width, height
     */
    calculateDiagramBounds(diagramData) {
        const { nodes = [], containers = [] } = diagramData;
        
        if (nodes.length === 0 && containers.length === 0) {
            return { x: 0, y: 0, width: 800, height: 600 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        // Calculate bounds from nodes
        nodes.forEach(node => {
            if (node.position) {
                const nodeWidth = node.size?.width || node.__rf?.width || 150;
                const nodeHeight = node.size?.height || node.__rf?.height || 80;
                
                minX = Math.min(minX, node.position.x);
                minY = Math.min(minY, node.position.y);
                maxX = Math.max(maxX, node.position.x + nodeWidth);
                maxY = Math.max(maxY, node.position.y + nodeHeight);
            }
        });

        // Calculate bounds from containers
        containers.forEach(container => {
            if (container.position) {
                const containerWidth = container.size?.width || 400;
                const containerHeight = container.size?.height || 300;
                
                minX = Math.min(minX, container.position.x);
                minY = Math.min(minY, container.position.y);
                maxX = Math.max(maxX, container.position.x + containerWidth);
                maxY = Math.max(maxY, container.position.y + containerHeight);
            }
        });

        // Ensure we have valid bounds
        if (minX === Infinity) minX = 0;
        if (minY === Infinity) minY = 0;
        if (maxX === -Infinity) maxX = 800;
        if (maxY === -Infinity) maxY = 600;

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
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
            'triangle': 'triangle;whiteSpace=wrap;html=1;',
            'universalShape': 'rounded=1;whiteSpace=wrap;html=1;'
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
        
        if (!data) {
            throw new Error('No data to download');
        }

        // Create blob from data
        let blob;
        if (typeof data === 'string' && data.startsWith('data:')) {
            // Handle base64 data URLs
            const byteString = atob(data.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            blob = new Blob([ab], { type: mimeType });
        } else {
            // Handle string data
            blob = new Blob([data], { type: mimeType });
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Validate export options for a specific format
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Object} Validated options
     */
    validateExportOptions(format, options = {}) {
        const validatedOptions = { ...options };

        switch (format.toLowerCase()) {
            case 'png':
                validatedOptions.quality = Math.max(0.1, Math.min(1.0, options.quality || 1.0));
                validatedOptions.scale = Math.max(0.5, Math.min(4.0, options.scale || 1.0));
                break;
            case 'jpg':
                validatedOptions.quality = Math.max(0.6, Math.min(1.0, options.quality || 0.9));
                validatedOptions.scale = Math.max(0.5, Math.min(4.0, options.scale || 1.0));
                break;
            case 'svg':
                validatedOptions.scale = Math.max(0.5, Math.min(4.0, options.scale || 1.0));
                break;
        }

        return validatedOptions;
    }

    /**
     * Get format information
     * @param {string} format - Export format
     * @returns {Object} Format information
     */
    getFormatInfo(format) {
        const formatInfo = {
            png: {
                name: 'PNG',
                description: 'Portable Network Graphics with transparency support',
                mimeType: 'image/png',
                extensions: ['.png'],
                supportsTransparency: true,
                qualityRange: { min: 0.1, max: 1.0, default: 1.0 },
                scaleRange: { min: 0.5, max: 4.0, default: 1.0 }
            },
            jpg: {
                name: 'JPEG',
                description: 'Joint Photographic Experts Group format',
                mimeType: 'image/jpeg',
                extensions: ['.jpg', '.jpeg'],
                supportsTransparency: false,
                qualityRange: { min: 0.6, max: 1.0, default: 0.9 },
                scaleRange: { min: 0.5, max: 4.0, default: 1.0 }
            },
            svg: {
                name: 'SVG',
                description: 'Scalable Vector Graphics',
                mimeType: 'image/svg+xml',
                extensions: ['.svg'],
                supportsTransparency: true,
                qualityRange: { min: 0.1, max: 1.0, default: 1.0 },
                scaleRange: { min: 0.5, max: 4.0, default: 1.0 }
            },
            json: {
                name: 'JSON',
                description: 'JavaScript Object Notation',
                mimeType: 'application/json',
                extensions: ['.json'],
                supportsTransparency: false
            },
            drawio: {
                name: 'Draw.io XML',
                description: 'Draw.io compatible XML format',
                mimeType: 'application/xml',
                extensions: ['.drawio', '.xml'],
                supportsTransparency: false
            }
        };

        return formatInfo[format.toLowerCase()] || null;
    }
} 