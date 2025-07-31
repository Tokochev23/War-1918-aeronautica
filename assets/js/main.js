// assets/js/main.js

// Ajustado os caminhos de importação para serem relativos à pasta atual
import { loadGameDataFromSheets } from './data.js';
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons } from './ui.js';
import { debounce, stateManager, templateManager, autoSaveManager, keyboardManager } from './managers.js';

const debouncedUpdateCalculations = debounce(updateCalculations, 250);

window.onload = function() {
    // Carrega os dados das planilhas e então inicializa a UI
    loadGameDataFromSheets().then(() => {
        // Abre o primeiro passo do formulário por padrão
        toggleStep(1);
        // Realiza os cálculos iniciais após os dados serem carregados e restaurados do autosave
        updateCalculations();
        // Salva o estado inicial para que o undo/redo funcione desde o começo
        stateManager.saveState(autoSaveManager.getCurrentFormData());
    });

    // Cria os botões de templates e undo/redo
    createTemplateMenu(templateManager);
    createUndoRedoButtons(stateManager, keyboardManager);

    // Anexa event listeners a todos os campos de input e selects relevantes
    document.querySelectorAll('input, select').forEach(element => {
        if (element.id !== 'aircraft_name' && element.id !== 'quantity') {
            element.addEventListener('input', debouncedUpdateCalculations);
            element.addEventListener('change', debouncedUpdateCalculations);
        } else {
            element.addEventListener('input', updateCalculations);
            element.addEventListener('change', updateCalculations);
        }
    });

    // Anexa event listeners aos cabeçalhos dos passos
    document.querySelectorAll('.step-header').forEach(header => {
        header.addEventListener('click', (event) => {
            const step = parseInt(event.currentTarget.dataset.step);
            toggleStep(step);
        });
    });

    // Event listener para o ícone de gerar ficha
    const generateSheetIcon = document.getElementById('generate-sheet-icon');
    if (generateSheetIcon) {
        generateSheetIcon.addEventListener('click', generateSheet);
    }
};
