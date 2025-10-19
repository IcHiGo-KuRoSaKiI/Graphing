import { useCallback } from 'react';
import useDiagramStore from '../store/diagramStore';

/**
 * Custom hook for all import/export functionality
 * Extracted from ArchitectureDiagramEditorContent to reduce component bloat
 */
export const useImportExport = ({
    serviceFactory,
    isServiceInitialized,
    reactFlowToJson,
    jsonToReactFlow,
    migrateEdgesToEnhanced,
    handleNodeLabelChange,
    saveToHistory,
    updateNodeInternals,
    fitView,
    applyAutoLayout,
    currentLayoutAlgorithm,
    setIsInitialized,
    reactFlowWrapper,
    getDiagramBounds
}) => {
    // Get state and actions from Zustand
    const nodes = useDiagramStore(state => state.nodes);
    const edges = useDiagramStore(state => state.edges);
    const setNodes = useDiagramStore(state => state.setNodes);
    const setEdges = useDiagramStore(state => state.setEdges);
    const setSelectedElements = useDiagramStore(state => state.setSelectedElements);
    const showConfirmModal = useDiagramStore(state => state.showConfirmModal);
    const closeModal = useDiagramStore(state => state.closeModal);

    // ========================================
    // EXPORT FUNCTIONS
    // ========================================

    /**
     * Export diagram as JSON
     */
    const exportJSON = useCallback(async () => {
        if (!serviceFactory || !isServiceInitialized) {
            // Fallback to old method
            const diagramData = {
                metadata: {
                    name: 'Architecture Diagram',
                    description: 'Exported architecture diagram',
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                },
                containers: nodes
                    .filter((node) => node.type === 'container')
                    .map((container) => ({
                        id: container.id,
                        label: container.data.label,
                        position: container.position,
                        size: {
                            width: container.style?.width || 400,
                            height: container.style?.height || 300,
                        },
                        color: container.data.color,
                        bgColor: container.data.bgColor,
                        borderColor: container.data.borderColor,
                        icon: container.data.icon,
                        description: container.data.description,
                        zIndex: container.zIndex || 1
                    })),
                nodes: nodes
                    .filter((node) => node.type !== 'container')
                    .map((node) => ({
                        id: node.id,
                        label: node.data.label,
                        type: node.type,
                        position: node.position,
                        parentContainer: node.parentNode,
                        size: {
                            width: node.style?.width || 150,
                            height: node.style?.height || 80,
                        },
                        color: node.data.color,
                        borderColor: node.data.borderColor,
                        icon: node.data.icon,
                        description: node.data.description,
                        zIndex: node.zIndex || 10
                    })),
                connections: edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.data?.label,
                    type: edge.type,
                    animated: edge.animated,
                    description: edge.data?.description,
                    waypoints: edge.data?.waypoints,
                    markerStart: edge.markerStart,
                    markerEnd: edge.markerEnd,
                    intersection: edge.data?.intersection,
                    style: {
                        strokeWidth: edge.style?.strokeWidth || 2,
                        strokeDasharray: edge.style?.strokeDasharray,
                    },
                    zIndex: edge.zIndex || 5
                })),
            };

            const dataStr = JSON.stringify(diagramData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = 'architecture-diagram.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, 'json', {
                filename: 'architecture-diagram.json',
                prettyPrint: true
            });

            if (result.success) {
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', result.dataUri);
                linkElement.setAttribute('download', result.filename);
                linkElement.click();
            } else {
                alert('Export failed. Please try again.');
            }
        } catch (error) {
            alert('Error exporting diagram. Please try again.');
        }
    }, [nodes, edges, serviceFactory, isServiceInitialized, reactFlowToJson]);

    /**
     * Export diagram to Draw.io XML format
     */
    const exportToDrawioXML = useCallback(async () => {
        if (!serviceFactory || !isServiceInitialized) {
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, 'drawio', {
                filename: 'architecture-diagram.drawio'
            });

            if (result.success) {
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', result.dataUri);
                linkElement.setAttribute('download', result.filename);
                linkElement.click();
            } else {
                alert('Export failed. Please try again.');
            }
        } catch (error) {
            alert('Error exporting diagram. Please try again.');
        }
    }, [nodes, edges, serviceFactory, isServiceInitialized, reactFlowToJson]);

    /**
     * Export diagram as image (PNG, JPG, SVG)
     */
    const exportImage = useCallback(async (type) => {
        if (!serviceFactory || !isServiceInitialized) {
            if (!reactFlowWrapper.current) return;
            const renderer = reactFlowWrapper.current.querySelector('.react-flow__renderer') || reactFlowWrapper.current;
            const isDark = !!reactFlowWrapper.current.closest('.dark');
            const bounds = getDiagramBounds();
            const margin = 20;
            const width = bounds.width + margin * 2;
            const height = bounds.height + margin * 2;
            const common = {
                cacheBust: true,
                backgroundColor: isDark ? '#111111' : '#ffffff',
                width,
                height,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${-bounds.x + margin}px, ${-bounds.y + margin}px)`
                }
            };
            // Fallback image export not available without service layer
            alert('Image export not available. Please try again later.');
            return;
        }

        try {
            const diagramData = reactFlowToJson(nodes, edges);
            const result = await serviceFactory.exportDiagram(diagramData, type, {
                filename: `diagram.${type}`,
                backgroundColor: reactFlowWrapper.current?.closest('.dark') ? '#111111' : '#ffffff',
                margin: 20
            });

            if (result.success) {
                const link = document.createElement('a');
                link.download = result.filename;
                link.href = result.dataUri;
                link.click();
            } else {
                alert('Image export failed. Please try again.');
            }
        } catch (error) {
            alert('Error exporting image. Please try again.');
        }
    }, [getDiagramBounds, serviceFactory, isServiceInitialized, nodes, edges, reactFlowToJson, reactFlowWrapper]);

    const exportAsPNG = useCallback(() => exportImage("png"), [exportImage]);
    const exportAsJPG = useCallback(() => exportImage('jpg'), [exportImage]);
    const exportAsSVG = useCallback(() => exportImage('svg'), [exportImage]);

    // ========================================
    // IMPORT FUNCTIONS
    // ========================================

    /**
     * Import diagram from JSON file
     */
    const importDiagram = useCallback(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = '.json';
        inputElement.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(importedData);
                        // Migrate edges to ensure waypoint functionality
                        const migratedEdges = migrateEdgesToEnhanced(importedEdges);

                        // Set nodes and edges directly - positions are already in the JSON
                        setNodes(importedNodes);
                        setEdges(migratedEdges);

                        // Update node internals for proper rendering
                        importedNodes.forEach(n => updateNodeInternals(n.id));

                        saveToHistory();
                    } catch (error) {
                        alert('Error importing diagram. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        inputElement.click();
    }, [jsonToReactFlow, saveToHistory, migrateEdgesToEnhanced, setNodes, setEdges, updateNodeInternals]);

    /**
     * Import diagram from Draw.io XML file
     */
    const importFromDrawioXML = useCallback(() => {
        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.accept = '.drawio,.xml';
        inputElement.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const xmlContent = e.target.result;
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

                        const cells = xmlDoc.querySelectorAll('mxCell');

                        const tempNodes = [];
                        const tempEdges = [];

                        cells.forEach(cell => {
                            const id = cell.getAttribute('id');
                            if (id === '0' || id === '1') return; // skip root

                            const value = cell.getAttribute('value') || '';
                            const style = cell.getAttribute('style') || '';
                            const vertex = cell.getAttribute('vertex');
                            const edge = cell.getAttribute('edge');

                            const geometry = cell.querySelector('mxGeometry');
                            if (!geometry) return;

                            const x = parseFloat(geometry.getAttribute('x')) || 0;
                            const y = parseFloat(geometry.getAttribute('y')) || 0;
                            const width = parseFloat(geometry.getAttribute('width')) || 120;
                            const height = parseFloat(geometry.getAttribute('height')) || 80;

                            if (vertex) {
                                tempNodes.push({
                                    oldId: id,
                                    value,
                                    style,
                                    x,
                                    y,
                                    width,
                                    height,
                                    parent: cell.getAttribute('parent')
                                });
                            } else if (edge) {
                                tempEdges.push({
                                    oldId: id,
                                    value,
                                    style,
                                    source: cell.getAttribute('source'),
                                    target: cell.getAttribute('target')
                                });
                            }
                        });

                        const cellIdMap = new Map();
                        const importedNodes = [];

                        tempNodes.forEach(n => {
                            const newId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            cellIdMap.set(n.oldId, newId);

                            let nodeType = 'component';
                            if (n.style.includes('swimlane')) nodeType = 'container';
                            else if (n.style.includes('rhombus')) nodeType = 'diamond';
                            else if (n.style.includes('ellipse')) nodeType = 'circle';
                            else if (n.style.includes('hexagon')) nodeType = 'hexagon';
                            else if (n.style.includes('triangle')) nodeType = 'triangle';

                            const fillColorMatch = n.style.match(/fillColor=([^;]+)/);
                            const strokeColorMatch = n.style.match(/strokeColor=([^;]+)/);
                            const fillColor = fillColorMatch ? fillColorMatch[1] : '#ffffff';
                            const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';

                            const [firstLine, ...restLines] = n.value.split('\n');
                            importedNodes.push({
                                id: newId,
                                type: nodeType,
                                position: { x: n.x, y: n.y },
                                data: {
                                    label: firstLine,
                                    color: fillColor,
                                    borderColor: strokeColor,
                                    icon: nodeType === 'container' ? '📦' : '🔹',
                                    description: restLines.join('\n'),
                                    onLabelChange: handleNodeLabelChange
                                },
                                style: {
                                    width: n.width,
                                    height: n.height,
                                    zIndex: nodeType === 'container' ? 1 : 10
                                },
                                draggable: true,
                                selectable: true,
                                zIndex: nodeType === 'container' ? 1 : 10,
                                __parentOldId: n.parent
                            });
                        });

                        importedNodes.forEach(node => {
                            if (node.__parentOldId && cellIdMap.has(node.__parentOldId)) {
                                node.parentNode = cellIdMap.get(node.__parentOldId);
                            }
                            delete node.__parentOldId;
                        });

                        const importedEdges = tempEdges.map(e => {
                            const strokeWidthMatch = e.style.match(/strokeWidth=([^;]+)/);
                            const strokeColorMatch = e.style.match(/strokeColor=([^;]+)/);
                            const strokeWidth = strokeWidthMatch ? parseInt(strokeWidthMatch[1]) : 2;
                            const strokeColor = strokeColorMatch ? strokeColorMatch[1] : '#000000';
                            const isDashed = e.style.includes('dashed=1');

                            return {
                                id: `imported-edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                source: cellIdMap.get(e.source) || e.source,
                                target: cellIdMap.get(e.target) || e.target,
                                label: e.value,
                                type: 'smoothstep',
                                animated: false,
                                style: {
                                    strokeWidth,
                                    stroke: strokeColor,
                                    strokeDasharray: isDashed ? '5,5' : undefined,
                                    zIndex: 5
                                },
                                zIndex: 5,
                                data: { label: e.value, description: '' }
                            };
                        });

                        const nodeMap = Object.fromEntries(importedNodes.map(n => [n.id, n]));
                        const filteredEdges = [];
                        importedEdges.forEach(edge => {
                            const s = nodeMap[edge.source];
                            const t = nodeMap[edge.target];
                            if (s && t && s.type === 'container' && t.type === 'container') {
                                t.parentNode = s.id;
                                t.position = {
                                    x: t.position.x - s.position.x,
                                    y: t.position.y - s.position.y
                                };
                            } else {
                                filteredEdges.push(edge);
                            }
                        });

                        setNodes(importedNodes);
                        setEdges(filteredEdges);
                        saveToHistory();

                    } catch (error) {
                        alert('Error importing draw.io file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        inputElement.click();
    }, [handleNodeLabelChange, saveToHistory, setNodes, setEdges]);

    /**
     * Import diagram from JSON object (used by paste modal)
     */
    const importDiagramObject = useCallback(async (data) => {

        if (!serviceFactory || !isServiceInitialized) {
            // Simple validation fallback
            if (!data || !data.containers || !data.nodes || !data.connections) {
                alert('Invalid diagram JSON');
                throw new Error('Invalid diagram JSON');
            }

            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);

            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToEnhanced(importedEdges);

            // Set nodes and edges directly - positions are already in the JSON
            setNodes(importedNodes);
            setEdges(migratedEdges);

            // Verify store was updated

            // Update node internals for proper rendering
            importedNodes.forEach(n => updateNodeInternals(n.id));

            // Apply auto-layout to organize imported nodes
            await applyAutoLayout(importedNodes, currentLayoutAlgorithm);

            // Fit view to show all imported nodes
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 300 });
            }, 100);

            setIsInitialized(true);

            saveToHistory();
            return;
        }

        try {
            // Validate the diagram data
            await serviceFactory.validateDiagram(data);

            // If validation passes, import the diagram
            const { nodes: importedNodes, edges: importedEdges } = jsonToReactFlow(data);

            // Migrate edges to ensure waypoint functionality
            const migratedEdges = migrateEdgesToEnhanced(importedEdges);

            // Set nodes and edges directly - positions are already in the JSON
            setNodes(importedNodes);
            setEdges(migratedEdges);

            // Verify store was updated

            // Update node internals for proper rendering
            importedNodes.forEach(n => updateNodeInternals(n.id));

            // Apply auto-layout to organize imported nodes
            await applyAutoLayout(importedNodes, currentLayoutAlgorithm);

            // Fit view to show all imported nodes
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 300 });
            }, 100);

            setIsInitialized(true);

            saveToHistory();
        } catch (error) {
            alert('Error importing diagram: ' + error.message);
            throw error;
        }
    }, [jsonToReactFlow, saveToHistory, migrateEdgesToEnhanced, serviceFactory, isServiceInitialized, setNodes, setEdges, updateNodeInternals, fitView, applyAutoLayout, currentLayoutAlgorithm, setIsInitialized]);

    /**
     * Handle JSON paste import (wrapper for importDiagramObject)
     */
    const handleJsonPasteImport = useCallback(async (data) => {
        try {
            await importDiagramObject(data);
            closeModal('jsonPaste');
        } catch (error) {
            // Don't close modal on error so user can see the error and try again
            throw error;
        }
    }, [importDiagramObject, closeModal]);

    // ========================================
    // VALIDATION
    // ========================================

    /**
     * Validate JSON diagram data
     */
    const validateJson = useCallback(async (data) => {
        if (!serviceFactory || !isServiceInitialized) {
            // Simple validation fallback
            const valid = data && data.containers && data.nodes && data.connections;
            const errors = valid ? [] : ['Invalid diagram structure'];
            return { valid, errors };
        }

        try {
            // Validate the diagram data
            await serviceFactory.validateDiagram(data);
            return {
                valid: true,
                errors: []
            };
        } catch (error) {
            return {
                valid: false,
                errors: [error.message]
            };
        }
    }, [serviceFactory, isServiceInitialized]);

    // ========================================
    // DIAGRAM OPERATIONS
    // ========================================

    /**
     * Create new diagram
     */
    const newDiagram = useCallback(() => {
        showConfirmModal(
            'New Diagram',
            'Are you sure you want to create a new diagram? All unsaved changes will be lost.',
            () => {
                applyAutoLayout([], 'circular');
                setEdges([]);
                setSelectedElements({ nodes: [], edges: [] });
                saveToHistory();
            }
        );
    }, [applyAutoLayout, saveToHistory, showConfirmModal, setEdges, setSelectedElements]);

    /**
     * Save diagram (alias for exportJSON)
     */
    const saveDiagram = useCallback(() => {
        exportJSON();
    }, [exportJSON]);

    /**
     * Save As diagram (alias for exportJSON)
     */
    const saveAsDiagram = useCallback(() => {
        exportJSON();
    }, [exportJSON]);

    /**
     * Open diagram (alias for importDiagram)
     */
    const openDiagram = useCallback(() => {
        importDiagram();
    }, [importDiagram]);

    /**
     * Get diagram data for export modal
     */
    const getDiagramDataForExport = useCallback(() => {
        return {
            nodes,
            edges,
            containers: nodes.filter(node => node.type === 'container'),
            connections: edges,
            metadata: {
                name: 'Architecture Diagram',
                description: 'Exported architecture diagram',
                version: '1.0',
                exportDate: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length
            }
        };
    }, [nodes, edges]);

    // ========================================
    // RETURN ALL FUNCTIONS
    // ========================================

    return {
        // Export functions
        exportJSON,
        exportToDrawioXML,
        exportImage,
        exportAsPNG,
        exportAsJPG,
        exportAsSVG,

        // Import functions
        importDiagram,
        importFromDrawioXML,
        importDiagramObject,
        handleJsonPasteImport,

        // Validation
        validateJson,

        // Diagram operations
        newDiagram,
        saveDiagram,
        saveAsDiagram,
        openDiagram,
        getDiagramDataForExport
    };
};
