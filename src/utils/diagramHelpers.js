/**
 * Get the bounding box of all nodes in the diagram
 */
export const getDiagramBounds = (nodes) => {
    if (nodes.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
        const x = node.position?.x || 0;
        const y = node.position?.y || 0;
        const width = node.style?.width || node.width || 150;
        const height = node.style?.height || node.height || 80;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
};

/**
 * Migrate edges to use enhanced orthogonal edge functionality
 */
export const migrateEdgesToEnhanced = (edges) => {
    return edges.map(edge => {
        // Ensure all edges use enhanced type for Draw.io-style functionality
        const migratedEdge = {
            ...edge,
            type: 'enhanced',
            style: {
                ...edge.style,
                stroke: edge.style?.stroke || '#2563eb',
                strokeWidth: edge.style?.strokeWidth || 2
            },
            data: {
                ...edge.data,
                waypoints: edge.data?.waypoints || (edge.data?.control ? [edge.data.control] : []),
                intersection: edge.data?.intersection || 'none'
            }
        };
        return migratedEdge;
    });
};
