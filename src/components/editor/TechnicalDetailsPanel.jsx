import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Info, Shield, Zap, Server, Activity, AlertTriangle, Database, Network } from 'lucide-react';
import { extractTechnicalDetails, extractConnectionTechnicalDetails } from '../utils/technicalDetailsParser';

const TechnicalDetailsPanel = ({ selectedElement, onClose, isOpen, position }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [manualPosition, setManualPosition] = useState(null);
    const panelRef = useRef(null);
    const positionTimeoutRef = useRef(null);

    useEffect(() => {
        if (isOpen && selectedElement) {
            setIsVisible(true);
            setManualPosition(null); // Reset manual position on new selection
        } else {
            setIsVisible(false);
        }
    }, [isOpen, selectedElement]);

    // Debounced position update to reduce ResizeObserver calls
    useEffect(() => {
        if (position && !manualPosition) {
            if (positionTimeoutRef.current) {
                clearTimeout(positionTimeoutRef.current);
            }
            positionTimeoutRef.current = setTimeout(() => {
                setManualPosition(position);
            }, 25); // Reduced delay for more responsive movement
        }
        return () => {
            if (positionTimeoutRef.current) {
                clearTimeout(positionTimeoutRef.current);
            }
        };
    }, [position, manualPosition]);

    // Immediate position update for better responsiveness
    useEffect(() => {
        if (position && !isDragging) {
            // Update position immediately if not dragging
            setManualPosition(position);
        }
    }, [position, isDragging]);

    // Dragging functionality
    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('button')) return; // Don't drag if clicking buttons
        setIsDragging(true);
        const rect = panelRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        // Keep panel within viewport bounds
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 400;
        setManualPosition({
            x: Math.max(10, Math.min(newX, maxX)),
            y: Math.max(10, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    if (!isOpen || !selectedElement) return null;

    const isNode = selectedElement.type === 'node';
    const technicalDetails = isNode 
        ? extractTechnicalDetails(selectedElement)
        : extractConnectionTechnicalDetails(selectedElement);

    const elementLabel = selectedElement.data?.label || selectedElement.label || 'Unknown Element';

    // Get icon based on element type and technical details
    const getElementIcon = () => {
        if (isNode) {
            if (technicalDetails.infrastructure.includes('Kubernetes')) return <Server className="w-4 h-4" />;
            if (technicalDetails.protocol.includes('HTTP')) return <Network className="w-4 h-4" />;
            if (technicalDetails.monitoring.includes('Prometheus')) return <Activity className="w-4 h-4" />;
            return <Database className="w-4 h-4" />;
        } else {
            return <Network className="w-4 h-4" />;
        }
    };

    // Use manual position if set, otherwise use the position prop directly
    const panelPos = manualPosition || position || { x: 100, y: 100 };

    return (
        <div 
            ref={panelRef}
            className={`fixed z-40 transition-all duration-150 ease-out ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
                left: panelPos.x,
                top: panelPos.y,
                transform: isVisible ? 'translate(0, 0)' : 'translate(10px, -10px)',
                userSelect: isDragging ? 'none' : 'auto',
                willChange: 'transform, opacity' // Optimize for animations
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Main Panel */}
            <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {getElementIcon()}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {elementLabel}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Technical Details
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={16} className="text-gray-400" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {/* Protocol */}
                    {technicalDetails.protocol !== 'N/A' && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Network className="w-3 h-3 text-blue-500" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                {technicalDetails.protocol}
                            </span>
                        </div>
                    )}
                    
                    {/* Performance */}
                    {(technicalDetails.performance.latency || technicalDetails.performance.throughput || technicalDetails.performance.timeout) && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <div className="flex flex-wrap gap-1">
                                {technicalDetails.performance.latency && (
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full">
                                        {technicalDetails.performance.latency}
                                    </span>
                                )}
                                {technicalDetails.performance.throughput && (
                                    <span className="text-xs bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">
                                        {technicalDetails.performance.throughput} req/s
                                    </span>
                                )}
                                {technicalDetails.performance.timeout && (
                                    <span className="text-xs bg-orange-100 dark:bg-orange-800/30 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full">
                                        {technicalDetails.performance.timeout}s
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Security */}
                    {technicalDetails.security !== 'N/A' && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Shield className="w-3 h-3 text-green-500" />
                            <div className="flex flex-wrap gap-1">
                                {technicalDetails.security.split(', ').map((sec, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full"
                                    >
                                        {sec.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Node-specific sections */}
                    {isNode && (
                        <>
                            {/* Scaling */}
                            {technicalDetails.scaling !== 'N/A' && (
                                <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Activity className="w-3 h-3 text-indigo-500" />
                                    <div className="flex flex-wrap gap-1">
                                        {technicalDetails.scaling.split(', ').map((scale, index) => (
                                            <span 
                                                key={index}
                                                className="text-xs bg-indigo-100 dark:bg-indigo-800/30 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full"
                                            >
                                                {scale.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Infrastructure */}
                            {technicalDetails.infrastructure !== 'N/A' && (
                                <div className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                    <Server className="w-3 h-3 text-cyan-500" />
                                    <div className="flex flex-wrap gap-1">
                                        {technicalDetails.infrastructure.split(', ').map((infra, index) => (
                                            <span 
                                                key={index}
                                                className="text-xs bg-cyan-100 dark:bg-cyan-800/30 text-cyan-800 dark:text-cyan-200 px-2 py-0.5 rounded-full"
                                            >
                                                {infra.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Monitoring */}
                            {technicalDetails.monitoring !== 'N/A' && (
                                <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                    <Activity className="w-3 h-3 text-pink-500" />
                                    <div className="flex flex-wrap gap-1">
                                        {technicalDetails.monitoring.split(', ').map((monitor, index) => (
                                            <span 
                                                key={index}
                                                className="text-xs bg-pink-100 dark:bg-pink-800/30 text-pink-800 dark:text-pink-200 px-2 py-0.5 rounded-full"
                                            >
                                                {monitor.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Edge-specific section */}
                    {!isNode && technicalDetails.failureHandling !== 'N/A' && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <div className="flex flex-wrap gap-1">
                                {technicalDetails.failureHandling.split(', ').map((failure, index) => (
                                    <span 
                                        key={index}
                                        className="text-xs bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full"
                                    >
                                        {failure.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Description */}
                    {selectedElement.data?.description && (
                        <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Info className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                {selectedElement.data.description}
                            </p>
                        </div>
                    )}
                    
                    {/* No data message */}
                    {technicalDetails.protocol === 'N/A' && 
                     technicalDetails.security === 'N/A' && 
                     !technicalDetails.performance.latency && 
                     !technicalDetails.performance.throughput && 
                     !technicalDetails.performance.timeout && 
                     technicalDetails.scaling === 'N/A' && 
                     technicalDetails.infrastructure === 'N/A' && 
                     technicalDetails.monitoring === 'N/A' && 
                     technicalDetails.failureHandling === 'N/A' && 
                     !selectedElement.data?.description && (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                No technical details available
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Arrow pointing to element */}
            <div 
                className="absolute w-3 h-3 bg-white/95 dark:bg-gray-900/95 border-l border-t border-gray-200/50 dark:border-gray-700/50 transform rotate-45"
                style={{
                    left: panelPos.x < window.innerWidth / 2 ? '-6px' : 'auto',
                    right: panelPos.x >= window.innerWidth / 2 ? '-6px' : 'auto',
                    top: '20px'
                }}
            />
        </div>
    );
};

export default TechnicalDetailsPanel; 