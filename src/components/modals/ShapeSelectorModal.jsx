import React from 'react';

const ShapeSelectorModal = ({ isOpen, onSelect, onCancel }) => {
    if (!isOpen) return null;

    const shapes = [
        { id: 'component', label: 'Rectangle', icon: '🔹', color: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 'circle', label: 'Circle', icon: '⭕', color: 'bg-green-100 dark:bg-green-900/30' },
        { id: 'diamond', label: 'Diamond', icon: '♦️', color: 'bg-red-100 dark:bg-red-900/30' },
        { id: 'hexagon', label: 'Hexagon', icon: '⬢', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
        { id: 'triangle', label: 'Triangle', icon: '🔺', color: 'bg-orange-100 dark:bg-orange-900/30' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slideIn">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Select Shape</h3>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {shapes.map((shape) => (
                            <div
                                key={shape.id}
                                className={`${shape.color} p-5 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg`}
                                onClick={() => onSelect(shape.id)}
                            >
                                <div className="text-4xl">{shape.icon}</div>
                                <div className="font-medium text-gray-700 dark:text-gray-300">{shape.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-all"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShapeSelectorModal;