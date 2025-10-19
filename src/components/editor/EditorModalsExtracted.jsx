import React from 'react';
import PromptModal from '../modals/PromptModal';
import ConfirmModal from '../modals/ConfirmModal';
import ContainerSelectorModal from '../modals/ContainerSelectorModal';
import ShapeSelectorModal from '../modals/ShapeSelectorModal';
import JsonPasteModal from '../modals/JsonPasteModal';
import JsonValidatorModal from '../modals/JsonValidatorModal';
import ExportModal from '../modals/ExportModal';

/**
 * EditorModalsExtracted Component
 *
 * Extracted from ArchitectureDiagramEditorContent (lines 2175-2222)
 * Manages all modal dialogs in the editor
 *
 * This is a DIRECT extraction - exact same JSX, just moved to a separate file
 */
const EditorModalsExtracted = ({
    // Prompt Modal props
    promptModal,
    setPromptModal,

    // Confirm Modal props
    confirmModal,
    setConfirmModal,

    // Container Selector Modal props
    containerSelectorModal,
    setContainerSelectorModal,

    // Shape Selector Modal props
    shapeSelectorModal,
    setShapeSelectorModal,
    addShapeNode,

    // JSON Paste Modal props
    jsonPasteModal,
    setJsonPasteModal,
    handleJsonPasteImport,

    // JSON Validator Modal props
    jsonValidatorModal,
    setJsonValidatorModal,
    validateJson,

    // Export Modal props
    exportModal,
    closeExportModal,
    getDiagramDataForExport
}) => {
    return (
        <>
            {/* Prompt Modal */}
            <PromptModal
                isOpen={promptModal.isOpen}
                title={promptModal.title}
                message={promptModal.message}
                defaultValue={promptModal.defaultValue}
                onConfirm={promptModal.onConfirm}
                onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Container Selector Modal */}
            <ContainerSelectorModal
                isOpen={containerSelectorModal.isOpen}
                title={containerSelectorModal.title}
                message={containerSelectorModal.message}
                containers={containerSelectorModal.containers}
                onSelect={containerSelectorModal.onSelect}
                onCancel={() => setContainerSelectorModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Shape Selector Modal */}
            <ShapeSelectorModal
                isOpen={shapeSelectorModal.isOpen}
                onSelect={(shapeType) => {
                    setShapeSelectorModal({ isOpen: false });
                    addShapeNode(shapeType);
                }}
                onCancel={() => setShapeSelectorModal({ isOpen: false })}
            />

            {/* JSON Paste Modal */}
            <JsonPasteModal
                isOpen={jsonPasteModal.isOpen}
                onConfirm={handleJsonPasteImport}
                onCancel={() => setJsonPasteModal({ isOpen: false, onConfirm: null })}
            />

            {/* JSON Validator Modal */}
            <JsonValidatorModal
                isOpen={jsonValidatorModal.isOpen}
                onValidate={validateJson}
                onClose={() => setJsonValidatorModal({ isOpen: false })}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={closeExportModal}
                diagramData={getDiagramDataForExport()}
            />
        </>
    );
};

export default EditorModalsExtracted;
