// src/components/editor/IntersectionStylePreview.jsx
import React from 'react';

const IntersectionStylePreview = ({ style, size = 60, className = "" }) => {
    const renderPreview = () => {
        const centerX = size / 2;
        const centerY = size / 2;
        const lineLength = size * 0.7;
        const jumpSize = 8;

        switch (style) {
            case 'arc':
                return (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
                        {/* Background horizontal line */}
                        <line
                            x1={centerX - lineLength / 2}
                            y1={centerY}
                            x2={centerX + lineLength / 2}
                            y2={centerY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                        />
                        {/* Vertical line with arc jump */}
                        <g>
                            {/* Line before intersection */}
                            <line
                                x1={centerX}
                                y1={centerY - lineLength / 2}
                                x2={centerX}
                                y2={centerY - jumpSize / 2}
                                stroke="#3b82f6"
                                strokeWidth="2"
                            />
                            {/* Arc jump */}
                            <path
                                d={`M ${centerX} ${centerY - jumpSize / 2} Q ${centerX + jumpSize / 2} ${centerY} ${centerX} ${centerY + jumpSize / 2}`}
                                stroke="#3b82f6"
                                strokeWidth="2"
                                fill="none"
                            />
                            {/* Line after intersection */}
                            <line
                                x1={centerX}
                                y1={centerY + jumpSize / 2}
                                x2={centerX}
                                y2={centerY + lineLength / 2}
                                stroke="#3b82f6"
                                strokeWidth="2"
                            />
                        </g>
                    </svg>
                );

            case 'sharp':
                return (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
                        {/* Background horizontal line */}
                        <line
                            x1={centerX - lineLength / 2}
                            y1={centerY}
                            x2={centerX + lineLength / 2}
                            y2={centerY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                        />
                        {/* Vertical line with sharp jump */}
                        <path
                            d={`M ${centerX} ${centerY - lineLength / 2} 
                               L ${centerX} ${centerY - jumpSize / 2}
                               L ${centerX + jumpSize / 2} ${centerY - jumpSize / 2}
                               L ${centerX + jumpSize / 2} ${centerY + jumpSize / 2}
                               L ${centerX} ${centerY + jumpSize / 2}
                               L ${centerX} ${centerY + lineLength / 2}`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            fill="none"
                        />
                    </svg>
                );

            default: // 'none'
                return (
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
                        {/* Simple intersecting lines */}
                        <line
                            x1={centerX - lineLength / 2}
                            y1={centerY}
                            x2={centerX + lineLength / 2}
                            y2={centerY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                        />
                        <line
                            x1={centerX}
                            y1={centerY - lineLength / 2}
                            x2={centerX}
                            y2={centerY + lineLength / 2}
                            stroke="#3b82f6"
                            strokeWidth="2"
                        />
                    </svg>
                );
        }
    };

    return (
        <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded border">
            {renderPreview()}
        </div>
    );
};

export default IntersectionStylePreview;