import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = ({ diagram, style = {}, className, mode = 'light' }) => {
    const combinedStyle = { width: '100%', height: '100%', ...style };
    const modeClass = mode === 'dark' ? 'dark' : '';
    return (
        <div style={combinedStyle} className={`${modeClass} ${className || ''}`}>
            <ReactFlowProvider>
                <ArchitectureDiagramEditorContent initialDiagram={diagram} />
            </ReactFlowProvider>
        </div>
    );
};

export default ArchitectureDiagramEditor;
