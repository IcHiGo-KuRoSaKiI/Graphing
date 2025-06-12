import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = ({ diagram, style = {}, className, mode = 'light', showThemeToggle = false }) => {
    const [theme, setTheme] = useState(mode);

    useEffect(() => {
        setTheme(mode);
    }, [mode]);

    const combinedStyle = { width: '100%', height: '100%', ...style };
    const modeClass = theme === 'dark' ? 'dark' : '';

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <div style={combinedStyle} className={`${modeClass} ${className || ''}`}>
            <ReactFlowProvider>
                <ArchitectureDiagramEditorContent
                    initialDiagram={diagram}
                    onToggleTheme={toggleTheme}
                    showThemeToggle={showThemeToggle}
                />
            </ReactFlowProvider>
        </div>
    );
};

export default ArchitectureDiagramEditor;
