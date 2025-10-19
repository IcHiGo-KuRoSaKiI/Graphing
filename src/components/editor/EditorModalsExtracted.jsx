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
 * Now uses Zustand closeModal function instead of individual setModal functions
 */
const EditorModalsExtracted = ({
    // Modal state
    promptModal,
    confirmModal,
    containerSelectorModal,
    shapeSelectorModal,
    jsonPasteModal,
    jsonValidatorModal,
    exportModal,

    // Close function
    closeModal,

    // Action handlers
    addShapeNode,
    handleJsonPasteImport,
    validateJson,
    getDiagramDataForExport
}) => {
    return (
        <>
            {/* Prompt Modal */}
            <PromptModal
                isOpen={promptModal.isOpen}
                title={promptModal.config?.title}
                message={promptModal.config?.message}
                defaultValue={promptModal.config?.defaultValue}
                onConfirm={promptModal.config?.onConfirm}
                onCancel={() => closeModal('prompt')}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.config?.title}
                message={confirmModal.config?.message}
                onConfirm={confirmModal.config?.onConfirm}
                onCancel={() => closeModal('confirm')}
            />

            {/* Container Selector Modal */}
            <ContainerSelectorModal
                isOpen={containerSelectorModal.isOpen}
                title={containerSelectorModal.config?.title}
                message={containerSelectorModal.config?.message}
                containers={containerSelectorModal.config?.containers}
                onSelect={containerSelectorModal.config?.onSelect}
                onCancel={() => closeModal('containerSelector')}
            />

            {/* Shape Selector Modal */}
            <ShapeSelectorModal
                isOpen={shapeSelectorModal.isOpen}
                onSelect={(shapeType) => {
                    closeModal('shapeSelector');
                    addShapeNode(shapeType);
                }}
                onCancel={() => closeModal('shapeSelector')}
            />

            {/* JSON Paste Modal */}
            <JsonPasteModal
                isOpen={jsonPasteModal.isOpen}
                onConfirm={handleJsonPasteImport}
                onCancel={() => closeModal('jsonPaste')}
            />

            {/* JSON Validator Modal */}
            <JsonValidatorModal
                isOpen={jsonValidatorModal.isOpen}
                onValidate={validateJson}
                onClose={() => closeModal('jsonValidator')}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={exportModal.isOpen}
                onClose={() => closeModal('export')}
                diagramData={getDiagramDataForExport()}
            />
        </>
    );
};

export default EditorModalsExtracted;
