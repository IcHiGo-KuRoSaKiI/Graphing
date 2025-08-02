/**
 * Session Manager
 * Manages diagram sessions for MCP agents
 */
export class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
        
        // Start cleanup timer
        this.startCleanupTimer();
    }

    /**
     * Get or create a session
     * @param {string} sessionId - Session ID
     * @returns {Promise<Object>} Session object
     */
    async getOrCreateSession(sessionId) {
        if (!sessionId) {
            sessionId = this.generateSessionId();
        }

        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, this.createSession(sessionId));
        }

        const session = this.sessions.get(sessionId);
        session.lastAccessed = Date.now();
        
        // Set current session ID for tool compatibility
        this.currentSessionId = sessionId;
        
        return session;
    }

    /**
     * Create a new session
     * @param {string} sessionId - Session ID
     * @returns {Object} Session object
     */
    createSession(sessionId) {
        const session = {
            id: sessionId,
            created: Date.now(),
            lastAccessed: Date.now(),
            diagram: null,
            history: [],
            metadata: {
                agent: 'MCP Agent',
                version: '1.0.0',
                features: ['create', 'export', 'layout', 'technical_details']
            }
        };

        // Add tool-compatible methods
        session.setDiagram = (diagram) => {
            // Add to history
            if (session.diagram) {
                session.history.push({
                    timestamp: Date.now(),
                    diagram: session.diagram
                });
                
                // Keep only last 10 versions
                if (session.history.length > 10) {
                    session.history = session.history.slice(-10);
                }
            }
            
            session.diagram = diagram;
            session.lastAccessed = Date.now();
        };

        session.getDiagram = () => {
            session.lastAccessed = Date.now();
            return session.diagram;
        };

        return session;
    }

    /**
     * Generate a unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get session by ID
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Session object or null
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastAccessed = Date.now();
        }
        return session;
    }

    /**
     * Set diagram in session
     * @param {string} sessionId - Session ID
     * @param {Object} diagram - Diagram data
     */
    setSessionDiagram(sessionId, diagram) {
        const session = this.getSession(sessionId);
        if (session) {
            // Add to history
            if (session.diagram) {
                session.history.push({
                    timestamp: Date.now(),
                    diagram: session.diagram
                });
                
                // Keep only last 10 versions
                if (session.history.length > 10) {
                    session.history = session.history.slice(-10);
                }
            }
            
            session.diagram = diagram;
            session.lastAccessed = Date.now();
        }
    }

    /**
     * Set diagram in current session (for tool compatibility)
     * @param {Object} diagram - Diagram data
     */
    setDiagram(diagram) {
        if (this.currentSessionId) {
            this.setSessionDiagram(this.currentSessionId, diagram);
        }
    }

    /**
     * Get diagram from current session (for tool compatibility)
     * @returns {Object|null} Diagram data
     */
    getDiagram() {
        if (this.currentSessionId) {
            return this.getSessionDiagram(this.currentSessionId);
        }
        return null;
    }

    /**
     * Get diagram from session
     * @param {string} sessionId - Session ID
     * @returns {Object|null} Diagram data or null
     */
    getSessionDiagram(sessionId) {
        const session = this.getSession(sessionId);
        return session ? session.diagram : null;
    }

    /**
     * Get session history
     * @param {string} sessionId - Session ID
     * @returns {Array} Session history
     */
    getSessionHistory(sessionId) {
        const session = this.getSession(sessionId);
        return session ? session.history : [];
    }

    /**
     * Update session metadata
     * @param {string} sessionId - Session ID
     * @param {Object} metadata - Metadata to update
     */
    updateSessionMetadata(sessionId, metadata) {
        const session = this.getSession(sessionId);
        if (session) {
            session.metadata = {
                ...session.metadata,
                ...metadata,
                lastUpdated: Date.now()
            };
        }
    }

    /**
     * Delete session
     * @param {string} sessionId - Session ID
     * @returns {boolean} Success status
     */
    deleteSession(sessionId) {
        return this.sessions.delete(sessionId);
    }

    /**
     * List all active sessions
     * @returns {Array} Array of session information
     */
    listSessions() {
        const sessions = [];
        for (const [sessionId, session] of this.sessions) {
            sessions.push({
                id: sessionId,
                created: session.created,
                lastAccessed: session.lastAccessed,
                hasDiagram: !!session.diagram,
                historyLength: session.history.length,
                metadata: session.metadata
            });
        }
        return sessions;
    }

    /**
     * Get session statistics
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        const sessions = Array.from(this.sessions.values());
        const now = Date.now();
        
        return {
            totalSessions: sessions.length,
            activeSessions: sessions.filter(s => now - s.lastAccessed < this.sessionTimeout).length,
            sessionsWithDiagrams: sessions.filter(s => s.diagram).length,
            averageHistoryLength: sessions.reduce((sum, s) => sum + s.history.length, 0) / sessions.length || 0,
            oldestSession: sessions.length > 0 ? Math.min(...sessions.map(s => s.created)) : null,
            newestSession: sessions.length > 0 ? Math.max(...sessions.map(s => s.created)) : null
        };
    }

    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, this.cleanupInterval);
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];
        
        for (const [sessionId, session] of this.sessions) {
            if (now - session.lastAccessed > this.sessionTimeout) {
                expiredSessions.push(sessionId);
            }
        }
        
        expiredSessions.forEach(sessionId => {
            this.sessions.delete(sessionId);
            console.log(`Cleaned up expired session: ${sessionId}`);
        });
        
        if (expiredSessions.length > 0) {
            console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
        }
    }

    /**
     * Cleanup all sessions
     */
    async cleanup() {
        this.sessions.clear();
        console.log('All sessions cleaned up');
    }

    /**
     * Export session data
     * @param {string} sessionId - Session ID
     * @returns {Object} Session export data
     */
    exportSession(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            return null;
        }
        
        return {
            id: session.id,
            created: session.created,
            lastAccessed: session.lastAccessed,
            diagram: session.diagram,
            history: session.history,
            metadata: session.metadata
        };
    }

    /**
     * Import session data
     * @param {Object} sessionData - Session data to import
     * @returns {string} Session ID
     */
    importSession(sessionData) {
        const sessionId = sessionData.id || this.generateSessionId();
        
        this.sessions.set(sessionId, {
            id: sessionId,
            created: sessionData.created || Date.now(),
            lastAccessed: sessionData.lastAccessed || Date.now(),
            diagram: sessionData.diagram || null,
            history: sessionData.history || [],
            metadata: sessionData.metadata || {}
        });
        
        return sessionId;
    }
} 