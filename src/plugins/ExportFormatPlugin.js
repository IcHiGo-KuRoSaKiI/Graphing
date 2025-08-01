export class ExportFormatPlugin {
    constructor() {
        this.formats = new Map();
        this.formatValidators = new Map();
        this.setupDefaultFormats();
    }

    /**
     * Setup default export formats
     */
    setupDefaultFormats() {
        // Register JSON format
        this.registerFormat('json', {
            name: 'JSON',
            description: 'JavaScript Object Notation format',
            mimeType: 'application/json',
            extension: '.json',
            category: 'data',
            supported: true,
            configurable: true
        });

        // Register PNG format
        this.registerFormat('png', {
            name: 'PNG',
            description: 'Portable Network Graphics image format',
            mimeType: 'image/png',
            extension: '.png',
            category: 'image',
            supported: true,
            configurable: true
        });

        // Register JPG format
        this.registerFormat('jpg', {
            name: 'JPEG',
            description: 'Joint Photographic Experts Group image format',
            mimeType: 'image/jpeg',
            extension: '.jpg',
            category: 'image',
            supported: true,
            configurable: true
        });

        // Register SVG format
        this.registerFormat('svg', {
            name: 'SVG',
            description: 'Scalable Vector Graphics format',
            mimeType: 'image/svg+xml',
            extension: '.svg',
            category: 'vector',
            supported: true,
            configurable: true
        });

        // Register Draw.io XML format
        this.registerFormat('drawio', {
            name: 'Draw.io XML',
            description: 'Draw.io compatible XML format',
            mimeType: 'application/xml',
            extension: '.drawio',
            category: 'interchange',
            supported: true,
            configurable: false
        });
    }

    /**
     * Register a new export format
     * @param {string} format - Format identifier
     * @param {Object} config - Format configuration
     */
    registerFormat(format, config) {
        // Validate format configuration
        this.validateFormatConfig(config);
        
        this.formats.set(format, {
            format,
            ...config,
            registeredAt: new Date().toISOString()
        });

        // Register default validator for this format
        this.registerFormatValidator(format, this.createDefaultValidator(config));
    }

    /**
     * Get a format by identifier
     * @param {string} format - Format identifier
     * @returns {Object|null} Format configuration or null if not found
     */
    getFormat(format) {
        return this.formats.get(format) || null;
    }

    /**
     * Get all registered formats
     * @returns {Array} Array of format configurations
     */
    getAllFormats() {
        return Array.from(this.formats.values());
    }

    /**
     * Get formats by category
     * @param {string} category - Category name
     * @returns {Array} Array of formats in the category
     */
    getFormatsByCategory(category) {
        return this.getAllFormats().filter(format => format.category === category);
    }

    /**
     * Get available categories
     * @returns {Array} Array of category names
     */
    getAvailableCategories() {
        const categories = new Set();
        this.getAllFormats().forEach(format => {
            categories.add(format.category);
        });
        return Array.from(categories);
    }

    /**
     * Get supported formats
     * @returns {Array} Array of supported format configurations
     */
    getSupportedFormats() {
        return this.getAllFormats().filter(format => format.supported);
    }

    /**
     * Register a validator for a format
     * @param {string} format - Format identifier
     * @param {Function} validator - Validation function
     */
    registerFormatValidator(format, validator) {
        this.formatValidators.set(format, validator);
    }

    /**
     * Validate export options for a format
     * @param {string} format - Format identifier
     * @param {Object} options - Export options
     * @returns {Object} Validation result
     */
    validateExportOptions(format, options) {
        const formatConfig = this.getFormat(format);
        if (!formatConfig) {
            return {
                isValid: false,
                error: `Unknown export format: ${format}`
            };
        }

        const validator = this.formatValidators.get(format);
        if (validator) {
            return validator(options);
        }

        // Default validation
        return this.createDefaultValidator(formatConfig)(options);
    }

    /**
     * Create a default validator for a format
     * @param {Object} config - Format configuration
     * @returns {Function} Validation function
     */
    createDefaultValidator(config) {
        return (options) => {
            const errors = [];

            // Check if format is supported
            if (!config.supported) {
                errors.push(`Format ${config.name} is not supported`);
            }

            // Validate image-specific options
            if (config.category === 'image' || config.category === 'vector') {
                const { width, height } = options;
                if (width && (width < 100 || width > 10000)) {
                    errors.push('Width must be between 100 and 10000');
                }
                if (height && (height < 100 || height > 10000)) {
                    errors.push('Height must be between 100 and 10000');
                }
            }

            // Validate quality for image formats
            if (config.category === 'image' && options.quality !== undefined) {
                if (options.quality < 0 || options.quality > 1) {
                    errors.push('Quality must be between 0 and 1');
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
     * Validate format configuration
     * @param {Object} config - Format configuration
     * @throws {Error} If configuration is invalid
     */
    validateFormatConfig(config) {
        const requiredFields = ['name', 'description', 'mimeType', 'extension', 'category'];
        const missingFields = requiredFields.filter(field => !config[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields for format: ${missingFields.join(', ')}`);
        }

        // Validate MIME type format
        if (!this.isValidMimeType(config.mimeType)) {
            throw new Error('Invalid MIME type format');
        }

        // Validate extension format
        if (!config.extension.startsWith('.')) {
            throw new Error('Extension must start with a dot');
        }

        // Validate category
        const validCategories = ['data', 'image', 'vector', 'interchange'];
        if (!validCategories.includes(config.category)) {
            throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
    }

    /**
     * Check if a MIME type is valid
     * @param {string} mimeType - MIME type to validate
     * @returns {boolean} True if valid MIME type
     */
    isValidMimeType(mimeType) {
        if (!mimeType || typeof mimeType !== 'string') {
            return false;
        }

        // Basic MIME type pattern validation
        const mimeTypePattern = /^[a-z]+\/[a-z0-9\-\.\+]+$/i;
        return mimeTypePattern.test(mimeType);
    }

    /**
     * Get format information for display
     * @param {string} format - Format identifier
     * @returns {Object} Format information
     */
    getFormatInfo(format) {
        const formatConfig = this.getFormat(format);
        if (!formatConfig) {
            return null;
        }

        return {
            name: formatConfig.name,
            description: formatConfig.description,
            category: formatConfig.category,
            supported: formatConfig.supported,
            configurable: formatConfig.configurable,
            mimeType: formatConfig.mimeType,
            extension: formatConfig.extension
        };
    }

    /**
     * Get default options for a format
     * @param {string} format - Format identifier
     * @returns {Object} Default options
     */
    getDefaultOptions(format) {
        const formatConfig = this.getFormat(format);
        if (!formatConfig) {
            return {};
        }

        const defaults = {
            filename: `diagram${formatConfig.extension}`,
            includeMetadata: true
        };

        // Add format-specific defaults
        switch (formatConfig.category) {
            case 'image':
                defaults.width = 1920;
                defaults.height = 1080;
                defaults.backgroundColor = '#ffffff';
                defaults.quality = 0.9;
                break;
            case 'vector':
                defaults.width = 1920;
                defaults.height = 1080;
                defaults.backgroundColor = '#ffffff';
                break;
            case 'data':
                defaults.prettyPrint = true;
                break;
        }

        return defaults;
    }

    /**
     * Generate filename for export
     * @param {string} format - Format identifier
     * @param {Object} options - Export options
     * @returns {string} Generated filename
     */
    generateFilename(format, options = {}) {
        const formatConfig = this.getFormat(format);
        if (!formatConfig) {
            return `export${formatConfig?.extension || '.txt'}`;
        }

        const baseName = options.filename || 'diagram';
        const timestamp = options.includeTimestamp ? `-${Date.now()}` : '';
        return `${baseName}${timestamp}${formatConfig.extension}`;
    }

    /**
     * Get format statistics
     * @returns {Object} Statistics about registered formats
     */
    getFormatStats() {
        const formats = this.getAllFormats();
        const categories = this.getAvailableCategories();
        
        return {
            totalFormats: formats.length,
            supportedFormats: formats.filter(f => f.supported).length,
            categories: categories.length,
            formatsByCategory: categories.reduce((acc, category) => {
                acc[category] = this.getFormatsByCategory(category).length;
                return acc;
            }, {}),
            configurableFormats: formats.filter(f => f.configurable).length
        };
    }

    /**
     * Remove a format
     * @param {string} format - Format identifier
     * @returns {boolean} True if removed successfully
     */
    removeFormat(format) {
        const removed = this.formats.delete(format);
        if (removed) {
            this.formatValidators.delete(format);
        }
        return removed;
    }

    /**
     * Update a format configuration
     * @param {string} format - Format identifier
     * @param {Object} updates - Configuration updates
     * @returns {boolean} True if updated successfully
     */
    updateFormat(format, updates) {
        const formatConfig = this.getFormat(format);
        if (!formatConfig) {
            return false;
        }

        // Validate updates
        if (updates.mimeType && !this.isValidMimeType(updates.mimeType)) {
            throw new Error('Invalid MIME type');
        }

        if (updates.extension && !updates.extension.startsWith('.')) {
            throw new Error('Extension must start with a dot');
        }

        // Update the format
        const updatedFormat = { ...formatConfig, ...updates };
        this.formats.set(format, updatedFormat);

        return true;
    }

    /**
     * Check if a format is supported
     * @param {string} format - Format identifier
     * @returns {boolean} True if format is supported
     */
    isFormatSupported(format) {
        const formatConfig = this.getFormat(format);
        return formatConfig ? formatConfig.supported : false;
    }

    /**
     * Check if a format is configurable
     * @param {string} format - Format identifier
     * @returns {boolean} True if format is configurable
     */
    isFormatConfigurable(format) {
        const formatConfig = this.getFormat(format);
        return formatConfig ? formatConfig.configurable : false;
    }
} 