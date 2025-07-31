// assets/js/managers.js

// Ajustado os caminhos de importação para a mesma pasta
import { updateCalculations } from './calculations.js';
import { updateUI } from './ui.js';

// --- FUNÇÕES DE UTILIDADE ---
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- GERENCIAMENTO DE ESTADO (UNDO/REDO) ---
export class StateManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
        this.listeners = [];
    }

    saveState(state) {
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.currentIndex++;
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        this.notifyListeners();
    }

    canUndo() { return this.currentIndex > 0; }
    canRedo() { return this.currentIndex < this.history.length - 1; }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.notifyListeners();
            return this.getCurrentState();
        }
        return null;
    }

    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    addListener(callback) { this.listeners.push(callback); }
    notifyListeners() { this.listeners.forEach(callback => callback(this)); }
}

// --- SISTEMA DE AUTO-SALVAMENTO ---
export class AutoSaveManager {
    constructor(saveInterval = 5000) {
        this.saveInterval = saveInterval;
        this.lastSaveData = null;
        this.saveTimer = null;
        this.init();
    }

    init() {
        this.loadAutoSave();
        this.startAutoSave();
    }

    startAutoSave() {
        this.saveTimer = setInterval(() => this.autoSave(), this.saveInterval);
    }

    getCurrentFormData() {
        const data = {};
        document.querySelectorAll('input, select').forEach(element => {
            if (element.id) {
                if (element.type === 'checkbox') data[element.id] = element.checked;
                else data[element.id] = element.value;
            }
        });
        return data;
    }

    autoSave() {
        const currentData = this.getCurrentFormData();
        const dataString = JSON.stringify(currentData);
        if (dataString !== this.lastSaveData) {
            localStorage.setItem('aircraft_autosave', dataString);
            this.lastSaveData = dataString;
        }
    }

    loadAutoSave() {
        const saved = localStorage.getItem('aircraft_autosave');
        if (saved) {
            try {
                this.restoreFormData(JSON.parse(saved));
            } catch (e) {
                console.error("Erro ao parsear dados de auto-salvamento:", e);
                localStorage.removeItem('aircraft_autosave');
            }
        }
    }

    restoreFormData(data) {
        Object.entries(data).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') element.checked = Boolean(value);
                else element.value = value;
            }
        });
        updateCalculations();
    }
}

// --- ATALHOS DE TECLADO ---
export class KeyboardManager {
    constructor(stateManagerInstance, autoSaveManagerInstance) {
        this.stateManager = stateManagerInstance;
        this.autoSaveManager = autoSaveManagerInstance;
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); this.undo(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); this.redo(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'g') { e.preventDefault(); /* generateSheet(); */ }
        });
    }

    undo() {
        const prevState = this.stateManager.undo();
        if (prevState) this.autoSaveManager.restoreFormData(prevState);
    }

    redo() {
        const nextState = this.stateManager.redo();
        if (nextState) this.autoSaveManager.restoreFormData(nextState);
    }
}

export const stateManager = new StateManager();
export const templateManager = new TemplateManager();
export const autoSaveManager = new AutoSaveManager();
export const keyboardManager = new KeyboardManager(stateManager, autoSaveManager);
