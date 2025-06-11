import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = ({ diagram, style, className }) => {
    return (
        <div style={style} className={className}>
            <ReactFlowProvider>
                <ArchitectureDiagramEditorContent initialDiagram={diagram} />
            </ReactFlowProvider>
        </div>
    );
};

export default ArchitectureDiagramEditor;
