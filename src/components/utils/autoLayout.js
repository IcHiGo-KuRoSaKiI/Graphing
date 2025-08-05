/**
 * Enhanced Auto Layout System - Based on draw.io's spacing algorithms
 * Prevents node overlap and maintains proper spacing using collision detection
 */

/**
 * Check if two rectangles overlap with optional margin
 */
const rectanglesOverlap = (rect1, rect2, margin = 0) => {
  return !(
    rect1.x + rect1.width + margin <= rect2.x ||
    rect2.x + rect2.width + margin <= rect1.x ||
    rect1.y + rect1.height + margin <= rect2.y ||
    rect2.y + rect2.height + margin <= rect1.y
  );
};

/**
 * Calculate dynamic spacing based on node dimensions (draw.io approach)
 */
const calculateDynamicSpacing = (nodeWidth, nodeHeight, baseSpacing = 20) => {
  // Use larger dimension + percentage for dynamic spacing
  const maxDimension = Math.max(nodeWidth, nodeHeight);
  return Math.max(baseSpacing, maxDimension * 0.3);
};

/**
 * Smart layout algorithm selection based on graph structure
 */
const selectLayoutAlgorithm = (nodes) => {
  const containers = nodes.filter(n => n.type === 'container');
  const components = nodes.filter(n => n.type === 'component');
  const totalNodes = nodes.length;
  
  // Hierarchical for container-heavy structures
  if (containers.length > components.length) {
    return 'hierarchical';
  }
  
  // Grid for many small components
  if (totalNodes > 15 && components.length > containers.length * 3) {
    return 'grid';
  }
  
  // Force-directed for mixed structures
  if (totalNodes > 5 && totalNodes <= 15) {
    return 'force';
  }
  
  // Smart circular for smaller sets
  return 'smart-circular';
};

/**
 * Hierarchical Layout (draw.io style) - Enhanced
 */
const hierarchicalLayout = (nodes, viewportWidth = 1400, viewportHeight = 800) => {
  const containers = nodes.filter(n => n.type === 'container' && !n.parentNode);
  const components = nodes.filter(n => n.type === 'component' && !n.parentNode);
  
  // Layout parameters based on draw.io
  const intraCellSpacing = 80; // Increased horizontal spacing
  const interRankCellSpacing = 140; // Increased vertical spacing
  const margin = 60;
  
  let currentY = margin;
  
  // For containers, use intelligent multi-row layout
  if (containers.length > 0) {
    // Calculate optimal layout grid for containers
    const containerWidths = containers.map(c => c.style?.width || 300);
    const containerHeights = containers.map(c => c.style?.height || 200);
    const avgWidth = containerWidths.reduce((a, b) => a + b, 0) / containerWidths.length;
    const maxWidth = Math.max(...containerWidths);
    
    // Determine containers per row based on viewport and container sizes
    const minSpacingNeeded = maxWidth + intraCellSpacing;
    const maxContainersPerRow = Math.max(2, Math.floor((viewportWidth - 2 * margin) / minSpacingNeeded));
    const containersPerRow = Math.min(maxContainersPerRow, Math.ceil(Math.sqrt(containers.length)));
    
    let currentX = margin;
    let rowMaxHeight = 0;
    
    containers.forEach((container, idx) => {
      // Start new row if needed
      if (idx > 0 && idx % containersPerRow === 0) {
        currentY += rowMaxHeight + interRankCellSpacing;
        currentX = margin;
        rowMaxHeight = 0;
      }
      
      const containerWidth = container.style?.width || 300;
      const containerHeight = container.style?.height || 200;
      const spacing = calculateDynamicSpacing(containerWidth, containerHeight, intraCellSpacing);
      
      container.position = { x: currentX, y: currentY };
      currentX += containerWidth + spacing;
      rowMaxHeight = Math.max(rowMaxHeight, containerHeight);
    });
    
    // Move Y position for next level
    currentY += rowMaxHeight + interRankCellSpacing;
  }
  
  // For components, use grid layout with proper spacing
  if (components.length > 0) {
    const componentWidths = components.map(c => c.style?.width || 200);
    const componentHeights = components.map(c => c.style?.height || 100);
    const avgCompWidth = componentWidths.reduce((a, b) => a + b, 0) / componentWidths.length;
    const maxCompWidth = Math.max(...componentWidths);
    
    const minCompSpacing = maxCompWidth + intraCellSpacing;
    const maxComponentsPerRow = Math.max(3, Math.floor((viewportWidth - 2 * margin) / minCompSpacing));
    const componentsPerRow = Math.min(maxComponentsPerRow, Math.ceil(Math.sqrt(components.length)));
    
    let currentX = margin;
    let rowMaxHeight = 0;
    
    components.forEach((component, idx) => {
      // Start new row if needed
      if (idx > 0 && idx % componentsPerRow === 0) {
        currentY += rowMaxHeight + 100; // Smaller spacing for components
        currentX = margin;
        rowMaxHeight = 0;
      }
      
      const componentWidth = component.style?.width || 200;
      const componentHeight = component.style?.height || 100;
      const spacing = calculateDynamicSpacing(componentWidth, componentHeight, intraCellSpacing);
      
      component.position = { x: currentX, y: currentY };
      currentX += componentWidth + spacing;
      rowMaxHeight = Math.max(rowMaxHeight, componentHeight);
    });
  }
  
  return nodes;
};

/**
 * Smart Grid Layout with collision detection
 */
const gridLayout = (nodes, viewportWidth = 1400, viewportHeight = 800) => {
  const margin = 50;
  const baseSpacing = 40;
  
  // Sort nodes by size (larger first)
  const sortedNodes = [...nodes].sort((a, b) => {
    const aSize = (a.style?.width || 150) * (a.style?.height || 100);
    const bSize = (b.style?.width || 150) * (b.style?.height || 100);
    return bSize - aSize;
  });
  
  // Calculate optimal grid dimensions
  const avgWidth = sortedNodes.reduce((sum, n) => sum + (n.style?.width || 150), 0) / sortedNodes.length;
  const avgHeight = sortedNodes.reduce((sum, n) => sum + (n.style?.height || 100), 0) / sortedNodes.length;
  
  const cols = Math.max(2, Math.floor((viewportWidth - 2 * margin) / (avgWidth + baseSpacing)));
  const rows = Math.ceil(sortedNodes.length / cols);
  
  sortedNodes.forEach((node, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    
    const nodeWidth = node.style?.width || 150;
    const nodeHeight = node.style?.height || 100;
    const spacing = calculateDynamicSpacing(nodeWidth, nodeHeight, baseSpacing);
    
    node.position = {
      x: margin + col * (avgWidth + spacing),
      y: margin + row * (avgHeight + spacing)
    };
  });
  
  return sortedNodes;
};

/**
 * Force-directed layout with collision avoidance (WebCola inspired)
 */
const forceDirectedLayout = (nodes, viewportWidth = 1400, viewportHeight = 800) => {
  const center = { x: viewportWidth / 2, y: viewportHeight / 2 };
  const iterations = 50;
  const cellSpacing = 30; // Base collision margin
  
  // Initialize positions randomly but avoid edges
  nodes.forEach(node => {
    if (!node.position) {
      node.position = {
        x: 100 + Math.random() * (viewportWidth - 200),
        y: 100 + Math.random() * (viewportHeight - 200)
      };
    }
  });
  
  // Force-directed simulation with collision detection
  for (let iter = 0; iter < iterations; iter++) {
    const forces = nodes.map(() => ({ x: 0, y: 0 }));
    
    // Repulsion forces (prevent overlap)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const dx = node2.position.x - node1.position.x;
        const dy = node2.position.y - node1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Calculate minimum safe distance
        const w1 = node1.style?.width || 150;
        const h1 = node1.style?.height || 100;
        const w2 = node2.style?.width || 150;  
        const h2 = node2.style?.height || 100;
        const minDistance = Math.max(w1, h1, w2, h2) / 2 + cellSpacing;
        
        if (distance < minDistance * 2) {
          const force = (minDistance * 2 - distance) / distance * 0.1;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          forces[i].x -= fx;
          forces[i].y -= fy;
          forces[j].x += fx;
          forces[j].y += fy;
        }
      }
      
      // Attraction to center (weak)
      const centerAttraction = 0.01;
      forces[i].x += (center.x - nodes[i].position.x) * centerAttraction;
      forces[i].y += (center.y - nodes[i].position.y) * centerAttraction;
    }
    
    // Apply forces with damping
    const damping = 0.8;
    nodes.forEach((node, i) => {
      node.position.x += forces[i].x * damping;
      node.position.y += forces[i].y * damping;
      
      // Keep within viewport bounds
      const nodeWidth = node.style?.width || 150;
      const nodeHeight = node.style?.height || 100;
      
      node.position.x = Math.max(50, Math.min(viewportWidth - nodeWidth - 50, node.position.x));
      node.position.y = Math.max(50, Math.min(viewportHeight - nodeHeight - 50, node.position.y));
    });
  }
  
  return nodes;
};

/**
 * Smart Circular Layout (enhanced)
 */
const smartCircularLayout = (nodes, viewportWidth = 1400, viewportHeight = 800) => {
  const center = { x: viewportWidth / 2, y: viewportHeight / 2 };
  
  if (nodes.length === 1) {
    nodes[0].position = { x: center.x - (nodes[0].style?.width || 150) / 2, y: center.y - (nodes[0].style?.height || 100) / 2 };
    return nodes;
  }
  
  // Calculate optimal radius based on node sizes and spacing
  const avgNodeSize = nodes.reduce((sum, n) => {
    const width = n.style?.width || 150;
    const height = n.style?.height || 100;
    return sum + Math.max(width, height);
  }, 0) / nodes.length;
  
  const totalPerimeter = nodes.reduce((sum, n) => {
    const width = n.style?.width || 150;
    const height = n.style?.height || 100;
    const nodeSpacing = calculateDynamicSpacing(width, height, 40);
    return sum + Math.max(width, height) + nodeSpacing;
  }, 0);
  
  const radius = Math.max(200, totalPerimeter / (2 * Math.PI));
  const angleStep = (2 * Math.PI) / nodes.length;
  
  nodes.forEach((node, idx) => {
    const angle = idx * angleStep;
    const nodeWidth = node.style?.width || 150;
    const nodeHeight = node.style?.height || 100;
    
    node.position = {
      x: center.x + radius * Math.cos(angle) - nodeWidth / 2,
      y: center.y + radius * Math.sin(angle) - nodeHeight / 2
    };
  });
  
  return nodes;
};

/**
 * Post-layout collision detection and adjustment
 */
const resolveCollisions = (nodes, maxIterations = 10) => {
  const cellSpacing = 20;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let hasCollisions = false;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const rect1 = {
          x: node1.position.x,
          y: node1.position.y,
          width: node1.style?.width || 150,
          height: node1.style?.height || 100
        };
        
        const rect2 = {
          x: node2.position.x,
          y: node2.position.y,
          width: node2.style?.width || 150,
          height: node2.style?.height || 100
        };
        
        if (rectanglesOverlap(rect1, rect2, cellSpacing)) {
          hasCollisions = true;
          
          // Calculate separation vector
          const centerX1 = rect1.x + rect1.width / 2;
          const centerY1 = rect1.y + rect1.height / 2;
          const centerX2 = rect2.x + rect2.width / 2;
          const centerY2 = rect2.y + rect2.height / 2;
          
          const dx = centerX2 - centerX1;
          const dy = centerY2 - centerY1;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const minDistance = (Math.max(rect1.width, rect1.height) + Math.max(rect2.width, rect2.height)) / 2 + cellSpacing;
          const separation = (minDistance - distance) / 2;
          
          const moveX = (dx / distance) * separation;
          const moveY = (dy / distance) * separation;
          
          node1.position.x -= moveX;
          node1.position.y -= moveY;
          node2.position.x += moveX;
          node2.position.y += moveY;
        }
      }
    }
    
    if (!hasCollisions) break;
  }
  
  return nodes;
};

/**
 * Organization Chart Layouts (from draw.io)
 */
const orgChartLayouts = {
  linear: (nodes, viewportWidth = 1400, viewportHeight = 800) => {
    const margin = 60;
    const spacing = 100;
    let currentY = margin;
    
    nodes.forEach(node => {
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      node.position = {
        x: (viewportWidth - nodeWidth) / 2, // Center horizontally
        y: currentY
      };
      
      currentY += nodeHeight + spacing;
    });
    
    return nodes;
  },
  
  hanger2: (nodes, viewportWidth = 1400, viewportHeight = 800) => {
    const margin = 60;
    const spacing = 80;
    const cols = 2;
    
    nodes.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      node.position = {
        x: margin + col * (nodeWidth + spacing),
        y: margin + row * (nodeHeight + spacing)
      };
    });
    
    return nodes;
  },
  
  hanger4: (nodes, viewportWidth = 1400, viewportHeight = 800) => {
    const margin = 60;
    const spacing = 80;
    const cols = 4;
    
    nodes.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      node.position = {
        x: margin + col * (nodeWidth + spacing),
        y: margin + row * (nodeHeight + spacing)
      };
    });
    
    return nodes;
  },
  
  fishbone1: (nodes, viewportWidth = 1400, viewportHeight = 800) => {
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const spacing = 120;
    
    nodes.forEach((node, idx) => {
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      // Alternate sides (left/right of center)
      const side = idx % 2 === 0 ? -1 : 1;
      const level = Math.floor(idx / 2);
      
      node.position = {
        x: centerX + side * (nodeWidth + spacing) - nodeWidth / 2,
        y: centerY + level * (nodeHeight + spacing) - nodeHeight / 2
      };
    });
    
    return nodes;
  },
  
  fishbone2: (nodes, viewportWidth = 1400, viewportHeight = 800) => {
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const spacing = 100;
    
    nodes.forEach((node, idx) => {
      const nodeWidth = node.style?.width || 200;
      const nodeHeight = node.style?.height || 100;
      
      // Four quadrant layout
      const quadrant = idx % 4;
      const level = Math.floor(idx / 4);
      
      let x, y;
      switch (quadrant) {
        case 0: // Top-left
          x = centerX - nodeWidth - spacing * (level + 1);
          y = centerY - nodeHeight - spacing * (level + 1);
          break;
        case 1: // Top-right
          x = centerX + spacing * (level + 1);
          y = centerY - nodeHeight - spacing * (level + 1);
          break;
        case 2: // Bottom-right
          x = centerX + spacing * (level + 1);
          y = centerY + spacing * (level + 1);
          break;
        case 3: // Bottom-left
          x = centerX - nodeWidth - spacing * (level + 1);
          y = centerY + spacing * (level + 1);
          break;
      }
      
      node.position = { x, y };
    });
    
    return nodes;
  }
};

/**
 * All available layout algorithms (draw.io complete set)
 */
export const layoutAlgorithms = {
  // Basic layouts
  'hierarchical': { name: 'Hierarchical', category: 'Basic', func: hierarchicalLayout },
  'grid': { name: 'Grid', category: 'Basic', func: gridLayout },
  'circular': { name: 'Circular', category: 'Basic', func: smartCircularLayout },
  'force-directed': { name: 'Force Directed', category: 'Basic', func: forceDirectedLayout },
  
  // Organization charts
  'org-linear': { name: 'Linear', category: 'Organization', func: orgChartLayouts.linear },
  'org-hanger2': { name: 'Hanger (2 columns)', category: 'Organization', func: orgChartLayouts.hanger2 },
  'org-hanger4': { name: 'Hanger (4 columns)', category: 'Organization', func: orgChartLayouts.hanger4 },
  'org-fishbone1': { name: 'Fishbone 1', category: 'Organization', func: orgChartLayouts.fishbone1 },
  'org-fishbone2': { name: 'Fishbone 2', category: 'Organization', func: orgChartLayouts.fishbone2 },
  
  // Tree layouts
  'tree-vertical': { name: 'Vertical Tree', category: 'Tree', func: hierarchicalLayout },
  'tree-horizontal': { name: 'Horizontal Tree', category: 'Tree', func: (nodes, w, h) => {
    // Transpose hierarchical layout
    const result = hierarchicalLayout(nodes, h, w);
    return result.map(node => ({
      ...node,
      position: { x: node.position.y, y: node.position.x }
    }));
  }},
  
  // Special layouts
  'radial': { name: 'Radial', category: 'Special', func: smartCircularLayout },
  'compact': { name: 'Compact Tree', category: 'Special', func: gridLayout },
  'organic': { name: 'Organic', category: 'Special', func: forceDirectedLayout }
};

/**
 * Apply layout with specific algorithm
 */
export const applyLayoutAlgorithm = (nodes, algorithm = 'hierarchical', viewportWidth = 1400, viewportHeight = 800) => {
  const updated = [...nodes];
  
  // Apply text-based sizing to all nodes
  const estimateTextSize = (
    text,
    minW = 80,
    minH = 50,
    maxW = 300,
    maxH = 180
  ) => {
    if (!text) return { width: minW, height: minH };
    
    const words = text.split(/\s+/);
    const avgCharWidth = 8;
    const lineHeight = 20;
    const padding = 24;
    
    const totalChars = text.length;
    const charsPerLine = Math.floor((maxW - padding) / avgCharWidth);
    const lines = Math.max(1, Math.ceil(totalChars / charsPerLine));
    
    const width = Math.min(maxW, Math.max(minW, totalChars * avgCharWidth / lines + padding));
    const height = Math.min(maxH, Math.max(minW, lines * lineHeight + padding));
    
    return { width, height };
  };

  updated.forEach(node => {
    const text = `${node.data?.label || ''} ${node.data?.description || ''}`.trim();
    const textSize = estimateTextSize(
      text,
      node.type === 'container' ? 200 : 120,
      node.type === 'container' ? 120 : 80,
      node.type === 'container' ? 350 : 300,
      node.type === 'container' ? 200 : 180
    );
    
    if (!node.style) node.style = {};
    node.style.width = textSize.width;
    node.style.height = textSize.height;
  });

  // Handle container layouts (nested nodes)
  const containers = updated.filter(n => n.type === 'container');
  containers.forEach(container => {
    const children = updated.filter(n => n.parentNode === container.id);
    if (children.length > 0) {
      const gridNodes = gridLayout(children, container.style.width - 40, container.style.height - 60);
      
      if (gridNodes.length > 0) {
        const bounds = gridNodes.reduce((acc, node) => ({
          minX: Math.min(acc.minX, node.position.x),
          minY: Math.min(acc.minY, node.position.y),
          maxX: Math.max(acc.maxX, node.position.x + (node.style?.width || 150)),
          maxY: Math.max(acc.maxY, node.position.y + (node.style?.height || 100))
        }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
        
        container.style.width = Math.max(container.style.width, bounds.maxX - bounds.minX + 80);
        container.style.height = Math.max(container.style.height, bounds.maxY - bounds.minY + 100);
      }
    }
  });

  // Apply selected layout algorithm
  const topLevelNodes = updated.filter(n => !n.parentNode);
  const layoutConfig = layoutAlgorithms[algorithm];
  
  let layoutResult;
  if (layoutConfig && layoutConfig.func) {
    layoutResult = layoutConfig.func(topLevelNodes, viewportWidth, viewportHeight);
  } else {
    console.warn(`Unknown layout algorithm: ${algorithm}, falling back to hierarchical`);
    layoutResult = hierarchicalLayout(topLevelNodes, viewportWidth, viewportHeight);
  }
  
  // Final collision resolution pass
  const finalNodes = resolveCollisions(layoutResult);
  
  console.log(`Applied ${algorithm} layout algorithm with collision detection`);
  
  return updated;
};

// Legacy function for backward compatibility
export const autoLayoutNodes = (nodes, algorithm = null) => {
  const selectedAlgorithm = algorithm || selectLayoutAlgorithm(nodes.filter(n => !n.parentNode));
  return applyLayoutAlgorithm(nodes, selectedAlgorithm);
};
