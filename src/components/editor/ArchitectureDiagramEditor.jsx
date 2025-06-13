import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = ({ diagram, style = {}, className, mode = 'light', showThemeToggle = false, onToggleMini, showMiniToggle = false }) => {
    const [theme, setTheme] = useState(mode);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setTheme(mode);
    }, [mode]);

    const combinedStyle = { width: '100%', height: '100%', ...style };
    const fullscreenStyle = isFullscreen
        ? { position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 1000 }
        : {};
    const modeClass = theme === 'dark' ? 'dark' : '';

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

    const containerStyle = { ...combinedStyle, ...fullscreenStyle };

    return (
        <div style={containerStyle} className={`graphing ${className || ''}`}>
            <div className={`${modeClass} w-full h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative transition-colors`}> 
                <ReactFlowProvider>
                    <ArchitectureDiagramEditorContent
                        initialDiagram={diagram}
                        onToggleTheme={toggleTheme}
                        onToggleFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        showThemeToggle={showThemeToggle}
                        onToggleMini={onToggleMini}
                        showMiniToggle={showMiniToggle}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
}; 

export default ArchitectureDiagramEditor;
