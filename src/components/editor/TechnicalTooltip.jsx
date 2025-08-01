import React from 'react';
import { extractTechnicalDetails, extractConnectionTechnicalDetails, getTechnicalColor } from '../utils/technicalDetailsParser';

const TechnicalTooltip = ({ element, position, isVisible }) => {
    if (!isVisible || !element) return null;

    const isNode = element.type === 'node';
    const technicalDetails = isNode 
        ? extractTechnicalDetails(element)
        : extractConnectionTechnicalDetails(element);

    const elementLabel = element.data?.label || element.label || 'Unknown Element';

    return (
        <div 
            className="technical-tooltip absolute z-50 pointer-events-none"
            style={{
                left: position.x + 10,
                top: position.y + 10,
            }}
        >
            <div className="tooltip-content bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs pointer-events-auto">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {elementLabel}
                </h4>
                
                <div className="tech-badges flex flex-wrap gap-1 mb-2">
                    {/* Protocol Badge */}
                    {technicalDetails.protocol !== 'N/A' && (
                        <span className={`badge ${getTechnicalColor('protocol', technicalDetails.protocol.split(', ')[0])} text-xs px-2 py-1 rounded`}>
                            {technicalDetails.protocol.split(', ')[0]}
                        </span>
                    )}
                    
                    {/* Security Badge */}
                    {isNode && technicalDetails.security !== 'N/A' && (
                        <span className={`badge ${getTechnicalColor('security', technicalDetails.security.split(', ')[0])} text-xs px-2 py-1 rounded`}>
                            {technicalDetails.security.split(', ')[0]}
                        </span>
                    )}
                    
                    {/* Performance Badge */}
                    {technicalDetails.performance.latency && (
                        <span className={`badge ${getTechnicalColor('performance', 'latency')} text-xs px-2 py-1 rounded`}>
                            {technicalDetails.performance.latency}
                        </span>
                    )}
                    
                    {/* Scaling Badge (for nodes) */}
                    {isNode && technicalDetails.scaling !== 'N/A' && (
                        <span className={`badge ${getTechnicalColor('scaling', technicalDetails.scaling.split(', ')[0])} text-xs px-2 py-1 rounded`}>
                            {technicalDetails.scaling.split(', ')[0]}
                        </span>
                    )}
                    
                    {/* Infrastructure Badge (for nodes) */}
                    {isNode && technicalDetails.infrastructure !== 'N/A' && (
                        <span className={`badge ${getTechnicalColor('infrastructure', technicalDetails.infrastructure.split(', ')[0])} text-xs px-2 py-1 rounded`}>
                            {technicalDetails.infrastructure.split(', ')[0]}
                        </span>
                    )}
                    
                    {/* Failure Handling Badge (for edges) */}
                    {!isNode && technicalDetails.failureHandling !== 'N/A' && (
                        <span className="badge bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            {technicalDetails.failureHandling.split(', ')[0]}
                        </span>
                    )}
                </div>
                
                {/* Quick Summary */}
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {technicalDetails.protocol !== 'N/A' && (
                        <div>Protocol: {technicalDetails.protocol}</div>
                    )}
                    
                    {technicalDetails.performance.throughput && (
                        <div>Throughput: {technicalDetails.performance.throughput} req/sec</div>
                    )}
                    
                    {technicalDetails.performance.timeout && (
                        <div>Timeout: {technicalDetails.performance.timeout}s</div>
                    )}
                    
                    {isNode && technicalDetails.scaling !== 'N/A' && (
                        <div>Scaling: {technicalDetails.scaling}</div>
                    )}
                    
                    {isNode && technicalDetails.infrastructure !== 'N/A' && (
                        <div>Infrastructure: {technicalDetails.infrastructure}</div>
                    )}
                    
                    {!isNode && technicalDetails.failureHandling !== 'N/A' && (
                        <div>Failure Handling: {technicalDetails.failureHandling}</div>
                    )}
                </div>
                
                {/* Description Preview */}
                {element.data?.description && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {element.data.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicalTooltip; 