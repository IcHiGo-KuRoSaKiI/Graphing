import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';
import useThemeStore from '../store/themeStore';

/**
 * Main editor component used to render diagrams. Wrapped with `React.memo`
 * to prevent unnecessary re-renders when props remain unchanged.
 */
const ArchitectureDiagramEditorComponent = ({
    diagram,
    style = {},
    className,
    mode = 'light',
    showThemeToggle = false,
    onToggleMini,
    showMiniToggle = false,
}) => {
    const { theme, setTheme, toggleTheme } = useThemeStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setTheme(mode);
    }, [mode, setTheme]);

    const combinedStyle = useMemo(
        () => ({ width: '100%', height: '100%', ...style }),
        [style],
    );

    const fullscreenStyle = useMemo(
        () =>
            isFullscreen
                ? { position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 1000 }
                : {},
        [isFullscreen],
    );

    const containerStyle = useMemo(
        () => ({ ...combinedStyle, ...fullscreenStyle }),
        [combinedStyle, fullscreenStyle],
    );

    const modeClass = useMemo(() => (theme === 'dark' ? 'dark' : ''), [theme]);

    const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
    const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);

    return (
        <div style={containerStyle} className={`graphing ${className || ''}`}>
            <div
                className={`${modeClass} w-full h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative transition-colors`}
            >
                <ReactFlowProvider>
                    <ArchitectureDiagramEditorContent
                        initialDiagram={diagram}
                        onToggleTheme={handleToggleTheme}
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

// Export a memoized version to avoid re-rendering when props are the same
const ArchitectureDiagramEditor = React.memo(ArchitectureDiagramEditorComponent);

export default ArchitectureDiagramEditor;
