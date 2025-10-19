import React from 'react';

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You can also log to an error reporting service here
        // Example: Sentry.captureException(error);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });

        // Call optional reset callback
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    reset: this.handleReset
                });
            }

            // Default fallback UI
            return (
                <div style={{
                    padding: '20px',
                    margin: '20px',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2'
                }}>
                    <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>
                        Something went wrong
                    </h2>
                    <p style={{ marginBottom: '10px' }}>
                        {this.props.message || 'An unexpected error occurred in this component.'}
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '10px' }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                                Error Details
                            </summary>
                            <pre style={{
                                backgroundColor: '#f3f4f6',
                                padding: '10px',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '12px'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                {'\n\n'}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}

                    <button
                        onClick={this.handleReset}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Specialized Error Boundary for Editor Components
 * Provides editor-specific error recovery
 */
export class EditorErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Editor Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h3 className="text-xl font-semibold text-red-600 mb-4">
                        Editor Error
                    </h3>
                    <p className="text-gray-600 mb-4">
                        The diagram editor encountered an error. Your work has been preserved.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reload Editor
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Specialized Error Boundary for Service Layer
 * Allows graceful degradation when services fail
 */
export class ServiceErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Service Layer Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800">
                        Service temporarily unavailable. Some features may be limited.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
