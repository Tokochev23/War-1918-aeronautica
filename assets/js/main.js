// assets/js/main.js

// Ajustado os caminhos de importação para a mesma pasta
import { loadGameDataFromSheets } from './data.js';
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons } from './ui.js';
import { debounce, stateManager, templateManager, autoSaveManager, keyboardManager } from './managers.js';

const debouncedUpdateCalculations = debounce(updateCalculations, 250);

window.onload = function() {
    loadGameDataFromSheets().then(() => {
        toggleStep(1);
        updateCalculations();
        stateManager.saveState(autoSaveManager.getCurrentFormData());
    });

    createTemplateMenu(templateManager);
    createUndoRedoButtons(stateManager, keyboardManager);

    document.querySelectorAll('input, select').forEach(element => {
        if (element.id !== 'aircraft_name' && element.id !== 'quantity') {
            element.addEventListener('input', debouncedUpdateCalculations);
            element.addEventListener('change', debouncedUpdateCalculations);
        } else {
            element.addEventListener('input', updateCalculations);
            element.addEventListener('change', updateCalculations);
        }
    });

    document.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (event) => {
            const step = parseInt(event.currentTarget.dataset.step);
            toggleStep(step);
        });
    });

    const generateSheetIcon = document.getElementById('generate-sheet-icon');
    if (generateSheetIcon) {
        generateSheetIcon.addEventListener('click', generateSheet);
    }
};
