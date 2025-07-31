// assets/js/main.js

import { loadGameDataFromSheets } from './data.js';
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons } from './ui.js';
import { debounce, stateManager, templateManager, autoSaveManager, keyboardManager } from './managers.js';

// As instâncias são importadas diretamente do managers.js, pois agora são exportadas com 'const'
// const stateManager = new StateManager();
// const templateManager = new TemplateManager();
// const autoSaveManager = new AutoSaveManager();
// const keyboardManager = new KeyboardManager();

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
    // Agora passa as instâncias corretas para a função
    createUndoRedoButtons(stateManager, keyboardManager);

    // Anexa event listeners a todos os campos de input e selects relevantes
    document.querySelectorAll('input, select').forEach(element => {
        // Exclui 'aircraft_name' e 'quantity' do debounce para uma atualização mais imediata
        if (element.id !== 'aircraft_name' && element.id !== 'quantity') {
            element.addEventListener('input', debouncedUpdateCalculations);
            element.addEventListener('change', debouncedUpdateCalculations); // Para selects
        } else {
            // Para 'aircraft_name' e 'quantity', atualiza imediatamente (sem debounce)
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
