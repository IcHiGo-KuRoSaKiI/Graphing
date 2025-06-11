import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = ({ diagram, style = {}, className }) => {
    const combinedStyle = { width: '100%', height: '100%', ...style };
    return (
        <div style={combinedStyle} className={className}>
            <ReactFlowProvider>
                <ArchitectureDiagramEditorContent initialDiagram={diagram} />
            </ReactFlowProvider>
        </div>
    );
};

export default ArchitectureDiagramEditor;
