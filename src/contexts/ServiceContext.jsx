import React, { createContext, useContext, useEffect, useState } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import enhancedEdgeManager from '../services/EnhancedEdgeManager';

/**
 * Service Context for Dependency Injection
 * Provides centralized access to all services throughout the app
 */
const ServiceContext = createContext(null);

/**
 * Hook to access services from anywhere in the component tree
 * @returns {Object} Service factory instance with all services
 */
export const useServices = () => {
    const context = useContext(ServiceContext);

    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }

    return context;
};

/**
 * Hook to access a specific service by name
 * @param {string} serviceName - Name of the service to retrieve
 * @returns {Object} Service instance
 */
export const useService = (serviceName) => {
    const { serviceFactory } = useServices();

    if (!serviceFactory) {
        throw new Error('ServiceFactory not initialized');
    }

    return serviceFactory.getService(serviceName);
};

/**
 * Service Provider Component
 * Initializes and provides services to the entire app
 */
export const ServiceProvider = ({ children }) => {
    const [serviceFactory, setServiceFactory] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeServices = async () => {
            try {
                console.log('[ServiceProvider] Initializing services...');

                // Create and initialize service factory
                const factory = ServiceFactory.create();
                await factory.initialize();

                console.log('[ServiceProvider] ServiceFactory initialized');

                // Initialize enhanced edge manager
                await enhancedEdgeManager.initialize({
                    enablePerformanceMonitoring: true,
                    enableLayoutAwareRouting: true,
                    enableBatchProcessing: true,
                    virtualBendsEnabled: true,
                    intersectionDetectionEnabled: true,
                    debounceTime: 100
                });

                console.log('[ServiceProvider] EnhancedEdgeManager initialized');

                setServiceFactory(factory);
                setIsInitialized(true);

                console.log('[ServiceProvider] All services initialized successfully');
            } catch (err) {
                console.error('[ServiceProvider] Failed to initialize services:', err);
                setError(err);
            }
        };

        initializeServices();

        // Cleanup on unmount
        return () => {
            if (serviceFactory) {
                serviceFactory.reset();
            }
        };
    }, []);

    // Show loading state while initializing
    if (!isInitialized && !error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing services...</p>
                </div>
            </div>
        );
    }

    // Show error state if initialization failed
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        Service Initialization Failed
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error.message || 'Unable to initialize application services'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ServiceContext.Provider
            value={{
                serviceFactory,
                isInitialized,
                enhancedEdgeManager
            }}
        >
            {children}
        </ServiceContext.Provider>
    );
};

/**
 * Higher-Order Component to inject services into a component
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with services prop
 */
export const withServices = (Component) => {
    return (props) => {
        const services = useServices();

        return <Component {...props} services={services} />;
    };
};

export default ServiceContext;
