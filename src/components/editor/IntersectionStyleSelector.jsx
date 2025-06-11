// src/components/editor/IntersectionStyleSelector.jsx
import React from 'react';

// Inline IntersectionStylePreview component
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

// Main IntersectionStyleSelector component
const IntersectionStyleSelector = ({
    value = 'none',
    onChange,
    disabled = false,
    className = ""
}) => {
    const intersectionOptions = [
        {
            value: 'none',
            label: 'None',
            description: 'Edges will pass through intersections normally'
        },
        {
            value: 'arc',
            label: 'Arc Jump',
            description: 'Edges will jump over intersections with a smooth arc'
        },
        {
            value: 'sharp',
            label: 'Sharp Jump',
            description: 'Edges will jump over intersections with sharp angles'
        }
    ];

    const handleOptionClick = (optionValue) => {
        if (disabled) return;

        // Create a synthetic event object to match the expected format
        const syntheticEvent = {
            target: { value: optionValue }
        };

        if (onChange) {
            onChange(syntheticEvent);
        }
    };

    const currentOption = intersectionOptions.find(option => option.value === value);

    return (
        <div className={`mb-4 ${className}`}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Intersection Style:
            </label>

            {/* Visual intersection style selector */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                {intersectionOptions.map((option) => (
                    <div
                        key={option.value}
                        className={`cursor-pointer border-2 rounded-lg p-2 transition-all transform hover:scale-105 ${disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            } ${value === option.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => handleOptionClick(option.value)}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOptionClick(option.value);
                            }
                        }}
                        aria-label={`Select ${option.label} intersection style`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <IntersectionStylePreview style={option.value} size={40} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">
                                {option.label}
                            </span>
                            {value === option.value && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Description for current selection */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-indigo-500">
                <span className="font-medium">Current: </span>
                {currentOption?.description || 'No intersection style selected'}
            </div>

            {/* Additional info */}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                💡 Tip: Use intersection styles when edges cross each other in your diagram
            </div>
        </div>
    );
};

export default IntersectionStyleSelector;