// assets/js/main.js

import { loadGameDataFromSheets } from './data.js';
import { updateCalculations } from './calculations.js';
import { toggleStep, generateSheet, createTemplateMenu, createUndoRedoButtons } from './ui.js';
import { debounce, initializeManagers, stateManager, templateManager, autoSaveManager } from './managers.js';

// Inicializa os gerenciadores (instâncias são criadas dentro de initializeManagers)
initializeManagers();

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
    createUndoRedoButtons(stateManager, keyboardManager); // Passa a instância do keyboardManager

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

    // Event listener para o ícone de gerar ficha
    const generateSheetIcon = document.getElementById('generate-sheet-icon');
    if (generateSheetIcon) {
        generateSheetIcon.addEventListener('click', generateSheet);
    }

    // Expõe funções globalmente se necessário para manipuladores de eventos HTML inline
    // Embora não seja a melhor prática, é mantido para compatibilidade com o HTML existente.
    window.toggleStep = toggleStep;
    window.updateCalculations = updateCalculations;
    window.generateSheet = generateSheet;
    window.templateManager = templateManager; // Expõe para uso em onclick de templates
};
