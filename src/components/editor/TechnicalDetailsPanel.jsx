import React from 'react';
import { X } from 'lucide-react';
import { extractTechnicalDetails, extractConnectionTechnicalDetails, getTechnicalColor } from '../utils/technicalDetailsParser';

const TechnicalDetailsPanel = ({ selectedElement, onClose, isOpen }) => {
    if (!isOpen || !selectedElement) return null;

    const isNode = selectedElement.type === 'node';
    const technicalDetails = isNode 
        ? extractTechnicalDetails(selectedElement)
        : extractConnectionTechnicalDetails(selectedElement);

    const elementLabel = selectedElement.data?.label || selectedElement.label || 'Unknown Element';

    return (
        <div className="technical-details-panel fixed right-5 top-20 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="panel-header flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Technical Specifications
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            
            <div className="panel-content p-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-gray-600">
                    {elementLabel}
                </h4>
                
                <div className="tech-specs space-y-3">
                    {/* Protocol */}
                    <div className="spec-item flex justify-between items-start">
                        <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                            Protocol:
                        </span>
                        <span className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48 break-words">
                            {technicalDetails.protocol}
                        </span>
                    </div>
                    
                    {/* Performance */}
                    <div className="spec-item flex justify-between items-start">
                        <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                            Performance:
                        </span>
                        <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                            {technicalDetails.performance.latency && (
                                <div className="mb-1">
                                    <span className={`badge ${getTechnicalColor('performance', 'latency')} text-xs px-2 py-1 rounded`}>
                                        Latency: {technicalDetails.performance.latency}
                                    </span>
                                </div>
                            )}
                            {technicalDetails.performance.throughput && (
                                <div className="mb-1">
                                    <span className={`badge ${getTechnicalColor('performance', 'throughput')} text-xs px-2 py-1 rounded`}>
                                        Throughput: {technicalDetails.performance.throughput} req/sec
                                    </span>
                                </div>
                            )}
                            {technicalDetails.performance.timeout && (
                                <div className="mb-1">
                                    <span className="badge bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                        Timeout: {technicalDetails.performance.timeout}s
                                    </span>
                                </div>
                            )}
                            {!technicalDetails.performance.latency && !technicalDetails.performance.throughput && !technicalDetails.performance.timeout && (
                                <span className="text-gray-500">N/A</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Security */}
                    <div className="spec-item flex justify-between items-start">
                        <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                            Security:
                        </span>
                        <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                            {technicalDetails.security !== 'N/A' ? (
                                technicalDetails.security.split(', ').map((sec, index) => (
                                    <span 
                                        key={index}
                                        className={`badge ${getTechnicalColor('security', sec.trim())} text-xs px-2 py-1 rounded mr-1 mb-1 inline-block`}
                                    >
                                        {sec.trim()}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500">N/A</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Node-specific details */}
                    {isNode && (
                        <>
                            {/* Scaling */}
                            <div className="spec-item flex justify-between items-start">
                                <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Scaling:
                                </span>
                                <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                                    {technicalDetails.scaling !== 'N/A' ? (
                                        technicalDetails.scaling.split(', ').map((scale, index) => (
                                            <span 
                                                key={index}
                                                className={`badge ${getTechnicalColor('scaling', scale.trim())} text-xs px-2 py-1 rounded mr-1 mb-1 inline-block`}
                                            >
                                                {scale.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Infrastructure */}
                            <div className="spec-item flex justify-between items-start">
                                <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Infrastructure:
                                </span>
                                <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                                    {technicalDetails.infrastructure !== 'N/A' ? (
                                        technicalDetails.infrastructure.split(', ').map((infra, index) => (
                                            <span 
                                                key={index}
                                                className={`badge ${getTechnicalColor('infrastructure', infra.trim())} text-xs px-2 py-1 rounded mr-1 mb-1 inline-block`}
                                            >
                                                {infra.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Monitoring */}
                            <div className="spec-item flex justify-between items-start">
                                <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Monitoring:
                                </span>
                                <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                                    {technicalDetails.monitoring !== 'N/A' ? (
                                        technicalDetails.monitoring.split(', ').map((monitor, index) => (
                                            <span 
                                                key={index}
                                                className={`badge ${getTechnicalColor('monitoring', monitor.trim())} text-xs px-2 py-1 rounded mr-1 mb-1 inline-block`}
                                            >
                                                {monitor.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Edge-specific details */}
                    {!isNode && (
                        <div className="spec-item flex justify-between items-start">
                            <span className="spec-label text-sm font-medium text-gray-600 dark:text-gray-400">
                                Failure Handling:
                            </span>
                            <div className="spec-value text-sm text-gray-800 dark:text-gray-200 text-right max-w-48">
                                {technicalDetails.failureHandling !== 'N/A' ? (
                                    technicalDetails.failureHandling.split(', ').map((failure, index) => (
                                        <span 
                                            key={index}
                                            className="badge bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1 inline-block"
                                        >
                                            {failure.trim()}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">N/A</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Description */}
                {selectedElement.data?.description && (
                    <div className="description mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Description:
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedElement.data.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicalDetailsPanel; 