export class NodeTypePlugin {
    constructor() {
        this.nodeTypes = new Map();
        this.nodeValidators = new Map();
        this.setupDefaultNodeTypes();
    }

    /**
     * Setup default node types
     */
    setupDefaultNodeTypes() {
        // Register default node types
        this.registerNodeType('component', {
            name: 'Component',
            description: 'A software component or service',
            defaultSize: { width: 150, height: 80 },
            defaultColor: '#E3F2FD',
            defaultBorderColor: '#2196F3',
            icon: '⚙️',
            category: 'basic'
        });

        this.registerNodeType('container', {
            name: 'Container',
            description: 'A container or grouping element',
            defaultSize: { width: 400, height: 300 },
            defaultColor: '#F3E5F5',
            defaultBorderColor: '#9C27B0',
            icon: '📦',
            category: 'basic'
        });

        this.registerNodeType('diamond', {
            name: 'Diamond',
            description: 'A decision or gateway node',
            defaultSize: { width: 120, height: 80 },
            defaultColor: '#FFF3E0',
            defaultBorderColor: '#FF9800',
            icon: '💎',
            category: 'shapes'
        });

        this.registerNodeType('circle', {
            name: 'Circle',
            description: 'A circular node',
            defaultSize: { width: 100, height: 100 },
            defaultColor: '#E8F5E8',
            defaultBorderColor: '#4CAF50',
            icon: '⭕',
            category: 'shapes'
        });

        this.registerNodeType('hexagon', {
            name: 'Hexagon',
            description: 'A hexagonal node',
            defaultSize: { width: 120, height: 80 },
            defaultColor: '#FCE4EC',
            defaultBorderColor: '#E91E63',
            icon: '⬡',
            category: 'shapes'
        });

        this.registerNodeType('triangle', {
            name: 'Triangle',
            description: 'A triangular node',
            defaultSize: { width: 100, height: 80 },
            defaultColor: '#E0F2F1',
            defaultBorderColor: '#009688',
            icon: '🔺',
            category: 'shapes'
        });
    }

    /**
     * Register a new node type
     * @param {string} type - Node type identifier
     * @param {Object} config - Node type configuration
     */
    registerNodeType(type, config) {
        // Validate node type configuration
        this.validateNodeTypeConfig(config);
        
        this.nodeTypes.set(type, {
            type,
            ...config,
            registeredAt: new Date().toISOString()
        });

        // Register default validator for this node type
        this.registerNodeValidator(type, this.createDefaultValidator(config));
    }

    /**
     * Get a node type by identifier
     * @param {string} type - Node type identifier
     * @returns {Object|null} Node type configuration or null if not found
     */
    getNodeType(type) {
        return this.nodeTypes.get(type) || null;
    }

    /**
     * Get all registered node types
     * @returns {Array} Array of node type configurations
     */
    getAllNodeTypes() {
        return Array.from(this.nodeTypes.values());
    }

    /**
     * Get node types by category
     * @param {string} category - Category name
     * @returns {Array} Array of node types in the category
     */
    getNodeTypesByCategory(category) {
        return this.getAllNodeTypes().filter(nodeType => nodeType.category === category);
    }

    /**
     * Get available categories
     * @returns {Array} Array of category names
     */
    getAvailableCategories() {
        const categories = new Set();
        this.getAllNodeTypes().forEach(nodeType => {
            categories.add(nodeType.category);
        });
        return Array.from(categories);
    }

    /**
     * Register a validator for a node type
     * @param {string} type - Node type identifier
     * @param {Function} validator - Validation function
     */
    registerNodeValidator(type, validator) {
        this.nodeValidators.set(type, validator);
    }

    /**
     * Validate a node against its type
     * @param {Object} node - Node object to validate
     * @returns {Object} Validation result
     */
    validateNode(node) {
        const nodeType = this.getNodeType(node.type);
        if (!nodeType) {
            return {
                isValid: false,
                error: `Unknown node type: ${node.type}`
            };
        }

        const validator = this.nodeValidators.get(node.type);
        if (validator) {
            return validator(node);
        }

        // Default validation
        return this.createDefaultValidator(nodeType)(node);
    }

    /**
     * Create a default validator for a node type
     * @param {Object} config - Node type configuration
     * @returns {Function} Validation function
     */
    createDefaultValidator(config) {
        return (node) => {
            const errors = [];

            // Check required fields
            if (!node.id) {
                errors.push('Node must have an id');
            }
            if (!node.label) {
                errors.push('Node must have a label');
            }
            if (!node.position || !node.position.x || !node.position.y) {
                errors.push('Node must have a valid position');
            }

            // Check size constraints
            if (node.size) {
                const { width, height } = node.size;
                if (width && (width < 50 || width > 1000)) {
                    errors.push('Node width must be between 50 and 1000');
                }
                if (height && (height < 30 || height > 1000)) {
                    errors.push('Node height must be between 30 and 1000');
                }
            }

            return {
                isValid: errors.length === 0,
                errors,
                errorMessage: errors.join('; ')
            };
        };
    }

    /**
     * Validate node type configuration
     * @param {Object} config - Node type configuration
     * @throws {Error} If configuration is invalid
     */
    validateNodeTypeConfig(config) {
        const requiredFields = ['name', 'description', 'defaultSize', 'defaultColor', 'defaultBorderColor'];
        const missingFields = requiredFields.filter(field => !config[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields for node type: ${missingFields.join(', ')}`);
        }

        // Validate default size
        const { width, height } = config.defaultSize;
        if (!width || !height || width < 50 || height < 30) {
            throw new Error('Default size must have width >= 50 and height >= 30');
        }

        // Validate colors
        if (!this.isValidColor(config.defaultColor)) {
            throw new Error('Invalid default color');
        }
        if (!this.isValidColor(config.defaultBorderColor)) {
            throw new Error('Invalid default border color');
        }
    }

    /**
     * Check if a color value is valid
     * @param {string} color - Color value to validate
     * @returns {boolean} True if valid color
     */
    isValidColor(color) {
        if (!color || typeof color !== 'string') {
            return false;
        }

        // Check for hex color
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            return true;
        }

        // Check for rgb/rgba color
        if (/^rgb\(|^rgba\(/.test(color)) {
            return true;
        }

        // Check for named colors (basic check)
        const namedColors = [
            'red', 'green', 'blue', 'yellow', 'black', 'white', 'gray', 'grey',
            'orange', 'purple', 'pink', 'brown', 'cyan', 'magenta', 'lime',
            'navy', 'teal', 'olive', 'maroon', 'silver', 'gold'
        ];
        
        return namedColors.includes(color.toLowerCase());
    }

    /**
     * Create a new node with default values for a type
     * @param {string} type - Node type identifier
     * @param {Object} overrides - Values to override defaults
     * @returns {Object} New node object
     */
    createNode(type, overrides = {}) {
        const nodeType = this.getNodeType(type);
        if (!nodeType) {
            throw new Error(`Unknown node type: ${type}`);
        }

        const defaultNode = {
            id: this.generateNodeId(type),
            type: type,
            label: nodeType.name,
            position: { x: 0, y: 0 },
            size: { ...nodeType.defaultSize },
            color: nodeType.defaultColor,
            borderColor: nodeType.defaultBorderColor,
            icon: nodeType.icon,
            description: nodeType.description,
            category: nodeType.category
        };

        return { ...defaultNode, ...overrides };
    }

    /**
     * Generate a unique node ID
     * @param {string} type - Node type identifier
     * @returns {string} Unique node ID
     */
    generateNodeId(type) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${type}-${timestamp}-${random}`;
    }

    /**
     * Get node type statistics
     * @returns {Object} Statistics about registered node types
     */
    getNodeTypeStats() {
        const nodeTypes = this.getAllNodeTypes();
        const categories = this.getAvailableCategories();
        
        return {
            totalTypes: nodeTypes.length,
            categories: categories.length,
            typesByCategory: categories.reduce((acc, category) => {
                acc[category] = this.getNodeTypesByCategory(category).length;
                return acc;
            }, {}),
            averageSize: nodeTypes.reduce((acc, nodeType) => {
                const { width, height } = nodeType.defaultSize;
                acc.width += width;
                acc.height += height;
                return acc;
            }, { width: 0, height: 0 })
        };
    }

    /**
     * Remove a node type
     * @param {string} type - Node type identifier
     * @returns {boolean} True if removed successfully
     */
    removeNodeType(type) {
        const removed = this.nodeTypes.delete(type);
        if (removed) {
            this.nodeValidators.delete(type);
        }
        return removed;
    }

    /**
     * Update a node type configuration
     * @param {string} type - Node type identifier
     * @param {Object} updates - Configuration updates
     * @returns {boolean} True if updated successfully
     */
    updateNodeType(type, updates) {
        const nodeType = this.getNodeType(type);
        if (!nodeType) {
            return false;
        }

        // Validate updates
        if (updates.defaultSize) {
            const { width, height } = updates.defaultSize;
            if (width < 50 || height < 30) {
                throw new Error('Updated size must have width >= 50 and height >= 30');
            }
        }

        if (updates.defaultColor && !this.isValidColor(updates.defaultColor)) {
            throw new Error('Invalid default color');
        }

        if (updates.defaultBorderColor && !this.isValidColor(updates.defaultBorderColor)) {
            throw new Error('Invalid default border color');
        }

        // Update the node type
        const updatedNodeType = { ...nodeType, ...updates };
        this.nodeTypes.set(type, updatedNodeType);

        return true;
    }
} 