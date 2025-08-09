/**
 * Shape Library Definitions
 * Comprehensive shape definitions for the shape library system
 */

export const SHAPE_DEFINITIONS = {
  // =================== BASIC SHAPES ===================
  'basic-rectangle': {
    id: 'basic-rectangle',
    name: 'Rectangle',
    category: 'basic',
    tags: ['box', 'container', 'basic', 'rectangle'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⬜'
  },

  'basic-circle': {
    id: 'basic-circle',
    name: 'Circle',
    category: 'basic',
    tags: ['circle', 'round', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '⭕'
  },

  'basic-triangle': {
    id: 'basic-triangle',
    name: 'Triangle',
    category: 'basic',
    tags: ['triangle', 'arrow', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L70,60 L10,60 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '🔺'
  },

  'basic-diamond': {
    id: 'basic-diamond',
    name: 'Diamond',
    category: 'basic',
    tags: ['diamond', 'decision', 'basic'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M50,10 L90,40 L50,70 L10,40 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '♦️'
  },

  'basic-hexagon': {
    id: 'basic-hexagon',
    name: 'Hexagon',
    category: 'basic',
    tags: ['hexagon', 'six-sided', 'basic'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M25,10 L75,10 L90,40 L75,70 L25,70 L10,40 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬢'
  },

  'basic-oval': {
    id: 'basic-oval',
    name: 'Oval',
    category: 'basic',
    tags: ['oval', 'ellipse', 'basic'],
    defaultSize: { width: 120, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '⭕'
  },

  'basic-pentagon': {
    id: 'basic-pentagon',
    name: 'Pentagon',
    category: 'basic',
    tags: ['pentagon', 'five-sided', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L70,30 L60,65 L20,65 L10,30 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬟'
  },

  'basic-octagon': {
    id: 'basic-octagon',
    name: 'Octagon',
    category: 'basic',
    tags: ['octagon', 'eight-sided', 'basic', 'stop'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M25,10 L55,10 L70,25 L70,55 L55,70 L25,70 L10,55 L10,25 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬟'
  },

  'basic-star': {
    id: 'basic-star',
    name: 'Star',
    category: 'basic',
    tags: ['star', 'favorite', 'rating', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L47,27 L65,27 L52,38 L58,55 L40,45 L22,55 L28,38 L15,27 L33,27 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⭐'
  },

  'basic-heart': {
    id: 'basic-heart',
    name: 'Heart',
    category: 'basic',
    tags: ['heart', 'love', 'favorite', 'basic'],
    defaultSize: { width: 80, height: 70 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,60 C32,45 10,35 10,20 Q10,5 25,5 Q40,5 40,20 Q40,5 55,5 Q70,5 70,20 C70,35 48,45 40,60 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '♥️'
  },

  'basic-arrow-right': {
    id: 'basic-arrow-right',
    name: 'Arrow Right',
    category: 'basic',
    tags: ['arrow', 'right', 'direction', 'basic'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 L60,20 L60,10 L90,30 L60,50 L60,40 L10,40 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '➡️'
  },

  'basic-arrow-left': {
    id: 'basic-arrow-left',
    name: 'Arrow Left',
    category: 'basic',
    tags: ['arrow', 'left', 'direction', 'basic'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M90,20 L40,20 L40,10 L10,30 L40,50 L40,40 L90,40 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬅️'
  },

  'basic-arrow-up': {
    id: 'basic-arrow-up',
    name: 'Arrow Up',
    category: 'basic',
    tags: ['arrow', 'up', 'direction', 'basic'],
    defaultSize: { width: 60, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,90 L20,40 L10,40 L30,10 L50,40 L40,40 L40,90 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬆️'
  },

  'basic-arrow-down': {
    id: 'basic-arrow-down',
    name: 'Arrow Down',
    category: 'basic',
    tags: ['arrow', 'down', 'direction', 'basic'],
    defaultSize: { width: 60, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L20,60 L10,60 L30,90 L50,60 L40,60 L40,10 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬇️'
  },

  'basic-arrow-double': {
    id: 'basic-arrow-double',
    name: 'Double Arrow',
    category: 'basic',
    tags: ['arrow', 'double', 'bidirectional', 'basic'],
    defaultSize: { width: 120, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,30 L25,15 L25,25 L95,25 L95,15 L110,30 L95,45 L95,35 L25,35 L25,45 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '↔️'
  },

  'basic-cross': {
    id: 'basic-cross',
    name: 'Cross',
    category: 'basic',
    tags: ['cross', 'plus', 'medical', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 L50,10 L50,30 L70,30 L70,50 L50,50 L50,70 L30,70 L30,50 L10,50 L10,30 L30,30 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '➕'
  },

  'basic-plus': {
    id: 'basic-plus',
    name: 'Plus',
    category: 'basic',
    tags: ['plus', 'add', 'positive', 'basic'],
    defaultSize: { width: 60, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M25,10 L35,10 L35,25 L50,25 L50,35 L35,35 L35,50 L25,50 L25,35 L10,35 L10,25 L25,25 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '✚'
  },

  'basic-minus': {
    id: 'basic-minus',
    name: 'Minus',
    category: 'basic',
    tags: ['minus', 'subtract', 'negative', 'basic'],
    defaultSize: { width: 60, height: 20 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,5 L50,5 L50,15 L10,15 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '➖'
  },

  'basic-parallelogram': {
    id: 'basic-parallelogram',
    name: 'Parallelogram',
    category: 'basic',
    tags: ['parallelogram', 'slant', 'basic'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L100,10 L80,70 L0,70 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '▱'
  },

  'basic-trapezoid': {
    id: 'basic-trapezoid',
    name: 'Trapezoid',
    category: 'basic',
    tags: ['trapezoid', 'basic'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 L70,10 L90,70 L10,70 Z',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '⬢'
  },

  'basic-cylinder': {
    id: 'basic-cylinder',
    name: 'Cylinder',
    category: 'basic',
    tags: ['cylinder', '3d', 'database', 'basic'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 40,10 Q70,10 70,20 L70,80 Q70,90 40,90 Q10,90 10,80 Z M10,20 Q10,30 40,30 Q70,30 70,20',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '🗄️'
  },

  'basic-cube': {
    id: 'basic-cube',
    name: 'Cube',
    category: 'basic',
    tags: ['cube', '3d', 'box', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,25 L10,65 L50,65 L50,80 L70,60 L70,20 L30,20 L10,25 Z M10,25 L30,5 L70,5 L70,20 M50,65 L70,45 L70,20 M30,20 L30,5',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '🎲'
  },

  'basic-pyramid': {
    id: 'basic-pyramid',
    name: 'Pyramid',
    category: 'basic',
    tags: ['pyramid', '3d', 'triangle', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L70,70 L10,70 Z M40,10 L55,70 M40,30 L10,70',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '🔺'
  },

  'basic-cone': {
    id: 'basic-cone',
    name: 'Cone',
    category: 'basic',
    tags: ['cone', '3d', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L10,70 Q40,80 70,70 Z M10,70 Q40,60 70,70',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2
    },
    icon: '🔸'
  },

  'basic-sphere': {
    id: 'basic-sphere',
    name: 'Sphere',
    category: 'basic',
    tags: ['sphere', '3d', 'ball', 'basic'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '🔮'
  },

  // =================== FLOWCHART SHAPES ===================
  'flowchart-process': {
    id: 'flowchart-process',
    name: 'Process',
    category: 'flowchart',
    tags: ['process', 'action', 'step', 'operation'],
    defaultSize: { width: 140, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⚙️'
  },

  'flowchart-decision': {
    id: 'flowchart-decision',
    name: 'Decision',
    category: 'flowchart',
    tags: ['decision', 'choice', 'condition', 'if'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M60,10 L110,40 L60,70 L10,40 Z',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2
    },
    icon: '❓'
  },

  'flowchart-terminator': {
    id: 'flowchart-terminator',
    name: 'Start/End',
    category: 'flowchart',
    tags: ['start', 'end', 'terminator', 'begin', 'finish'],
    defaultSize: { width: 120, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 L90,10 Q110,10 110,30 Q110,50 90,50 L30,50 Q10,50 10,30 Q10,10 30,10 Z',
    style: {
      fill: '#e8f5e8',
      stroke: '#388e3c',
      strokeWidth: 2
    },
    icon: '⭕'
  },

  'flowchart-document': {
    id: 'flowchart-document',
    name: 'Document',
    category: 'flowchart',
    tags: ['document', 'file', 'paper', 'output'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L110,10 L110,60 Q60,80 10,60 Z',
    style: {
      fill: '#fce4ec',
      stroke: '#c2185b',
      strokeWidth: 2
    },
    icon: '📄'
  },

  'flowchart-data': {
    id: 'flowchart-data',
    name: 'Data',
    category: 'flowchart',
    tags: ['data', 'input', 'output', 'io'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L100,10 L110,40 L100,70 L20,70 L10,40 Z',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2
    },
    icon: '📊'
  },

  'flowchart-connector': {
    id: 'flowchart-connector',
    name: 'Connector',
    category: 'flowchart',
    tags: ['connector', 'junction', 'flow'],
    defaultSize: { width: 30, height: 30 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#e8f5e8',
      stroke: '#388e3c',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '⚪'
  },

  'flowchart-predefined-process': {
    id: 'flowchart-predefined-process',
    name: 'Predefined Process',
    category: 'flowchart',
    tags: ['predefined', 'process', 'subroutine'],
    defaultSize: { width: 140, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L130,10 L130,70 L10,70 Z M20,10 L20,70 M120,10 L120,70',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '📦'
  },

  'flowchart-manual-input': {
    id: 'flowchart-manual-input',
    name: 'Manual Input',
    category: 'flowchart',
    tags: ['manual', 'input', 'keyboard'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,25 L110,10 L110,70 L10,70 Z',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2
    },
    icon: '⌨️'
  },

  'flowchart-manual-operation': {
    id: 'flowchart-manual-operation',
    name: 'Manual Operation',
    category: 'flowchart',
    tags: ['manual', 'operation', 'hand'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L100,10 L110,70 L10,70 Z',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2
    },
    icon: '✋'
  },

  'flowchart-preparation': {
    id: 'flowchart-preparation',
    name: 'Preparation',
    category: 'flowchart',
    tags: ['preparation', 'setup', 'initialize'],
    defaultSize: { width: 140, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L120,10 L130,40 L120,70 L20,70 L10,40 Z',
    style: {
      fill: '#e8f5e8',
      stroke: '#388e3c',
      strokeWidth: 2
    },
    icon: '🛠️'
  },

  'flowchart-or': {
    id: 'flowchart-or',
    name: 'Or',
    category: 'flowchart',
    tags: ['or', 'logic', 'junction'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '∨'
  },

  'flowchart-sum-junction': {
    id: 'flowchart-sum-junction',
    name: 'Sum Junction',
    category: 'flowchart',
    tags: ['sum', 'junction', 'merge'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L70,40 L40,70 L10,40 Z M25,25 L55,55 M25,55 L55,25',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2
    },
    icon: '⊕'
  },

  'flowchart-database': {
    id: 'flowchart-database',
    name: 'Database',
    category: 'flowchart',
    tags: ['database', 'storage', 'data'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 40,10 Q70,10 70,20 L70,60 Q70,70 40,70 Q10,70 10,60 Z M10,20 Q10,30 40,30 Q70,30 70,20',
    style: {
      fill: '#bbdefb',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '🗄️'
  },

  'flowchart-internal-storage': {
    id: 'flowchart-internal-storage',
    name: 'Internal Storage',
    category: 'flowchart',
    tags: ['internal', 'storage', 'memory'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L110,10 L110,70 L10,70 Z M20,10 L20,70 M10,20 L110,20',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2
    },
    icon: '💾'
  },

  'flowchart-extract': {
    id: 'flowchart-extract',
    name: 'Extract',
    category: 'flowchart',
    tags: ['extract', 'separate', 'filter'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M20,10 L80,10 L70,70 L30,70 Z',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2
    },
    icon: '🔽'
  },

  'flowchart-merge': {
    id: 'flowchart-merge',
    name: 'Merge',
    category: 'flowchart',
    tags: ['merge', 'combine', 'join'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 L70,10 L80,70 L20,70 Z',
    style: {
      fill: '#e8f5e8',
      stroke: '#388e3c',
      strokeWidth: 2
    },
    icon: '🔼'
  },

  'flowchart-sort': {
    id: 'flowchart-sort',
    name: 'Sort',
    category: 'flowchart',
    tags: ['sort', 'order', 'arrange'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L70,40 L40,70 L10,40 Z M25,40 L55,40',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2
    },
    icon: '🔢'
  },

  'flowchart-multidocument': {
    id: 'flowchart-multidocument',
    name: 'Multiple Documents',
    category: 'flowchart',
    tags: ['multiple', 'documents', 'files'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M15,15 L105,15 L105,55 Q65,75 15,55 Z M20,10 L110,10 L110,50 Q70,70 20,50 Z M10,20 L100,20 L100,60 Q60,80 10,60 Z',
    style: {
      fill: '#fce4ec',
      stroke: '#c2185b',
      strokeWidth: 2
    },
    icon: '📄'
  },

  'flowchart-display': {
    id: 'flowchart-display',
    name: 'Display',
    category: 'flowchart',
    tags: ['display', 'output', 'show'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L100,10 Q120,10 120,40 Q120,70 100,70 L10,70 Z',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '📺'
  },

  'flowchart-delay': {
    id: 'flowchart-delay',
    name: 'Delay',
    category: 'flowchart',
    tags: ['delay', 'wait', 'pause'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L70,10 Q90,10 90,40 Q90,70 70,70 L10,70 Z',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2
    },
    icon: '⏱️'
  },

  'flowchart-alternate-process': {
    id: 'flowchart-alternate-process',
    name: 'Alternate Process',
    category: 'flowchart',
    tags: ['alternate', 'process', 'backup'],
    defaultSize: { width: 140, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L130,10 L130,70 L10,70 Z M10,10 Q20,0 30,10 M110,10 Q120,0 130,10 M10,70 Q20,80 30,70 M110,70 Q120,80 130,70',
    style: {
      fill: '#e8f5e8',
      stroke: '#388e3c',
      strokeWidth: 2
    },
    icon: '⚙️'
  },

  'flowchart-annotation': {
    id: 'flowchart-annotation',
    name: 'Annotation',
    category: 'flowchart',
    tags: ['annotation', 'comment', 'note'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,10 L10,70 M10,40 L110,40',
    style: {
      fill: 'none',
      stroke: '#424242',
      strokeWidth: 2
    },
    icon: '📝'
  },

  'flowchart-card': {
    id: 'flowchart-card',
    name: 'Card',
    category: 'flowchart',
    tags: ['card', 'punch card', 'data'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,25 L25,10 L110,10 L110,70 L10,70 Z',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2
    },
    icon: '💳'
  },

  'flowchart-punched-tape': {
    id: 'flowchart-punched-tape',
    name: 'Punched Tape',
    category: 'flowchart',
    tags: ['punched', 'tape', 'storage'],
    defaultSize: { width: 120, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 20,10 L100,10 Q110,10 110,20 L110,60 Q110,70 100,70 L20,70 Q10,70 10,60 Z',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2
    },
    icon: '📼'
  },

  'flowchart-off-page-connector': {
    id: 'flowchart-off-page-connector',
    name: 'Off-Page Connector',
    category: 'flowchart',
    tags: ['off-page', 'connector', 'reference'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,15 L70,15 L70,45 L55,60 L40,45 L25,60 L10,45 Z',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2
    },
    icon: '🔗'
  },

  // =================== INFRASTRUCTURE SHAPES ===================
  'infra-router': {
    id: 'infra-router',
    name: 'Router',
    category: 'infrastructure',
    tags: ['router', 'gateway', 'internet', 'wan', 'network'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📡'
  },

  'infra-switch': {
    id: 'infra-switch',
    name: 'Network Switch',
    category: 'infrastructure',
    tags: ['switch', 'network', 'ethernet', 'lan'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔌'
  },

  'infra-firewall': {
    id: 'infra-firewall',
    name: 'Firewall',
    category: 'infrastructure',
    tags: ['firewall', 'security', 'protection', 'shield'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🛡️'
  },

  'infra-load-balancer': {
    id: 'infra-load-balancer',
    name: 'Load Balancer',
    category: 'infrastructure',
    tags: ['load balancer', 'lb', 'traffic', 'distribution'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⚖️'
  },

  'infra-proxy': {
    id: 'infra-proxy',
    name: 'Proxy Server',
    category: 'infrastructure',
    tags: ['proxy', 'server', 'intermediary', 'cache'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔄'
  },

  'infra-gateway': {
    id: 'infra-gateway',
    name: 'Gateway',
    category: 'infrastructure',
    tags: ['gateway', 'network', 'bridge', 'access'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🚪'
  },

  'infra-bridge': {
    id: 'infra-bridge',
    name: 'Bridge',
    category: 'infrastructure',
    tags: ['bridge', 'network', 'connection', 'link'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🌉'
  },

  'infra-hub': {
    id: 'infra-hub',
    name: 'Hub',
    category: 'infrastructure',
    tags: ['hub', 'network', 'concentrator', 'central'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔗'
  },

  'infra-repeater': {
    id: 'infra-repeater',
    name: 'Repeater',
    category: 'infrastructure',
    tags: ['repeater', 'amplifier', 'signal', 'extender'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📶'
  },

  'infra-modem': {
    id: 'infra-modem',
    name: 'Modem',
    category: 'infrastructure',
    tags: ['modem', 'internet', 'connection', 'isp'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📞'
  },

  'infra-wireless-router': {
    id: 'infra-wireless-router',
    name: 'Wireless Router',
    category: 'infrastructure',
    tags: ['wireless', 'router', 'wifi', 'access point'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📶'
  },

  'infra-access-point': {
    id: 'infra-access-point',
    name: 'Access Point',
    category: 'infrastructure',
    tags: ['access point', 'wifi', 'wireless', 'ap'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📡'
  },

  'infra-vpn-concentrator': {
    id: 'infra-vpn-concentrator',
    name: 'VPN Concentrator',
    category: 'infrastructure',
    tags: ['vpn', 'concentrator', 'security', 'tunnel'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔐'
  },

  'infra-nat-gateway': {
    id: 'infra-nat-gateway',
    name: 'NAT Gateway',
    category: 'infrastructure',
    tags: ['nat', 'gateway', 'translation', 'address'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🌐'
  },

  'infra-dns-server': {
    id: 'infra-dns-server',
    name: 'DNS Server',
    category: 'infrastructure',
    tags: ['dns', 'server', 'domain', 'name'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🌐'
  },

  'infra-dhcp-server': {
    id: 'infra-dhcp-server',
    name: 'DHCP Server',
    category: 'infrastructure',
    tags: ['dhcp', 'server', 'ip', 'address'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔢'
  },

  'infra-radius-server': {
    id: 'infra-radius-server',
    name: 'RADIUS Server',
    category: 'infrastructure',
    tags: ['radius', 'server', 'authentication', 'aaa'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔑'
  },

  'infra-ntp-server': {
    id: 'infra-ntp-server',
    name: 'NTP Server',
    category: 'infrastructure',
    tags: ['ntp', 'server', 'time', 'sync'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🕒'
  },

  'infra-syslog-server': {
    id: 'infra-syslog-server',
    name: 'Syslog Server',
    category: 'infrastructure',
    tags: ['syslog', 'server', 'logging', 'audit'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📋'
  },

  'infra-monitoring-server': {
    id: 'infra-monitoring-server',
    name: 'Monitoring Server',
    category: 'infrastructure',
    tags: ['monitoring', 'server', 'metrics', 'alerts'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📊'
  },

  'infra-backup-server': {
    id: 'infra-backup-server',
    name: 'Backup Server',
    category: 'infrastructure',
    tags: ['backup', 'server', 'storage', 'recovery'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💾'
  },

  'infra-file-server': {
    id: 'infra-file-server',
    name: 'File Server',
    category: 'infrastructure',
    tags: ['file', 'server', 'storage', 'nas'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📁'
  },

  'infra-web-server': {
    id: 'infra-web-server',
    name: 'Web Server',
    category: 'infrastructure',
    tags: ['web', 'server', 'http', 'apache', 'nginx'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🌐'
  },

  'infra-app-server': {
    id: 'infra-app-server',
    name: 'Application Server',
    category: 'infrastructure',
    tags: ['application', 'server', 'app', 'middleware'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⚙️'
  },

  'infra-mail-server': {
    id: 'infra-mail-server',
    name: 'Mail Server',
    category: 'infrastructure',
    tags: ['mail', 'server', 'email', 'smtp', 'exchange'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📧'
  },

  // =================== COMPUTERS SHAPES ===================
  'computers-server': {
    id: 'computers-server',
    name: 'Server',
    category: 'computers',
    tags: ['server', 'computer', 'host', 'machine'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'computers-workstation': {
    id: 'computers-workstation',
    name: 'Workstation',
    category: 'computers',
    tags: ['workstation', 'desktop', 'computer', 'pc'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💻'
  },

  'computers-laptop': {
    id: 'computers-laptop',
    name: 'Laptop',
    category: 'computers',
    tags: ['laptop', 'notebook', 'portable', 'computer'],
    defaultSize: { width: 70, height: 50 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💻'
  },

  'computers-tablet': {
    id: 'computers-tablet',
    name: 'Tablet',
    category: 'computers',
    tags: ['tablet', 'mobile', 'device', 'touch'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-mobile': {
    id: 'computers-mobile',
    name: 'Mobile Phone',
    category: 'computers',
    tags: ['mobile', 'phone', 'smartphone', 'device'],
    defaultSize: { width: 40, height: 70 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fce4ec',
      stroke: '#c2185b',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-desktop': {
    id: 'computers-desktop',
    name: 'Desktop Computer',
    category: 'computers',
    tags: ['desktop', 'pc', 'computer', 'workstation'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'computers-imac': {
    id: 'computers-imac',
    name: 'iMac',
    category: 'computers',
    tags: ['imac', 'apple', 'mac', 'desktop'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'computers-macbook': {
    id: 'computers-macbook',
    name: 'MacBook',
    category: 'computers',
    tags: ['macbook', 'apple', 'mac', 'laptop'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💻'
  },

  'computers-ipad': {
    id: 'computers-ipad',
    name: 'iPad',
    category: 'computers',
    tags: ['ipad', 'apple', 'tablet', 'ios'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-iphone': {
    id: 'computers-iphone',
    name: 'iPhone',
    category: 'computers',
    tags: ['iphone', 'apple', 'smartphone', 'ios'],
    defaultSize: { width: 40, height: 70 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-android-phone': {
    id: 'computers-android-phone',
    name: 'Android Phone',
    category: 'computers',
    tags: ['android', 'phone', 'smartphone', 'google'],
    defaultSize: { width: 40, height: 70 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-android-tablet': {
    id: 'computers-android-tablet',
    name: 'Android Tablet',
    category: 'computers',
    tags: ['android', 'tablet', 'google', 'device'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📱'
  },

  'computers-chromebook': {
    id: 'computers-chromebook',
    name: 'Chromebook',
    category: 'computers',
    tags: ['chromebook', 'google', 'chrome', 'laptop'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💻'
  },

  'computers-surface': {
    id: 'computers-surface',
    name: 'Microsoft Surface',
    category: 'computers',
    tags: ['surface', 'microsoft', 'tablet', 'laptop'],
    defaultSize: { width: 70, height: 70 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📱'
  },

  'computers-watch': {
    id: 'computers-watch',
    name: 'Smart Watch',
    category: 'computers',
    tags: ['watch', 'smartwatch', 'wearable', 'apple watch'],
    defaultSize: { width: 50, height: 50 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '⌚'
  },

  'computers-mainframe': {
    id: 'computers-mainframe',
    name: 'Mainframe',
    category: 'computers',
    tags: ['mainframe', 'legacy', 'enterprise', 'big iron'],
    defaultSize: { width: 100, height: 120 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'computers-terminal': {
    id: 'computers-terminal',
    name: 'Terminal',
    category: 'computers',
    tags: ['terminal', 'console', 'command line', 'cli'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⌨️'
  },

  'computers-thin-client': {
    id: 'computers-thin-client',
    name: 'Thin Client',
    category: 'computers',
    tags: ['thin client', 'terminal', 'remote', 'virtual'],
    defaultSize: { width: 70, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'computers-kiosk': {
    id: 'computers-kiosk',
    name: 'Kiosk',
    category: 'computers',
    tags: ['kiosk', 'self service', 'terminal', 'public'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏧'
  },

  'computers-pos': {
    id: 'computers-pos',
    name: 'POS Terminal',
    category: 'computers',
    tags: ['pos', 'point of sale', 'retail', 'payment'],
    defaultSize: { width: 70, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '💳'
  },

  'computers-scanner': {
    id: 'computers-scanner',
    name: 'Scanner',
    category: 'computers',
    tags: ['scanner', 'document', 'digitize', 'office'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📃'
  },

  'computers-printer': {
    id: 'computers-printer',
    name: 'Printer',
    category: 'computers',
    tags: ['printer', 'print', 'paper', 'office'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖨️'
  },

  'computers-projector': {
    id: 'computers-projector',
    name: 'Projector',
    category: 'computers',
    tags: ['projector', 'display', 'presentation', 'meeting'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📽️'
  },

  'computers-webcam': {
    id: 'computers-webcam',
    name: 'Webcam',
    category: 'computers',
    tags: ['webcam', 'camera', 'video', 'conference'],
    defaultSize: { width: 60, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📹'
  },

  'computers-headset': {
    id: 'computers-headset',
    name: 'Headset',
    category: 'computers',
    tags: ['headset', 'audio', 'microphone', 'call'],
    defaultSize: { width: 60, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🎧'
  },

  // =================== PEOPLE SHAPES ===================
  'people-user': {
    id: 'people-user',
    name: 'User',
    category: 'people',
    tags: ['user', 'person', 'human', 'actor'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 Q35,5 35,15 Q35,25 30,20 Q25,25 25,15 Q25,5 30,10 M30,20 L30,50 M20,30 L40,30 M30,50 L20,70 M30,50 L40,70',
    style: {
      fill: 'none',
      stroke: '#424242',
      strokeWidth: 2
    },
    icon: '👤'
  },

  'people-admin': {
    id: 'people-admin',
    name: 'Administrator',
    category: 'people',
    tags: ['admin', 'administrator', 'manager', 'supervisor'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '👨‍💼'
  },

  'people-developer': {
    id: 'people-developer',
    name: 'Developer',
    category: 'people',
    tags: ['developer', 'programmer', 'coder', 'engineer'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '👨‍💻'
  },

  'people-analyst': {
    id: 'people-analyst',
    name: 'Analyst',
    category: 'people',
    tags: ['analyst', 'business analyst', 'data analyst'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '👩‍💼'
  },

  'people-customer': {
    id: 'people-customer',
    name: 'Customer',
    category: 'people',
    tags: ['customer', 'client', 'end user', 'consumer'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fce4ec',
      stroke: '#c2185b',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '👤'
  },

  // =================== DATABASE SHAPES ===================
  'database-sql': {
    id: 'database-sql',
    name: 'SQL Database',
    category: 'database',
    tags: ['sql', 'database', 'rdbms', 'mysql', 'postgresql'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 40,10 Q70,10 70,20 L70,60 Q70,70 40,70 Q10,70 10,60 Z M10,20 Q10,30 40,30 Q70,30 70,20',
    style: {
      fill: '#bbdefb',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '🗄️'
  },

  'database-nosql': {
    id: 'database-nosql',
    name: 'NoSQL Database',
    category: 'database',
    tags: ['nosql', 'mongodb', 'cassandra', 'document'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📊'
  },

  'database-cache': {
    id: 'database-cache',
    name: 'Cache',
    category: 'database',
    tags: ['cache', 'redis', 'memcached', 'memory'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '⚡'
  },

  'database-warehouse': {
    id: 'database-warehouse',
    name: 'Data Warehouse',
    category: 'database',
    tags: ['warehouse', 'big data', 'analytics', 'bi'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏢'
  },

  'database-backup': {
    id: 'database-backup',
    name: 'Backup Storage',
    category: 'database',
    tags: ['backup', 'storage', 'archive', 'recovery'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '💾'
  },

  // =================== SECURITY SHAPES ===================
  'security-shield': {
    id: 'security-shield',
    name: 'Security Shield',
    category: 'security',
    tags: ['security', 'shield', 'protection', 'defense'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L60,20 L60,40 Q60,60 40,70 Q20,60 20,40 L20,20 Z',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2
    },
    icon: '🛡️'
  },

  'security-lock': {
    id: 'security-lock',
    name: 'Lock',
    category: 'security',
    tags: ['lock', 'authentication', 'authorization', 'access control'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔒'
  },

  'security-key': {
    id: 'security-key',
    name: 'Key',
    category: 'security',
    tags: ['key', 'encryption', 'cryptography', 'ssl'],
    defaultSize: { width: 60, height: 40 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔑'
  },

  'security-certificate': {
    id: 'security-certificate',
    name: 'Certificate',
    category: 'security',
    tags: ['certificate', 'ssl', 'tls', 'digital signature'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📜'
  },

  'security-vpn': {
    id: 'security-vpn',
    name: 'VPN',
    category: 'security',
    tags: ['vpn', 'virtual private network', 'tunnel', 'secure'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔐'
  },

  // =================== AWS SHAPES ===================
  'aws-ec2': {
    id: 'aws-ec2',
    name: 'EC2 Instance',
    category: 'aws',
    tags: ['compute', 'server', 'virtual machine', 'ec2'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ff9900',
      stroke: '#ff6600',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🖥️'
  },

  'aws-s3': {
    id: 'aws-s3',
    name: 'S3 Bucket',
    category: 'aws',
    tags: ['storage', 'bucket', 'file', 's3'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#569a31',
      stroke: '#3e6b23',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🪣'
  },

  'aws-lambda': {
    id: 'aws-lambda',
    name: 'Lambda Function',
    category: 'aws',
    tags: ['serverless', 'function', 'lambda', 'compute'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ff9900',
      stroke: '#ff6600',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: 'λ'
  },

  'aws-rds': {
    id: 'aws-rds',
    name: 'RDS Database',
    category: 'aws',
    tags: ['database', 'rds', 'sql', 'mysql', 'postgres'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#2e7dd2',
      stroke: '#1e5aa8',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🗄️'
  },

  'aws-api-gateway': {
    id: 'aws-api-gateway',
    name: 'API Gateway',
    category: 'aws',
    tags: ['api', 'gateway', 'rest', 'http'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ff9900',
      stroke: '#ff6600',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🚪'
  },

  // =================== NETWORK SHAPES ===================
  'network-server': {
    id: 'network-server',
    name: 'Server',
    category: 'network',
    tags: ['server', 'computer', 'host', 'machine'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e0e0e0',
      stroke: '#616161',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🖥️'
  },

  'network-database': {
    id: 'network-database',
    name: 'Database',
    category: 'network',
    tags: ['database', 'data', 'storage', 'db'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 40,10 Q70,10 70,20 L70,60 Q70,70 40,70 Q10,70 10,60 Z M10,20 Q10,30 40,30 Q70,30 70,20',
    style: {
      fill: '#bbdefb',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '🗄️'
  },

  'network-cloud': {
    id: 'network-cloud',
    name: 'Cloud',
    category: 'network',
    tags: ['cloud', 'internet', 'web', 'online'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M25,40 Q10,40 10,25 Q10,10 25,10 Q30,5 40,5 Q55,5 60,10 Q75,10 75,25 Q90,25 90,40 Q75,55 60,55 L25,55 Q10,55 10,40',
    style: {
      fill: '#e1f5fe',
      stroke: '#0288d1',
      strokeWidth: 2
    },
    icon: '☁️'
  },

  'network-router': {
    id: 'network-router',
    name: 'Router',
    category: 'network',
    tags: ['router', 'network', 'gateway', 'switch'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f5f5f5',
      stroke: '#424242',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📡'
  },

  'network-firewall': {
    id: 'network-firewall',
    name: 'Firewall',
    category: 'network',
    tags: ['firewall', 'security', 'protection', 'shield'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🛡️'
  },

  // =================== UML SHAPES ===================
  'uml-class': {
    id: 'uml-class',
    name: 'Class',
    category: 'uml',
    tags: ['class', 'object', 'uml', 'oop'],
    defaultSize: { width: 140, height: 120 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'custom',
    style: {
      fill: '#fff3e0',
      stroke: '#e65100',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📦'
  },

  'uml-actor': {
    id: 'uml-actor',
    name: 'Actor',
    category: 'uml',
    tags: ['actor', 'user', 'person', 'uml'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M30,10 Q35,5 35,15 Q35,25 30,20 Q25,25 25,15 Q25,5 30,10 M30,20 L30,50 M20,30 L40,30 M30,50 L20,70 M30,50 L40,70',
    style: {
      fill: 'none',
      stroke: '#424242',
      strokeWidth: 2
    },
    icon: '🧑'
  },

  'uml-usecase': {
    id: 'uml-usecase',
    name: 'Use Case',
    category: 'uml',
    tags: ['usecase', 'scenario', 'uml', 'requirement'],
    defaultSize: { width: 120, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '⭕'
  },

  // =================== CLOUD SERVICES SHAPES ===================
  'cloud-compute': {
    id: 'cloud-compute',
    name: 'Cloud Compute',
    category: 'cloud',
    tags: ['compute', 'vm', 'instance', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '💻'
  },

  'cloud-storage': {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    category: 'cloud',
    tags: ['storage', 'bucket', 'blob', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🗄️'
  },

  'cloud-database': {
    id: 'cloud-database',
    name: 'Cloud Database',
    category: 'cloud',
    tags: ['database', 'sql', 'nosql', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M10,20 Q10,10 40,10 Q70,10 70,20 L70,60 Q70,70 40,70 Q10,70 10,60 Z M10,20 Q10,30 40,30 Q70,30 70,20',
    style: {
      fill: '#bbdefb',
      stroke: '#1976d2',
      strokeWidth: 2
    },
    icon: '🗃️'
  },

  'cloud-network': {
    id: 'cloud-network',
    name: 'Cloud Network',
    category: 'cloud',
    tags: ['network', 'vpc', 'subnet', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🌐'
  },

  'cloud-security': {
    id: 'cloud-security',
    name: 'Cloud Security',
    category: 'cloud',
    tags: ['security', 'firewall', 'shield', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'svg',
    svgPath: 'M40,10 L60,20 L60,40 Q60,60 40,70 Q20,60 20,40 L20,20 Z',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2
    },
    icon: '🔒'
  },

  'cloud-serverless': {
    id: 'cloud-serverless',
    name: 'Serverless',
    category: 'cloud',
    tags: ['serverless', 'function', 'lambda', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: 'λ'
  },

  'cloud-container': {
    id: 'cloud-container',
    name: 'Container Service',
    category: 'cloud',
    tags: ['container', 'docker', 'ecs', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🐳'
  },

  'cloud-kubernetes': {
    id: 'cloud-kubernetes',
    name: 'Kubernetes',
    category: 'cloud',
    tags: ['kubernetes', 'k8s', 'orchestration', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '⚓'
  },

  'cloud-api-gateway': {
    id: 'cloud-api-gateway',
    name: 'API Gateway',
    category: 'cloud',
    tags: ['api', 'gateway', 'rest', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🚪'
  },

  'cloud-load-balancer': {
    id: 'cloud-load-balancer',
    name: 'Load Balancer',
    category: 'cloud',
    tags: ['load balancer', 'alb', 'elb', 'cloud'],
    defaultSize: { width: 100, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '⚖️'
  },

  'cloud-cdn': {
    id: 'cloud-cdn',
    name: 'CDN',
    category: 'cloud',
    tags: ['cdn', 'content delivery', 'cache', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🌍'
  },

  'cloud-dns': {
    id: 'cloud-dns',
    name: 'DNS Service',
    category: 'cloud',
    tags: ['dns', 'route53', 'domain', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🔍'
  },

  'cloud-monitoring': {
    id: 'cloud-monitoring',
    name: 'Cloud Monitoring',
    category: 'cloud',
    tags: ['monitoring', 'metrics', 'cloudwatch', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📊'
  },

  'cloud-logging': {
    id: 'cloud-logging',
    name: 'Cloud Logging',
    category: 'cloud',
    tags: ['logging', 'logs', 'audit', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📝'
  },

  'cloud-backup': {
    id: 'cloud-backup',
    name: 'Cloud Backup',
    category: 'cloud',
    tags: ['backup', 'restore', 'archive', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '💾'
  },

  'cloud-analytics': {
    id: 'cloud-analytics',
    name: 'Analytics',
    category: 'cloud',
    tags: ['analytics', 'bigquery', 'redshift', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📈'
  },

  'cloud-ml': {
    id: 'cloud-ml',
    name: 'Machine Learning',
    category: 'cloud',
    tags: ['ml', 'ai', 'sagemaker', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🧠'
  },

  'cloud-ai': {
    id: 'cloud-ai',
    name: 'Artificial Intelligence',
    category: 'cloud',
    tags: ['ai', 'artificial intelligence', 'cognition', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🤖'
  },

  'cloud-iot': {
    id: 'cloud-iot',
    name: 'IoT Service',
    category: 'cloud',
    tags: ['iot', 'internet of things', 'sensors', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📡'
  },

  'cloud-blockchain': {
    id: 'cloud-blockchain',
    name: 'Blockchain',
    category: 'cloud',
    tags: ['blockchain', 'crypto', 'distributed', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '⛓️'
  },

  'cloud-queue': {
    id: 'cloud-queue',
    name: 'Message Queue',
    category: 'cloud',
    tags: ['queue', 'sqs', 'message', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📬'
  },

  'cloud-notification': {
    id: 'cloud-notification',
    name: 'Notification Service',
    category: 'cloud',
    tags: ['notification', 'sns', 'alert', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🔔'
  },

  'cloud-identity': {
    id: 'cloud-identity',
    name: 'Identity Service',
    category: 'cloud',
    tags: ['identity', 'iam', 'auth', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '👤'
  },

  'cloud-billing': {
    id: 'cloud-billing',
    name: 'Billing Service',
    category: 'cloud',
    tags: ['billing', 'cost', 'usage', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '💰'
  },

  'cloud-marketplace': {
    id: 'cloud-marketplace',
    name: 'Marketplace',
    category: 'cloud',
    tags: ['marketplace', 'store', 'apps', 'cloud'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '🏪'
  },

  // =================== BUSINESS SHAPES ===================
  'business-building': {
    id: 'business-building',
    name: 'Office Building',
    category: 'business',
    tags: ['building', 'office', 'corporate', 'business'],
    defaultSize: { width: 80, height: 100 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏢'
  },

  'business-office': {
    id: 'business-office',
    name: 'Office',
    category: 'business',
    tags: ['office', 'workspace', 'desk', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏪'
  },

  'business-factory': {
    id: 'business-factory',
    name: 'Factory',
    category: 'business',
    tags: ['factory', 'manufacturing', 'production', 'business'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏭'
  },

  'business-warehouse': {
    id: 'business-warehouse',
    name: 'Warehouse',
    category: 'business',
    tags: ['warehouse', 'storage', 'logistics', 'business'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏬'
  },

  'business-store': {
    id: 'business-store',
    name: 'Store',
    category: 'business',
    tags: ['store', 'retail', 'shop', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏪'
  },

  'business-bank': {
    id: 'business-bank',
    name: 'Bank',
    category: 'business',
    tags: ['bank', 'financial', 'money', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏦'
  },

  'business-hospital': {
    id: 'business-hospital',
    name: 'Hospital',
    category: 'business',
    tags: ['hospital', 'healthcare', 'medical', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏥'
  },

  'business-school': {
    id: 'business-school',
    name: 'School',
    category: 'business',
    tags: ['school', 'education', 'learning', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏫'
  },

  'business-government': {
    id: 'business-government',
    name: 'Government',
    category: 'business',
    tags: ['government', 'public', 'official', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏛️'
  },

  'business-datacenter': {
    id: 'business-datacenter',
    name: 'Data Center',
    category: 'business',
    tags: ['datacenter', 'servers', 'hosting', 'business'],
    defaultSize: { width: 100, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏢'
  },

  'business-meeting-room': {
    id: 'business-meeting-room',
    name: 'Meeting Room',
    category: 'business',
    tags: ['meeting', 'room', 'conference', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🏛️'
  },

  'business-conference': {
    id: 'business-conference',
    name: 'Conference',
    category: 'business',
    tags: ['conference', 'presentation', 'meeting', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🎙️'
  },

  'business-presentation': {
    id: 'business-presentation',
    name: 'Presentation',
    category: 'business',
    tags: ['presentation', 'slides', 'demo', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📊'
  },

  'business-training': {
    id: 'business-training',
    name: 'Training',
    category: 'business',
    tags: ['training', 'education', 'learning', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📚'
  },

  'business-workshop': {
    id: 'business-workshop',
    name: 'Workshop',
    category: 'business',
    tags: ['workshop', 'collaboration', 'team', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🔧'
  },

  'business-document': {
    id: 'business-document',
    name: 'Document',
    category: 'business',
    tags: ['document', 'file', 'paper', 'business'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📄'
  },

  'business-contract': {
    id: 'business-contract',
    name: 'Contract',
    category: 'business',
    tags: ['contract', 'agreement', 'legal', 'business'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📜'
  },

  'business-invoice': {
    id: 'business-invoice',
    name: 'Invoice',
    category: 'business',
    tags: ['invoice', 'bill', 'payment', 'business'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '🧾'
  },

  'business-report': {
    id: 'business-report',
    name: 'Report',
    category: 'business',
    tags: ['report', 'analytics', 'data', 'business'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📊'
  },

  'business-chart': {
    id: 'business-chart',
    name: 'Chart',
    category: 'business',
    tags: ['chart', 'graph', 'analytics', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#fff3e0',
      stroke: '#f57c00',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📈'
  },

  'business-calendar': {
    id: 'business-calendar',
    name: 'Calendar',
    category: 'business',
    tags: ['calendar', 'schedule', 'time', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e8f5e8',
      stroke: '#2e7d32',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📅'
  },

  'business-clock': {
    id: 'business-clock',
    name: 'Clock',
    category: 'business',
    tags: ['clock', 'time', 'schedule', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'default',
    style: {
      fill: '#f3e5f5',
      stroke: '#7b1fa2',
      strokeWidth: 2,
      borderRadius: '50%'
    },
    icon: '🕐'
  },

  'business-email': {
    id: 'business-email',
    name: 'Email',
    category: 'business',
    tags: ['email', 'mail', 'communication', 'business'],
    defaultSize: { width: 80, height: 60 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e1f5fe',
      stroke: '#0277bd',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📧'
  },

  'business-phone': {
    id: 'business-phone',
    name: 'Phone',
    category: 'business',
    tags: ['phone', 'call', 'communication', 'business'],
    defaultSize: { width: 60, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#ffebee',
      stroke: '#d32f2f',
      strokeWidth: 2,
      borderRadius: '8px'
    },
    icon: '📞'
  },

  'business-fax': {
    id: 'business-fax',
    name: 'Fax',
    category: 'business',
    tags: ['fax', 'document', 'communication', 'business'],
    defaultSize: { width: 80, height: 80 },
    connectionPoints: ['top', 'right', 'bottom', 'left'],
    renderType: 'icon',
    style: {
      fill: '#e3f2fd',
      stroke: '#1976d2',
      strokeWidth: 2,
      borderRadius: '4px'
    },
    icon: '📠'
  }
};

export const SHAPE_CATEGORIES = {
  basic: {
    name: 'Basic Shapes',
    icon: '⬜',
    description: 'Fundamental geometric shapes',
    shapes: [
      'basic-rectangle', 'basic-circle', 'basic-triangle', 'basic-diamond', 'basic-hexagon',
      'basic-oval', 'basic-pentagon', 'basic-octagon', 'basic-star', 'basic-heart',
      'basic-arrow-right', 'basic-arrow-left', 'basic-arrow-up', 'basic-arrow-down', 'basic-arrow-double',
      'basic-cross', 'basic-plus', 'basic-minus', 'basic-parallelogram', 'basic-trapezoid',
      'basic-cylinder', 'basic-cube', 'basic-pyramid', 'basic-cone', 'basic-sphere'
    ]
  },
  flowchart: {
    name: 'Flowchart',
    icon: '📊',
    description: 'Process flow and decision shapes',
    shapes: [
      'flowchart-process', 'flowchart-decision', 'flowchart-terminator', 'flowchart-document', 'flowchart-data',
      'flowchart-connector', 'flowchart-predefined-process', 'flowchart-manual-input', 'flowchart-manual-operation', 'flowchart-preparation',
      'flowchart-or', 'flowchart-sum-junction', 'flowchart-database', 'flowchart-internal-storage', 'flowchart-extract',
      'flowchart-merge', 'flowchart-sort', 'flowchart-multidocument', 'flowchart-display', 'flowchart-delay',
      'flowchart-alternate-process', 'flowchart-annotation', 'flowchart-card', 'flowchart-punched-tape', 'flowchart-off-page-connector'
    ]
  },
  infrastructure: {
    name: 'Infrastructure',
    icon: '🌐',
    description: 'Network and infrastructure components',
    shapes: [
      'infra-router', 'infra-switch', 'infra-firewall', 'infra-load-balancer', 'infra-proxy',
      'infra-gateway', 'infra-bridge', 'infra-hub', 'infra-repeater', 'infra-modem',
      'infra-wireless-router', 'infra-access-point', 'infra-vpn-concentrator', 'infra-nat-gateway', 'infra-dns-server',
      'infra-dhcp-server', 'infra-radius-server', 'infra-ntp-server', 'infra-syslog-server', 'infra-monitoring-server',
      'infra-backup-server', 'infra-file-server', 'infra-web-server', 'infra-app-server', 'infra-mail-server'
    ]
  },
  computers: {
    name: 'Computers & Devices',
    icon: '🖥️',
    description: 'Computer and device components',
    shapes: [
      'computers-server', 'computers-workstation', 'computers-laptop', 'computers-tablet', 'computers-mobile',
      'computers-desktop', 'computers-imac', 'computers-macbook', 'computers-ipad', 'computers-iphone',
      'computers-android-phone', 'computers-android-tablet', 'computers-chromebook', 'computers-surface', 'computers-watch',
      'computers-mainframe', 'computers-terminal', 'computers-thin-client', 'computers-kiosk', 'computers-pos',
      'computers-scanner', 'computers-printer', 'computers-projector', 'computers-webcam', 'computers-headset'
    ]
  },
  people: {
    name: 'People & Roles',
    icon: '👥',
    description: 'User and role representations',
    shapes: [
      'people-user', 'people-admin', 'people-developer', 'people-analyst', 'people-customer',
      'people-manager', 'people-ceo', 'people-designer', 'people-tester', 'people-support',
      'people-sales', 'people-marketing', 'people-hr', 'people-finance', 'people-legal',
      'people-security-officer', 'people-consultant', 'people-architect', 'people-devops', 'people-data-scientist',
      'people-team', 'people-meeting', 'people-presentation', 'people-training', 'people-contractor'
    ]
  },
  database: {
    name: 'Database & Storage',
    icon: '🗄️',
    description: 'Database and storage components',
    shapes: [
      'database-sql', 'database-nosql', 'database-cache', 'database-warehouse', 'database-backup',
      'database-mysql', 'database-postgresql', 'database-oracle', 'database-mongodb', 'database-cassandra',
      'database-elasticsearch', 'database-redis', 'database-memcached', 'database-neo4j', 'database-influxdb',
      'storage-file', 'storage-object', 'storage-block', 'storage-archive', 'storage-backup',
      'storage-nas', 'storage-san', 'storage-tape', 'storage-optical', 'storage-cloud'
    ]
  },
  security: {
    name: 'Security',
    icon: '🔒',
    description: 'Security and authentication components',
    shapes: [
      'security-shield', 'security-lock', 'security-key', 'security-certificate', 'security-vpn',
      'security-antivirus', 'security-malware', 'security-encryption', 'security-decryption', 'security-hash',
      'security-signature', 'security-token', 'security-biometric', 'security-mfa', 'security-sso',
      'security-ldap', 'security-oauth', 'security-saml', 'security-kerberos', 'security-pki',
      'security-ids', 'security-ips', 'security-siem', 'security-vulnerability', 'security-compliance'
    ]
  },
  cloud: {
    name: 'Cloud Services',
    icon: '☁️',
    description: 'Cloud platform components',
    shapes: [
      'cloud-compute', 'cloud-storage', 'cloud-database', 'cloud-network', 'cloud-security',
      'cloud-serverless', 'cloud-container', 'cloud-kubernetes', 'cloud-api-gateway', 'cloud-load-balancer',
      'cloud-cdn', 'cloud-dns', 'cloud-monitoring', 'cloud-logging', 'cloud-backup',
      'cloud-analytics', 'cloud-ml', 'cloud-ai', 'cloud-iot', 'cloud-blockchain',
      'cloud-queue', 'cloud-notification', 'cloud-identity', 'cloud-billing', 'cloud-marketplace'
    ]
  },
  business: {
    name: 'Business & Office',
    icon: '🏢',
    description: 'Business and office components',
    shapes: [
      'business-building', 'business-office', 'business-factory', 'business-warehouse', 'business-store',
      'business-bank', 'business-hospital', 'business-school', 'business-government', 'business-datacenter',
      'business-meeting-room', 'business-conference', 'business-presentation', 'business-training', 'business-workshop',
      'business-document', 'business-contract', 'business-invoice', 'business-report', 'business-chart',
      'business-calendar', 'business-clock', 'business-email', 'business-phone', 'business-fax'
    ]
  },
  uml: {
    name: 'UML Diagrams',
    icon: '📋',
    description: 'Unified Modeling Language shapes',
    shapes: [
      'uml-class', 'uml-actor', 'uml-usecase', 'uml-interface', 'uml-package',
      'uml-component', 'uml-node', 'uml-artifact', 'uml-boundary', 'uml-control',
      'uml-entity', 'uml-lifeline', 'uml-activation', 'uml-message', 'uml-note',
      'uml-constraint', 'uml-dependency', 'uml-association', 'uml-aggregation', 'uml-composition',
      'uml-inheritance', 'uml-realization', 'uml-decision', 'uml-merge', 'uml-fork-join'
    ]
  }
};

/**
 * Get shape definition by ID
 * @param {string} shapeId - Shape ID
 * @returns {Object|null} Shape definition or null if not found
 */
export const getShapeDefinition = (shapeId) => {
  return SHAPE_DEFINITIONS[shapeId] || null;
};

/**
 * Get shapes by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of shape definitions
 */
export const getShapesByCategory = (categoryId) => {
  const category = SHAPE_CATEGORIES[categoryId];
  if (!category) return [];
  
  return category.shapes.map(shapeId => SHAPE_DEFINITIONS[shapeId]).filter(Boolean);
};

/**
 * Search shapes by name or tags
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching shape definitions
 */
export const searchShapes = (searchTerm) => {
  if (!searchTerm) return Object.values(SHAPE_DEFINITIONS);
  
  const term = searchTerm.toLowerCase();
  return Object.values(SHAPE_DEFINITIONS).filter(shape =>
    shape.name.toLowerCase().includes(term) ||
    shape.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

/**
 * Get all available categories
 * @returns {Array} Array of category objects
 */
export const getAllCategories = () => {
  return Object.entries(SHAPE_CATEGORIES).map(([id, category]) => ({
    id,
    ...category
  }));
};