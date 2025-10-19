import React from 'react';
import PromptModal from '../modals/PromptModal';
import ConfirmModal from '../modals/ConfirmModal';
import ContainerSelectorModal from '../modals/ContainerSelectorModal';
import ShapeSelectorModal from '../modals/ShapeSelectorModal';
import JsonPasteModal from '../modals/JsonPasteModal';
import JsonValidatorModal from '../modals/JsonValidatorModal';
import ExportModal from '../modals/ExportModal';

import useDiagramStore from '../../store/diagramStore';

/**
 * EditorModals Component
 * Manages all modal dialogs in the diagram editor
 * Extracted from ArchitectureDiagramEditorContent for better separation of concerns
 */
const EditorModals = ({ onExport, serviceFactory }) => {
    // Get modal state from Zustand store
    const modals = useDiagramStore(state => state.modals);
    const closeModal = useDiagramStore(state => state.closeModal);

    return (
        <>
            {/* Prompt Modal */}
            {modals.prompt.isOpen && (
                <PromptModal
                    isOpen={modals.prompt.isOpen}
                    title={modals.prompt.config.title}
                    message={modals.prompt.config.message}
                    defaultValue={modals.prompt.config.defaultValue}
                    onConfirm={modals.prompt.config.onConfirm}
                    onClose={() => closeModal('prompt')}
                />
            )}

            {/* Confirm Modal */}
            {modals.confirm.isOpen && (
                <ConfirmModal
                    isOpen={modals.confirm.isOpen}
                    title={modals.confirm.config.title}
                    message={modals.confirm.config.message}
                    onConfirm={modals.confirm.config.onConfirm}
                    onClose={() => closeModal('confirm')}
                />
            )}

            {/* Container Selector Modal */}
            {modals.containerSelector.isOpen && (
                <ContainerSelectorModal
                    isOpen={modals.containerSelector.isOpen}
                    title={modals.containerSelector.config.title}
                    message={modals.containerSelector.config.message}
                    containers={modals.containerSelector.config.containers}
                    onSelect={modals.containerSelector.config.onSelect}
                    onClose={() => closeModal('containerSelector')}
                />
            )}

            {/* Shape Selector Modal */}
            {modals.shapeSelector.isOpen && (
                <ShapeSelectorModal
                    isOpen={modals.shapeSelector.isOpen}
                    onClose={() => closeModal('shapeSelector')}
                    onShapeSelect={modals.shapeSelector.config.onShapeSelect}
                />
            )}

            {/* JSON Paste Modal */}
            {modals.jsonPaste.isOpen && (
                <JsonPasteModal
                    isOpen={modals.jsonPaste.isOpen}
                    onConfirm={modals.jsonPaste.config.onConfirm}
                    onClose={() => closeModal('jsonPaste')}
                />
            )}

            {/* JSON Validator Modal */}
            {modals.jsonValidator.isOpen && (
                <JsonValidatorModal
                    isOpen={modals.jsonValidator.isOpen}
                    onClose={() => closeModal('jsonValidator')}
                    serviceFactory={serviceFactory}
                />
            )}

            {/* Export Modal */}
            {modals.export.isOpen && (
                <ExportModal
                    isOpen={modals.export.isOpen}
                    onClose={() => closeModal('export')}
                    onExport={onExport}
                />
            )}
        </>
    );
};

export default EditorModals;
