import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import ArchitectureDiagramEditorContent from './ArchitectureDiagramEditorContent';
import 'reactflow/dist/style.css';

const ArchitectureDiagramEditor = () => {
    return (
        <ReactFlowProvider>
            <ArchitectureDiagramEditorContent />
        </ReactFlowProvider>
    );
};

export default ArchitectureDiagramEditor;