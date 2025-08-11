import { BaseTool } from './BaseTool.js';

/**
 * Smart Layout Tool
 * Advanced layout algorithms with intelligent positioning and routing
 */
export class SmartLayoutTool extends BaseTool {
    constructor() {
        super();
        this.name = 'smart_layout';
        this.description = 'Apply intelligent layout algorithms with advanced positioning and smart routing';
    }

    getInputSchema() {
        return {
            type: 'object',
            properties: {
                diagram: {
                    type: 'object',
                    description: 'Diagram data to layout'
                },
                algorithm: {
                    type: 'string',
                    enum: ['hierarchical', 'force-directed', 'circular', 'grid', 'layered', 'organic', 'tree'],
                    default: 'hierarchical',
                    description: 'Layout algorithm to use'
                },
                direction: {
                    type: 'string',
                    enum: ['TB', 'BT', 'LR', 'RL'],
                    default: 'TB',
                    description: 'Layout direction (Top-Bottom, Bottom-Top, Left-Right, Right-Left)'
                },
                spacing: {
                    type: 'object',
                    properties: {
                        nodeSpacing: { type: 'number', default: 100 },
                        rankSpacing: { type: 'number', default: 150 },
                        containerPadding: { type: 'number', default: 40 }
                    }
                },
                constraints: {
                    type: 'object',
                    properties: {
                        preserveUserPositions: { type: 'boolean', default: false },
                        respectContainerBounds: { type: 'boolean', default: true },
                        minimizeEdgeCrossings: { type: 'boolean', default: true },
                        alignSimilarNodes: { type: 'boolean', default: true }
                    }
                },
                optimization: {
                    type: 'object',
                    properties: {
                        iterations: { type: 'number', default: 100 },
                        edgeLength: { type: 'number', default: 150 },
                        repulsion: { type: 'number', default: 1000 },
                        attraction: { type: 'number', default: 0.1 }
                    }
                }
            },
            required: ['diagram']
        };
    }

    async execute(args, session) {
        try {
            this.validateInput(args, this.getInputSchema());
            
            const { 
                diagram, 
                algorithm = 'hierarchical', 
                direction = 'TB',
                spacing = {},
                constraints = {},
                optimization = {}
            } = args;

            // Merge with defaults
            const layoutConfig = {
                algorithm,
                direction,
                spacing: { nodeSpacing: 100, rankSpacing: 150, containerPadding: 40, ...spacing },
                constraints: { 
                    preserveUserPositions: false, 
                    respectContainerBounds: true,
                    minimizeEdgeCrossings: true,
                    alignSimilarNodes: true,
                    ...constraints 
                },
                optimization: {
                    iterations: 100,
                    edgeLength: 150,
                    repulsion: 1000,
                    attraction: 0.1,
                    ...optimization
                }
            };

            // Create a copy of the diagram to avoid mutating the original
            const layoutDiagram = JSON.parse(JSON.stringify(diagram));

            // Apply the selected layout algorithm
            const layoutResult = await this.applyLayoutAlgorithm(layoutDiagram, layoutConfig);

            // Optimize routing for all connections
            await this.optimizeConnections(layoutResult.diagram, layoutConfig);

            // Adjust container sizes and positions
            await this.adjustContainers(layoutResult.diagram, layoutConfig);

            // Calculate layout metrics
            const metrics = await this.calculateLayoutMetrics(layoutResult.diagram);

            return this.createSuccessResponse({
                diagram: layoutResult.diagram,
                algorithm: layoutConfig.algorithm,
                metrics,
                optimizations: layoutResult.optimizations
            }, 'Smart layout applied successfully');

        } catch (error) {
            return this.createErrorResponse(error.message, { args });
        }
    }

    async applyLayoutAlgorithm(diagram, config) {
        const { algorithm } = config;
        
        switch (algorithm) {
            case 'hierarchical':
                return await this.applyHierarchicalLayout(diagram, config);
            case 'force-directed':
                return await this.applyForceDirectedLayout(diagram, config);
            case 'circular':
                return await this.applyCircularLayout(diagram, config);
            case 'grid':
                return await this.applyGridLayout(diagram, config);
            case 'layered':
                return await this.applyLayeredLayout(diagram, config);
            case 'organic':
                return await this.applyOrganicLayout(diagram, config);
            case 'tree':
                return await this.applyTreeLayout(diagram, config);
            default:
                throw new Error(`Unknown layout algorithm: ${algorithm}`);
        }
    }

    async applyHierarchicalLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const { direction, spacing } = config;

        // Build adjacency graph
        const graph = this.buildGraph(nodes, connections);
        
        // Detect layers using topological sorting
        const layers = this.detectLayers(graph);
        
        // Position nodes in layers
        const optimizations = [];
        
        if (direction === 'TB' || direction === 'BT') {
            // Top-to-bottom or bottom-to-top
            let currentY = 50;
            const yMultiplier = direction === 'BT' ? -1 : 1;
            
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                const layerWidth = layer.length * spacing.nodeSpacing;
                let currentX = -layerWidth / 2;
                
                // Sort layer nodes by connections to minimize crossings
                const sortedLayer = this.sortLayerNodes(layer, connections, i > 0 ? layers[i-1] : []);
                
                for (const nodeId of sortedLayer) {
                    const node = nodes.find(n => n.id === nodeId);
                    if (node) {
                        node.position = {
                            x: currentX + spacing.nodeSpacing / 2,
                            y: currentY * yMultiplier
                        };
                        currentX += spacing.nodeSpacing;
                    }
                }
                currentY += spacing.rankSpacing;
            }
            
            optimizations.push(`Organized ${layers.length} hierarchical layers`);
            
        } else {
            // Left-to-right or right-to-left
            let currentX = 50;
            const xMultiplier = direction === 'RL' ? -1 : 1;
            
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                const layerHeight = layer.length * spacing.nodeSpacing;
                let currentY = -layerHeight / 2;
                
                const sortedLayer = this.sortLayerNodes(layer, connections, i > 0 ? layers[i-1] : []);
                
                for (const nodeId of sortedLayer) {
                    const node = nodes.find(n => n.id === nodeId);
                    if (node) {
                        node.position = {
                            x: currentX * xMultiplier,
                            y: currentY + spacing.nodeSpacing / 2
                        };
                        currentY += spacing.nodeSpacing;
                    }
                }
                currentX += spacing.rankSpacing;
            }
            
            optimizations.push(`Organized ${layers.length} hierarchical layers`);
        }

        return { diagram, optimizations };
    }

    async applyForceDirectedLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const { optimization } = config;
        const optimizations = [];

        // Initialize random positions if needed
        nodes.forEach(node => {
            if (!node.position) {
                node.position = {
                    x: Math.random() * 800 - 400,
                    y: Math.random() * 600 - 300
                };
            }
        });

        // Force-directed simulation
        for (let iteration = 0; iteration < optimization.iterations; iteration++) {
            const forces = new Map();
            
            // Initialize forces
            nodes.forEach(node => {
                forces.set(node.id, { x: 0, y: 0 });
            });

            // Repulsive forces between all nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    
                    const dx = node2.position.x - node1.position.x;
                    const dy = node2.position.y - node1.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        const force = optimization.repulsion / (distance * distance);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        
                        const force1 = forces.get(node1.id);
                        const force2 = forces.get(node2.id);
                        
                        force1.x -= fx;
                        force1.y -= fy;
                        force2.x += fx;
                        force2.y += fy;
                    }
                }
            }

            // Attractive forces along connections
            connections.forEach(conn => {
                const sourceNode = nodes.find(n => n.id === conn.source);
                const targetNode = nodes.find(n => n.id === conn.target);
                
                if (sourceNode && targetNode) {
                    const dx = targetNode.position.x - sourceNode.position.x;
                    const dy = targetNode.position.y - sourceNode.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        const force = optimization.attraction * (distance - optimization.edgeLength);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        
                        const sourceForce = forces.get(sourceNode.id);
                        const targetForce = forces.get(targetNode.id);
                        
                        sourceForce.x += fx;
                        sourceForce.y += fy;
                        targetForce.x -= fx;
                        targetForce.y -= fy;
                    }
                }
            });

            // Apply forces with cooling
            const cooling = 1 - (iteration / optimization.iterations);
            const maxMove = 10 * cooling;
            
            nodes.forEach(node => {
                const force = forces.get(node.id);
                const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
                
                if (magnitude > 0) {
                    const move = Math.min(magnitude, maxMove);
                    node.position.x += (force.x / magnitude) * move;
                    node.position.y += (force.y / magnitude) * move;
                }
            });
        }

        optimizations.push(`Applied ${optimization.iterations} force-directed iterations`);
        
        return { diagram, optimizations };
    }

    async applyCircularLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const optimizations = [];

        if (nodes.length === 0) return { diagram, optimizations };

        // Calculate radius based on number of nodes
        const radius = Math.max(200, nodes.length * 20);
        const angleStep = (2 * Math.PI) / nodes.length;

        // Sort nodes by connection count for better distribution
        const sortedNodes = [...nodes].sort((a, b) => {
            const aConnections = connections.filter(c => c.source === a.id || c.target === a.id).length;
            const bConnections = connections.filter(c => c.source === b.id || c.target === b.id).length;
            return bConnections - aConnections;
        });

        // Position nodes in a circle
        sortedNodes.forEach((node, index) => {
            const angle = index * angleStep;
            node.position = {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            };
        });

        optimizations.push(`Arranged ${nodes.length} nodes in circular layout`);
        
        return { diagram, optimizations };
    }

    async applyGridLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const { spacing } = config;
        const optimizations = [];

        if (nodes.length === 0) return { diagram, optimizations };

        // Calculate grid dimensions
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const rows = Math.ceil(nodes.length / cols);

        // Position nodes in grid
        nodes.forEach((node, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            node.position = {
                x: col * spacing.nodeSpacing,
                y: row * spacing.nodeSpacing
            };
        });

        optimizations.push(`Arranged ${nodes.length} nodes in ${rows}x${cols} grid`);
        
        return { diagram, optimizations };
    }

    async applyLayeredLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const { spacing } = config;
        const optimizations = [];

        // Group nodes by type
        const nodesByType = new Map();
        nodes.forEach(node => {
            if (!nodesByType.has(node.type)) {
                nodesByType.set(node.type, []);
            }
            nodesByType.get(node.type).push(node);
        });

        // Position each type in a separate layer
        let currentY = 0;
        const typeOrder = ['ui', 'api', 'service', 'database'];
        
        for (const type of typeOrder) {
            if (nodesByType.has(type)) {
                const typeNodes = nodesByType.get(type);
                this.positionNodesInRow(typeNodes, currentY, spacing.nodeSpacing);
                currentY += spacing.rankSpacing;
                optimizations.push(`Positioned ${typeNodes.length} ${type} nodes`);
            }
        }

        // Position remaining types
        for (const [type, typeNodes] of nodesByType) {
            if (!typeOrder.includes(type)) {
                this.positionNodesInRow(typeNodes, currentY, spacing.nodeSpacing);
                currentY += spacing.rankSpacing;
                optimizations.push(`Positioned ${typeNodes.length} ${type} nodes`);
            }
        }

        return { diagram, optimizations };
    }

    async applyOrganicLayout(diagram, config) {
        // Similar to force-directed but with more organic clustering
        const result = await this.applyForceDirectedLayout(diagram, config);
        
        // Add clustering forces for related nodes
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        
        // Group related nodes closer together
        const clusters = this.detectClusters(nodes, connections);
        
        clusters.forEach(cluster => {
            if (cluster.length > 1) {
                // Calculate cluster center
                const centerX = cluster.reduce((sum, nodeId) => {
                    const node = nodes.find(n => n.id === nodeId);
                    return sum + (node ? node.position.x : 0);
                }, 0) / cluster.length;
                
                const centerY = cluster.reduce((sum, nodeId) => {
                    const node = nodes.find(n => n.id === nodeId);
                    return sum + (node ? node.position.y : 0);
                }, 0) / cluster.length;
                
                // Pull cluster nodes towards center
                cluster.forEach(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    if (node) {
                        node.position.x += (centerX - node.position.x) * 0.1;
                        node.position.y += (centerY - node.position.y) * 0.1;
                    }
                });
            }
        });

        result.optimizations.push(`Applied organic clustering to ${clusters.length} clusters`);
        
        return result;
    }

    async applyTreeLayout(diagram, config) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        const { direction, spacing } = config;
        const optimizations = [];

        // Find root nodes (nodes with no incoming connections)
        const incomingCount = new Map();
        nodes.forEach(node => incomingCount.set(node.id, 0));
        connections.forEach(conn => {
            incomingCount.set(conn.target, (incomingCount.get(conn.target) || 0) + 1);
        });

        const rootNodes = nodes.filter(node => incomingCount.get(node.id) === 0);
        
        if (rootNodes.length === 0) {
            // Fallback to hierarchical layout
            return await this.applyHierarchicalLayout(diagram, config);
        }

        // Build tree structure from each root
        const trees = rootNodes.map(root => this.buildTreeFromRoot(root, nodes, connections));
        
        // Position each tree
        let currentX = 0;
        
        trees.forEach((tree, treeIndex) => {
            const treeWidth = this.calculateTreeWidth(tree, spacing.nodeSpacing);
            this.positionTree(tree, currentX, 0, spacing, direction);
            currentX += treeWidth + spacing.nodeSpacing * 2;
            optimizations.push(`Positioned tree ${treeIndex + 1} with ${this.countTreeNodes(tree)} nodes`);
        });

        return { diagram, optimizations };
    }

    buildGraph(nodes, connections) {
        const graph = new Map();
        
        nodes.forEach(node => {
            graph.set(node.id, { incoming: [], outgoing: [] });
        });

        connections.forEach(conn => {
            if (graph.has(conn.source) && graph.has(conn.target)) {
                graph.get(conn.source).outgoing.push(conn.target);
                graph.get(conn.target).incoming.push(conn.source);
            }
        });

        return graph;
    }

    detectLayers(graph) {
        const layers = [];
        const visited = new Set();
        const inDegree = new Map();

        // Calculate in-degree for each node
        for (const [nodeId, node] of graph) {
            inDegree.set(nodeId, node.incoming.length);
        }

        // Topological sort to create layers
        while (visited.size < graph.size) {
            const currentLayer = [];
            
            // Find all nodes with in-degree 0
            for (const [nodeId, degree] of inDegree) {
                if (degree === 0 && !visited.has(nodeId)) {
                    currentLayer.push(nodeId);
                }
            }

            if (currentLayer.length === 0) {
                // Handle cycles by picking remaining nodes
                for (const [nodeId] of graph) {
                    if (!visited.has(nodeId)) {
                        currentLayer.push(nodeId);
                        break;
                    }
                }
            }

            // Add current layer and update degrees
            layers.push(currentLayer);
            
            currentLayer.forEach(nodeId => {
                visited.add(nodeId);
                const node = graph.get(nodeId);
                if (node) {
                    node.outgoing.forEach(targetId => {
                        if (inDegree.has(targetId)) {
                            inDegree.set(targetId, inDegree.get(targetId) - 1);
                        }
                    });
                }
            });
        }

        return layers;
    }

    sortLayerNodes(layer, connections, previousLayer) {
        if (previousLayer.length === 0) return layer;

        // Sort nodes to minimize edge crossings
        return layer.sort((a, b) => {
            const aConnections = connections.filter(c => 
                (c.source === a && previousLayer.includes(c.target)) ||
                (c.target === a && previousLayer.includes(c.source))
            );
            
            const bConnections = connections.filter(c => 
                (c.source === b && previousLayer.includes(c.target)) ||
                (c.target === b && previousLayer.includes(c.source))
            );

            // Calculate average position of connected nodes in previous layer
            const aAvgPos = aConnections.length > 0 ? 
                aConnections.reduce((sum, c) => {
                    const connectedNode = previousLayer.includes(c.source) ? c.source : c.target;
                    return sum + previousLayer.indexOf(connectedNode);
                }, 0) / aConnections.length : previousLayer.length / 2;

            const bAvgPos = bConnections.length > 0 ? 
                bConnections.reduce((sum, c) => {
                    const connectedNode = previousLayer.includes(c.source) ? c.source : c.target;
                    return sum + previousLayer.indexOf(connectedNode);
                }, 0) / bConnections.length : previousLayer.length / 2;

            return aAvgPos - bAvgPos;
        });
    }

    positionNodesInRow(nodes, y, spacing) {
        const totalWidth = (nodes.length - 1) * spacing;
        let currentX = -totalWidth / 2;

        nodes.forEach(node => {
            node.position = { x: currentX, y };
            currentX += spacing;
        });
    }

    detectClusters(nodes, connections) {
        // Simple clustering based on connection density
        const clusters = [];
        const visited = new Set();

        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const cluster = this.expandCluster(node.id, nodes, connections, visited);
                if (cluster.length > 1) {
                    clusters.push(cluster);
                }
            }
        });

        return clusters;
    }

    expandCluster(startNodeId, nodes, connections, visited) {
        const cluster = [startNodeId];
        const queue = [startNodeId];
        visited.add(startNodeId);

        while (queue.length > 0) {
            const currentNodeId = queue.shift();
            
            // Find connected nodes
            const connectedNodes = connections
                .filter(c => c.source === currentNodeId || c.target === currentNodeId)
                .map(c => c.source === currentNodeId ? c.target : c.source)
                .filter(nodeId => !visited.has(nodeId));

            connectedNodes.forEach(nodeId => {
                visited.add(nodeId);
                cluster.push(nodeId);
                queue.push(nodeId);
            });
        }

        return cluster;
    }

    buildTreeFromRoot(root, nodes, connections) {
        const tree = { node: root, children: [] };
        const visited = new Set([root.id]);

        const buildChildren = (parentTree) => {
            const children = connections
                .filter(c => c.source === parentTree.node.id)
                .map(c => nodes.find(n => n.id === c.target))
                .filter(node => node && !visited.has(node.id));

            children.forEach(child => {
                visited.add(child.id);
                const childTree = { node: child, children: [] };
                parentTree.children.push(childTree);
                buildChildren(childTree);
            });
        };

        buildChildren(tree);
        return tree;
    }

    calculateTreeWidth(tree, nodeSpacing) {
        if (tree.children.length === 0) return nodeSpacing;
        
        return tree.children.reduce((total, child) => {
            return total + this.calculateTreeWidth(child, nodeSpacing);
        }, 0);
    }

    positionTree(tree, startX, startY, spacing, direction) {
        const { nodeSpacing, rankSpacing } = spacing;
        
        if (direction === 'TB' || direction === 'BT') {
            // Top-to-bottom positioning
            tree.node.position = { x: startX, y: startY };
            
            if (tree.children.length > 0) {
                const childrenWidth = tree.children.length * nodeSpacing;
                let childX = startX - childrenWidth / 2 + nodeSpacing / 2;
                
                tree.children.forEach(child => {
                    this.positionTree(
                        child, 
                        childX, 
                        startY + (direction === 'BT' ? -rankSpacing : rankSpacing), 
                        spacing, 
                        direction
                    );
                    childX += nodeSpacing;
                });
            }
        } else {
            // Left-to-right positioning
            tree.node.position = { x: startX, y: startY };
            
            if (tree.children.length > 0) {
                const childrenHeight = tree.children.length * nodeSpacing;
                let childY = startY - childrenHeight / 2 + nodeSpacing / 2;
                
                tree.children.forEach(child => {
                    this.positionTree(
                        child, 
                        startX + (direction === 'RL' ? -rankSpacing : rankSpacing), 
                        childY, 
                        spacing, 
                        direction
                    );
                    childY += nodeSpacing;
                });
            }
        }
    }

    countTreeNodes(tree) {
        return 1 + tree.children.reduce((count, child) => count + this.countTreeNodes(child), 0);
    }

    async optimizeConnections(diagram, config) {
        const connections = diagram.connections || [];
        
        // Set all connections to use smart orthogonal routing for better appearance
        connections.forEach(connection => {
            if (!connection.type || connection.type === 'default') {
                connection.type = 'smart-orthogonal';
            }
            
            // Enable routing optimization
            if (!connection.routing) {
                connection.routing = {
                    algorithm: 'orthogonal',
                    avoidObstacles: true,
                    gridSnap: true,
                    jettyLength: 20
                };
            }
        });
    }

    async adjustContainers(diagram, config) {
        const containers = diagram.containers || [];
        const nodes = diagram.nodes || [];
        
        containers.forEach(container => {
            // Find nodes within this container
            const childNodes = nodes.filter(node => node.parentContainer === container.id);
            
            if (childNodes.length > 0) {
                // Calculate bounds of child nodes
                const bounds = this.calculateNodesBounds(childNodes);
                const padding = config.spacing.containerPadding;
                
                // Update container position and size
                container.position = {
                    x: bounds.minX - padding,
                    y: bounds.minY - padding
                };
                
                container.size = {
                    width: bounds.maxX - bounds.minX + 2 * padding,
                    height: bounds.maxY - bounds.minY + 2 * padding
                };
            }
        });
    }

    calculateNodesBounds(nodes) {
        if (nodes.length === 0) {
            return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            const nodeWidth = node.size?.width || 150;
            const nodeHeight = node.size?.height || 100;
            
            const left = node.position.x - nodeWidth / 2;
            const right = node.position.x + nodeWidth / 2;
            const top = node.position.y - nodeHeight / 2;
            const bottom = node.position.y + nodeHeight / 2;
            
            minX = Math.min(minX, left);
            minY = Math.min(minY, top);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
        });

        return { minX, minY, maxX, maxY };
    }

    async calculateLayoutMetrics(diagram) {
        const nodes = diagram.nodes || [];
        const connections = diagram.connections || [];
        
        // Calculate edge crossings
        const crossings = this.calculateEdgeCrossings(connections, nodes);
        
        // Calculate node distribution variance
        const distribution = this.calculateNodeDistribution(nodes);
        
        // Calculate average edge length
        const avgEdgeLength = this.calculateAverageEdgeLength(connections, nodes);
        
        return {
            edgeCrossings: crossings,
            nodeDistribution: {
                varianceX: distribution.varianceX,
                varianceY: distribution.varianceY
            },
            averageEdgeLength: avgEdgeLength,
            totalNodes: nodes.length,
            totalConnections: connections.length
        };
    }

    calculateEdgeCrossings(connections, nodes) {
        let crossings = 0;
        
        for (let i = 0; i < connections.length; i++) {
            for (let j = i + 1; j < connections.length; j++) {
                const edge1 = this.getEdgeCoordinates(connections[i], nodes);
                const edge2 = this.getEdgeCoordinates(connections[j], nodes);
                
                if (this.doEdgesCross(edge1, edge2)) {
                    crossings++;
                }
            }
        }
        
        return crossings;
    }

    getEdgeCoordinates(connection, nodes) {
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);
        
        return {
            x1: sourceNode?.position.x || 0,
            y1: sourceNode?.position.y || 0,
            x2: targetNode?.position.x || 0,
            y2: targetNode?.position.y || 0
        };
    }

    doEdgesCross(edge1, edge2) {
        // Check if two line segments intersect
        const { x1: a1, y1: a2, x2: a3, y2: a4 } = edge1;
        const { x1: b1, y1: b2, x2: b3, y2: b4 } = edge2;
        
        const denominator = (a1 - a3) * (b2 - b4) - (a2 - a4) * (b1 - b3);
        
        if (Math.abs(denominator) < 1e-10) return false; // Parallel or coincident
        
        const ua = ((b1 - b3) * (a2 - b2) - (b2 - b4) * (a1 - b1)) / denominator;
        const ub = ((a1 - a3) * (a2 - b2) - (a2 - a4) * (a1 - b1)) / denominator;
        
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    calculateNodeDistribution(nodes) {
        if (nodes.length === 0) return { varianceX: 0, varianceY: 0 };
        
        const avgX = nodes.reduce((sum, node) => sum + node.position.x, 0) / nodes.length;
        const avgY = nodes.reduce((sum, node) => sum + node.position.y, 0) / nodes.length;
        
        const varianceX = nodes.reduce((sum, node) => sum + Math.pow(node.position.x - avgX, 2), 0) / nodes.length;
        const varianceY = nodes.reduce((sum, node) => sum + Math.pow(node.position.y - avgY, 2), 0) / nodes.length;
        
        return { varianceX, varianceY };
    }

    calculateAverageEdgeLength(connections, nodes) {
        if (connections.length === 0) return 0;
        
        const totalLength = connections.reduce((sum, connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (sourceNode && targetNode) {
                const dx = targetNode.position.x - sourceNode.position.x;
                const dy = targetNode.position.y - sourceNode.position.y;
                return sum + Math.sqrt(dx * dx + dy * dy);
            }
            
            return sum;
        }, 0);
        
        return totalLength / connections.length;
    }
}