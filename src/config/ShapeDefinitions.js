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

  // =================== NETWORKING SHAPES ===================
  'networking-router': {
    id: 'networking-router',
    name: 'Router',
    category: 'networking',
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

  'networking-switch': {
    id: 'networking-switch',
    name: 'Network Switch',
    category: 'networking',
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

  'networking-firewall': {
    id: 'networking-firewall',
    name: 'Firewall',
    category: 'networking',
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

  'networking-load-balancer': {
    id: 'networking-load-balancer',
    name: 'Load Balancer',
    category: 'networking',
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

  'networking-proxy': {
    id: 'networking-proxy',
    name: 'Proxy Server',
    category: 'networking',
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
  }
};

export const SHAPE_CATEGORIES = {
  basic: {
    name: 'Basic Shapes',
    icon: '⬜',
    description: 'Fundamental geometric shapes',
    shapes: ['basic-rectangle', 'basic-circle', 'basic-triangle', 'basic-diamond', 'basic-hexagon']
  },
  flowchart: {
    name: 'Flowchart',
    icon: '📊',
    description: 'Process flow and decision shapes',
    shapes: ['flowchart-process', 'flowchart-decision', 'flowchart-terminator', 'flowchart-document', 'flowchart-data']
  },
  networking: {
    name: 'Networking',
    icon: '🌐',
    description: 'Network infrastructure components',
    shapes: ['networking-router', 'networking-switch', 'networking-firewall', 'networking-load-balancer', 'networking-proxy']
  },
  computers: {
    name: 'Computers',
    icon: '🖥️',
    description: 'Computer and server components',
    shapes: ['computers-server', 'computers-workstation', 'computers-laptop', 'computers-tablet', 'computers-mobile']
  },
  people: {
    name: 'People',
    icon: '👥',
    description: 'User and actor representations',
    shapes: ['people-user', 'people-admin', 'people-developer', 'people-analyst', 'people-customer']
  },
  database: {
    name: 'Database',
    icon: '🗄️',
    description: 'Database and storage components',
    shapes: ['database-sql', 'database-nosql', 'database-cache', 'database-warehouse', 'database-backup']
  },
  security: {
    name: 'Security',
    icon: '🔒',
    description: 'Security and authentication components',
    shapes: ['security-shield', 'security-lock', 'security-key', 'security-certificate', 'security-vpn']
  },
  aws: {
    name: 'AWS',
    icon: '☁️',
    description: 'Amazon Web Services components',
    shapes: ['aws-ec2', 'aws-s3', 'aws-lambda', 'aws-rds', 'aws-api-gateway']
  },
  network: {
    name: 'Network',
    icon: '🌐',
    description: 'Network and infrastructure components',
    shapes: ['network-server', 'network-database', 'network-cloud', 'network-router', 'network-firewall']
  },
  uml: {
    name: 'UML',
    icon: '📋',
    description: 'Unified Modeling Language shapes',
    shapes: ['uml-class', 'uml-actor', 'uml-usecase']
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