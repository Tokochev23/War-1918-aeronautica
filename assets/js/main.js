// assets/js/main.js - Enhanced Version with All Improvements

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27AAlKLizQBXBO/pub?gid=0&single=true&output=csv';
const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27AAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
const AERONAVES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27AAlKLizQBXBO/pub?gid=565684512&single=true&output=csv';

// --- UTILITY FUNCTIONS ---
function debounce(func, wait) {
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

// --- STATE MANAGEMENT ---
class StateManager {
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

// --- TEMPLATES SYSTEM ---
class TemplateManager {
    constructor() {
        this.templates = {
            'fighter_light': {
                name: 'Caça Leve Padrão',
                description: 'Configuração balanceada para agilidade.',
                config: { aircraft_type: 'light_fighter', engine_type: 'v12', engine_power: 1000, num_engines: 1, structure_type: 'all_metal', wing_type: 'monoplane_cantilever', landing_gear_type: 'retractable_gear', propeller_type: 'metal_3', cooling_system: 'liquid', fuel_feed: 'carburetor', supercharger: 'single_stage', mg_50: 2, cannon_20: 2, enclosed_cockpit: true, radio_hf: true, pilot_armor: true }
            },
            'fighter_heavy': {
                name: 'Caça Pesado/Interceptor',
                description: 'Configuração para interceptação de bombardeiros.',
                config: { aircraft_type: 'heavy_fighter', engine_type: 'radial_18', engine_power: 1500, num_engines: 2, structure_type: 'duralumin', wing_type: 'monoplane_cantilever', landing_gear_type: 'retractable_gear', propeller_type: 'adjustable', cooling_system: 'air', fuel_feed: 'injection', supercharger: 'two_stage', mg_50: 4, cannon_20: 2, pilot_armor: true, engine_armor: true, enclosed_cockpit: true, oxygen_system: true, radio_hf: true }
            },
            'bomber_tactical': {
                name: 'Bombardeiro Tático',
                description: 'Configuração para bombardeio médio.',
                config: { aircraft_type: 'tactical_bomber', engine_type: 'radial_16', engine_power: 1400, num_engines: 2, structure_type: 'all_metal', wing_type: 'monoplane_cantilever', landing_gear_type: 'retractable_gear', propeller_type: 'adjustable', cooling_system: 'air', fuel_feed: 'carburetor', supercharger: 'single_stage', bomb_250: 4, bomb_100: 8, defensive_turret_type: 'powered_turret', defensive_mg_50: 2, pilot_armor: true, self_sealing_tanks: true, enclosed_cockpit: true, oxygen_system: true, radio_hf: true, basic_bomb_sight: true }
            },
            'cas_ground': {
                name: 'Apoio Aéreo Próximo',
                description: 'Configuração para CAS resistente.',
                config: { aircraft_type: 'cas', engine_type: 'radial_18', engine_power: 1800, num_engines: 1, structure_type: 'all_metal', wing_type: 'monoplane_cantilever', landing_gear_type: 'fixed_gear', propeller_type: 'metal_3', cooling_system: 'air', fuel_feed: 'carburetor', supercharger: 'none', cannon_37: 1, bomb_100: 6, rockets: 8, pilot_armor: true, engine_armor: true, self_sealing_tanks: true, enclosed_cockpit: true, radio_hf: true, dive_brakes: true }
            }
        };
    }

    getTemplate(id) { return this.templates[id]; }
    getAllTemplates() { return Object.keys(this.templates).map(id => ({ id, ...this.templates[id] })); }

    applyTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return false;
        
        // Reset all inputs before applying template
        document.querySelectorAll('input[type="number"], select').forEach(el => {
            if(!['quantity', 'country_doctrine', 'air_doctrine', 'production_quality_slider'].includes(el.id)) {
                el.value = el.tagName === 'SELECT' ? el.options[0].value : 0;
            }
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);

        Object.entries(template.config).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') element.checked = Boolean(value);
                else element.value = value;
            }
        });
        updateCalculations();
        return true;
    }
}

// --- AUTO-SAVE SYSTEM ---
class AutoSaveManager {
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
            this.restoreFormData(JSON.parse(saved));
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

// --- KEYBOARD SHORTCUTS ---
class KeyboardManager {
    constructor() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); this.undo(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); this.redo(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'g') { e.preventDefault(); generateSheet(); }
        });
    }
    undo() {
        const prevState = stateManager.undo();
        if (prevState) autoSaveManager.restoreFormData(prevState);
    }
    redo() {
        const nextState = stateManager.redo();
        if (nextState) autoSaveManager.restoreFormData(nextState);
    }
}

// --- GLOBAL INSTANCES ---
let stateManager;
let templateManager;
let autoSaveManager;
let keyboardManager;

// --- GAME DATA (keeping original structure) ---
const gameData = {
    countries: {},
    doctrines: {
        air_superiority: { name: "Superioridade Aérea", description: "Foco em caças de alta performance para dominar os céus. Prioriza velocidade, manobrabilidade e poder de fogo ar-ar.", cost_modifier: 1.15, performance_bonus: { speed: 1.05, maneuverability: 1.10, rate_of_climb: 1.05 }, reliability_modifier: 0.95 },
        strategic_bombing: { name: "Bombardeio Estratégico", description: "Doutrina centrada em bombardeiros pesados de longo alcance para destruir a indústria e a moral inimiga.", cost_modifier: 1.20, performance_bonus: { range: 1.20, service_ceiling: 1.10 }, maneuverability_penalty: 0.85 },
        ground_support: { name: "Apoio Tático", description: "Uso de aeronaves para atacar alvos no campo de batalha. Prioriza robustez, capacidade de carga e operação em baixa altitude.", cost_modifier: 1.0, reliability_modifier: 1.10, armor_effectiveness_modifier: 1.10, speed_penalty: 0.90 },
        fleet_defense: { name: "Defesa de Frota", description: "Caças e bombardeiros baseados em porta-aviões. Requerem construção robusta, bom alcance e asas dobráveis.", cost_modifier: 1.25, reliability_modifier: 1.05, performance_bonus: { range: 1.10 }, weight_penalty: 1.05 }
    },
    components: {
        aircraft_types: {
            light_fighter: { name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 18, cl_max: 1.6, cd_0: 0.022, aspect_ratio: 6.0, oswald_efficiency: 0.8, reliability_base: 0.95, maneuverability_base: 1.15, limits: { min_speed: 450, max_speed: 750, min_range: 600, max_range: 2000 }, description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado." },
            heavy_fighter: { name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, cl_max: 1.5, cd_0: 0.028, aspect_ratio: 6.5, oswald_efficiency: 0.78, reliability_base: 0.90, maneuverability_base: 0.9, limits: { min_speed: 480, max_speed: 720, min_range: 1000, max_range: 2500 }, description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves." },
            cas: { name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, cl_max: 1.7, cd_0: 0.035, aspect_ratio: 5.8, oswald_efficiency: 0.75, reliability_base: 0.98, maneuverability_base: 0.95, limits: { min_speed: 350, max_speed: 550, min_range: 500, max_range: 1500 }, description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado." },
            tactical_bomber: { name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, cl_max: 1.4, cd_0: 0.030, aspect_ratio: 7.0, oswald_efficiency: 0.82, reliability_base: 0.92, maneuverability_base: 0.7, limits: { min_speed: 400, max_speed: 600, min_range: 1200, max_range: 3000 }, description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada." },
            strategic_bomber: { name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, cl_max: 1.5, cd_0: 0.028, aspect_ratio: 8.5, oswald_efficiency: 0.85, reliability_base: 0.88, maneuverability_base: 0.5, limits: { min_speed: 380, max_speed: 580, min_range: 3000, max_range: 6000 }, description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo." },
            zeppelin: { name: "Zeppelin", cost: 500000, weight: 50000, metal_cost: 15000, crew: 20, wing_area_m2: 500, cl_max: 0.8, cd_0: 0.020, aspect_ratio: 1.0, oswald_efficiency: 0.7, reliability_base: 0.90, maneuverability_base: 0.1, limits: { min_speed: 80, max_speed: 150, min_range: 5000, max_range: 15000 }, description: "Dirigível gigante para bombardeio ou reconhecimento. Lento e vulnerável, mas com alcance e carga imensos." },
            naval_fighter: { name: "Caça Naval", cost: 60000, weight: 2200, metal_cost: 2800, crew: 1, wing_area_m2: 22, cl_max: 1.65, cd_0: 0.026, aspect_ratio: 5.5, oswald_efficiency: 0.78, reliability_base: 0.93, maneuverability_base: 1.0, limits: { min_speed: 420, max_speed: 680, min_range: 800, max_range: 2200 }, description: "Caça adaptado para operações em porta-aviões, com estrutura reforçada e geralmente asas dobráveis." },
            naval_cas: { name: "CAS Naval", cost: 90000, weight: 4000, metal_cost: 4500, crew: 2, wing_area_m2: 35, cl_max: 1.75, cd_0: 0.038, aspect_ratio: 5.2, oswald_efficiency: 0.72, reliability_base: 0.96, maneuverability_base: 0.85, limits: { min_speed: 320, max_speed: 520, min_range: 700, max_range: 1800 }, description: "Aeronave de ataque naval, incluindo bombardeiros de mergulho e torpedeiros." },
            naval_bomber: { name: "Bombardeiro Naval", cost: 150000, weight: 6000, metal_cost: 7000, crew: 4, wing_area_m2: 60, cl_max: 1.5, cd_0: 0.032, aspect_ratio: 7.5, oswald_efficiency: 0.8, reliability_base: 0.90, maneuverability_base: 0.6, limits: { min_speed: 380, max_speed: 550, min_range: 2000, max_range: 4000 }, description: "Bombardeiro médio/pesado adaptado para operações navais, geralmente baseado em terra." },
            naval_recon: { name: "Reconhecimento Naval", cost: 45000, weight: 2000, metal_cost: 2000, crew: 2, wing_area_m2: 25, cl_max: 1.4, cd_0: 0.024, aspect_ratio: 8.0, oswald_efficiency: 0.85, reliability_base: 0.97, maneuverability_base: 0.8, limits: { min_speed: 250, max_speed: 450, min_range: 1500, max_range: 5000 }, description: "Aeronave de longo alcance para patrulha marítima e reconhecimento." },
            transport: { name: "Transporte", cost: 100000, weight: 8000, metal_cost: 5000, crew: 4, wing_area_m2: 80, cl_max: 1.8, cd_0: 0.040, aspect_ratio: 7.0, oswald_efficiency: 0.75, reliability_base: 0.95, maneuverability_base: 0.4, limits: { min_speed: 200, max_speed: 400, min_range: 1000, max_range: 3500 }, description: "Projetado para transportar tropas ou carga. Lento e vulnerável, com pouca ou nenhuma capacidade de combate." },
            seaplane: { name: "Hidroavião", cost: 55000, weight: 2500, metal_cost: 2500, crew: 3, wing_area_m2: 30, cl_max: 1.5, cd_0: 0.045, aspect_ratio: 6.0, oswald_efficiency: 0.7, reliability_base: 0.94, maneuverability_base: 0.75, limits: { min_speed: 220, max_speed: 420, min_range: 800, max_range: 2500 }, description: "Capaz de pousar e decolar da água. Usado para reconhecimento, patrulha e resgate." },
        },
        structure_materials: {
            wood_fabric: { name: "Madeira e Tecido", cost_mod: 0.7, weight_mod: 0.8, reliability_mod: 0.9, armor_mod: 0.7, description: "Leve e barato, mas frágil e vulnerável a fogo. Comum em designs mais antigos ou leves." },
            wood_metal: { name: "Madeira e Metal", cost_mod: 1.0, weight_mod: 1.0, reliability_mod: 1.0, armor_mod: 1.0, description: "Estrutura de metal com superfícies de madeira/tecido. Bom equilíbrio entre custo e durabilidade." },
            all_metal: { name: "Metal Completo", cost_mod: 1.4, weight_mod: 1.2, reliability_mod: 1.05, armor_mod: 1.2, description: "Estrutura totalmente metálica (sem estresse de pele). Robusto, mas mais pesado que designs posteriores." },
            duralumin: { name: "Duralumínio (Monocoque)", cost_mod: 1.6, weight_mod: 1.05, reliability_mod: 1.1, armor_mod: 1.3, description: "Construção de ponta com pele de alumínio tensionada. Leve, forte e aerodinâmico, mas caro e complexo de produzir." },
        },
        wing_types: {
            biplane: { name: "Biplano", cost_mod: 1.0, weight_mod: 1.1, drag_mod: 1.2, cl_max_mod: 1.1, cd_0_mod: 1.05, aspect_ratio_mod: 0.8, maneuverability_mod: 1.1, reliability_mod: 1.05, description: "Boa sustentação em baixas velocidades, estrutura forte, mas alto arrasto. Comum em designs mais antigos." },
            monoplane_cantilever: { name: "Monoplano Cantilever", cost_mod: 1.2, weight_mod: 1.0, drag_mod: 0.9, cl_max_mod: 1.0, cd_0_mod: 0.9, aspect_ratio_mod: 1.0, reliability_mod: 1.0, description: "Design limpo, menor arrasto, mas estrutura inicialmente mais pesada. Padrão para aeronaves modernas." },
            delta_wing: { name: "Asa Delta (Experimental)", cost_mod: 1.8, weight_mod: 1.05, drag_mod: 0.8, cl_max_mod: 0.9, cd_0_mod: 0.85, aspect_ratio_mod: 0.5, speed_mod: 1.1, maneuverability_mod: 0.8, reliability_mod: 0.85, description: "Alto desempenho em velocidade, bom para curvas de alta G em alta velocidade, mas péssimo manuseio em baixa velocidade. Tecnologia muito experimental para o período." }
        },
        wing_features: {
            flaps: { name: "Flaps", cost: 5000, weight: 20, metal_cost: 50, cl_max_mod: 1.1, drag_mod: 1.05, reliability_mod: 0.98, description: "Melhora a performance de decolagem e pouso, e a sustentação em baixas velocidades." },
            slats: { name: "Slats", cost: 7000, weight: 15, metal_cost: 70, cl_max_mod: 1.05, stall_speed_mod: 0.9, reliability_mod: 0.98, description: "Aumenta a sustentação em altos ângulos de ataque, prevenindo estol e melhorando a manobrabilidade em baixa velocidade." },
            folding_wings: { name: "Asas Dobráveis (Naval)", cost: 10000, weight: 50, metal_cost: 150, reliability_mod: 0.95, description: "Permite o armazenamento compacto em porta-aviões. Essencial para aeronaves navais." },
            swept_wings: { name: "Asas Enflechadas (Experimental)", cost: 20000, weight: 30, metal_cost: 200, speed_mod: 1.05, maneuverability_mod: 0.95, reliability_mod: 0.8, description: "Reduz o arrasto em altas velocidades, mas prejudica a manobrabilidade em baixa velocidade e a estabilidade. Tecnologia experimental e complexa." }
        },
        landing_gear_types: {
            fixed_gear: { name: "Fixo", cost: 0, weight: 0, drag_mod: 1.1, reliability_mod: 1.0, description: "Simples, leve e robusto, mas gera arrasto constante." },
            retractable_gear: { name: "Retrátil", cost: 22500, weight: 150, metal_cost: 300, drag_mod: 1.0, reliability_mod: 0.97, description: "Trem de pouso que se retrai para dentro da fuselagem, reduzindo o arrasto em voo. Mais complexo e pesado." },
            skis: { name: "Esquis", cost: 5000, weight: 80, metal_cost: 100, drag_mod: 1.12, description: "Permite operações em superfícies nevadas ou geladas. Aumenta o arrasto." },
            floats: { name: "Flutuadores", cost: 15000, weight: 300, metal_cost: 200, drag_mod: 1.20, description: "Permite pousos e decolagens na água. Aumenta significativamente o peso e o arrasto." }
        },
        engines: {
            radial_7: { name: "Motor Radial 7 cilindros", cost: 15000, weight: 350, metal_cost: 1200, min_power: 200, max_power: 500, reliability: 0.95, frontal_area_mod: 1.1, bsfc_g_per_kwh: 320, description: "Simples e confiável, mas com grande arrasto. Bom para aeronaves de treinamento ou leves." },
            radial_11: { name: "Motor Radial 11 cilindros", cost: 25000, weight: 500, metal_cost: 2000, min_power: 400, max_power: 1000, reliability: 0.93, frontal_area_mod: 1.2, bsfc_g_per_kwh: 310, description: "Potência decente com boa confiabilidade. Um motor comum para caças e bombardeiros leves." },
            radial_16: { name: "Motor Radial 16 cilindros", cost: 45000, weight: 800, metal_cost: 3500, min_power: 800, max_power: 1600, reliability: 0.90, frontal_area_mod: 1.3, bsfc_g_per_kwh: 300, description: "Motor de dupla estrela potente, para caças pesados e bombardeiros médios." },
            radial_18: { name: "Motor Radial 18 cilindros", cost: 60000, weight: 1100, metal_cost: 4500, min_power: 1200, max_power: 2200, reliability: 0.85, frontal_area_mod: 1.4, bsfc_g_per_kwh: 290, description: "Extremamente potente, mas pesado e complexo. Usado nos maiores bombardeiros e caças de final de período." },
            rotary_9: { name: "Motor Rotativo 9 cilindros", cost: 10000, weight: 150, metal_cost: 800, min_power: 80, max_power: 200, reliability: 0.75, frontal_area_mod: 1.0, bsfc_g_per_kwh: 350, description: "Design da Grande Guerra. Leve, mas o efeito giroscópico torna a pilotagem difícil. Obsoleto e pouco confiável." },
            v8: { name: "Motor V8", cost: 20000, weight: 400, metal_cost: 1800, min_power: 300, max_power: 700, reliability: 0.90, frontal_area_mod: 0.85, bsfc_g_per_kwh: 300, description: "Motor em V refrigerado a líquido. Menor arrasto que um radial, mas sistema de refrigeração mais vulnerável." },
            v12: { name: "Motor V12", cost: 35000, weight: 600, metal_cost: 2500, min_power: 600, max_power: 1500, reliability: 0.88, frontal_area_mod: 0.8, bsfc_g_per_kwh: 290, description: "O motor de caça de alta performance por excelência. Perfil fino, alta potência, mas complexo." },
            v16: { name: "Motor V16", cost: 55000, weight: 850, metal_cost: 4000, min_power: 1000, max_power: 2000, reliability: 0.82, frontal_area_mod: 0.9, bsfc_g_per_kwh: 285, description: "Experimental e potente. Pesado e propenso a problemas de confiabilidade." },
            v24: { name: "Motor V24", cost: 80000, weight: 1200, metal_cost: 6000, min_power: 1800, max_power: 3000, reliability: 0.70, frontal_area_mod: 1.0, bsfc_g_per_kwh: 280, description: "Monstro de potência, essencialmente dois V12 juntos. Extremamente pesado, caro e não confiável." },
        },
        engine_enhancements: {
            ducted_radiators: { name: "Radiadores Dutados", cost: 10000, weight: 30, metal_cost: 80, drag_mod: 0.95, reliability_mod: 0.98, description: "Radiadores integrados na fuselagem ou asas, reduzindo significativamente o arrasto em comparação com radiadores externos. Aumenta a complexidade." },
            intercoolers: { name: "Intercoolers", cost: 8000, weight: 25, metal_cost: 70, power_mod: 1.05, reliability_mod: 0.95, description: "Resfria o ar comprimido pelo superalimentador, aumentando a densidade do ar e a potência do motor, mas adiciona complexidade e pontos de falha." }
        },
        propellers: {
            wood_2: { name: "Madeira 2 pás", cost: 1000, weight: 30, metal_cost: 20, efficiency: 0.75, reliability_mod: 1.05, description: "Simples e leve. Ineficiente em altas velocidades e altitudes." },
            wood_3: { name: "Madeira 3 pás", cost: 1800, weight: 45, metal_cost: 30, efficiency: 0.80, reliability_mod: 1.0, description: "Melhor tração para decolagem e subida que a de 2 pás." },
            metal_2: { name: "Metal 2 pás", cost: 2500, weight: 60, metal_cost: 200, efficiency: 0.82, reliability_mod: 1.0, description: "Mais durável que a de madeira, permite perfis de pá mais finos e eficientes." },
            metal_3: { name: "Metal 3 pás", cost: 4000, weight: 90, metal_cost: 300, efficiency: 0.88, reliability_mod: 0.98, description: "Bom desempenho geral, padrão para muitos caças de meio de período." },
            adjustable: { name: "Passo Variável/Vel. Constante", cost: 15000, weight: 120, metal_cost: 500, efficiency: 0.95, reliability_mod: 0.90, description: "Permite ao piloto otimizar a performance em diferentes regimes de voo. Complexo e caro, com menor confiabilidade inicial." }
        },
        cooling_systems: {
            air: { name: "Refrigeração a Ar", cost: 0, weight: 0, reliability_mod: 1.05, drag_mod: 1.0, description: "Simples e robusto, inerente a motores radiais. Menos eficiente e gera mais arrasto." },
            liquid: { name: "Refrigeração Líquida", cost: 5000, weight: 100, reliability_mod: 0.95, drag_mod: 0.85, description: "Permite motores mais finos e aerodinâmicos (em linha). O sistema é pesado e vulnerável a danos de combate." }
        },
        fuel_feeds: {
            carburetor: { name: "Carburador", cost: 0, weight: 0, reliability_mod: 1.0, performance_mod: 1.0, description: "Simples e barato. Propenso a congelamento e falha em manobras G negativas." },
            injection: { name: "Injeção de Combustível", cost: 12000, weight: 20, reliability_mod: 1.05, performance_mod: 1.1, description: "Fornece combustível de forma precisa e confiável em qualquer atitude de voo. Aumenta a performance, mas é uma tecnologia cara e avançada." }
        },
        superchargers: {
            none: { name: "Nenhum", cost: 0, weight: 0, rated_altitude_m: 0, reliability_mod: 1.0, description: "Motor naturalmente aspirado. Perde potência rapidamente com a altitude." },
            single_stage: { name: "Mecânico - 1 Estágio", cost: 8000, weight: 50, rated_altitude_m: 4000, reliability_mod: 0.95, description: "Melhora a performance em altitudes médias. Padrão para a maioria dos caças." },
            two_stage: { name: "Mecânico - 2 Estágios", cost: 20000, weight: 90, rated_altitude_m: 7500, reliability_mod: 0.90, description: "Excelente performance em altas altitudes. Complexo e rouba mais potência do motor." },
            turbo: { name: "Turboalimentador", cost: 30000, weight: 150, rated_altitude_m: 9000, reliability_mod: 0.75, description: "Usa os gases de escape para performance superior em altitudes muito elevadas. Pesado, caro e gera muito calor, com baixa confiabilidade inicial." }
        },
        armaments: {
            mg_30: { name: "Metralhadora .30", cost: 4500, weight: 12, metal_cost: 100 },
            mg_50: { name: "Metralhadora .50", cost: 11250, weight: 20, metal_cost: 250 },
            cannon_20: { name: "Canhão 20mm", cost: 15000, weight: 100, metal_cost: 400 },
            cannon_30: { name: "Canhão 30mm", cost: 37500, weight: 400, metal_cost: 800 },
            cannon_37: { name: "Canhão 37mm", cost: 60000, weight: 550, metal_cost: 1200 },
            cannon_at_40: { name: "Canhão Anti-Tanque 40mm", cost: 75000, weight: 650, metal_cost: 1500 },
            bomb_50: { name: "Bombas 50kg", cost: 1500, weight: 50, metal_cost: 50 },
            bomb_100: { name: "Bombas 100kg", cost: 3000, weight: 100, metal_cost: 100 },
            bomb_250: { name: "Bombas 250kg", cost: 7500, weight: 250, metal_cost: 250 },
            bomb_500: { name: "Bombas 500kg", cost: 15000, weight: 500, metal_cost: 500 },
            bomb_1000: { name: "Bombas 1000kg", cost: 30000, weight: 1000, metal_cost: 1000 },
            torpedo: { name: "Torpedo Naval", cost: 75000, weight: 800, metal_cost: 2000 },
            incendiary: { name: "Bombas Incendiárias", cost: 5000, weight: 75, metal_cost: 150 },
            rockets: { name: "Foguetes Ar-Terra", cost: 9000, weight: 25, metal_cost: 200 },
        },
        defensive_armaments: {
            none_turret: { name: "Nenhum", cost: 0, weight: 0, metal_cost: 0, reliability_mod: 1.0, defensive_firepower_mod: 0, description: "Nenhuma torre defensiva." },
            manned_turret: { name: "Torreta Tripulada (Manual)", cost: 20000, weight: 150, metal_cost: 300, reliability_mod: 0.95, defensive_firepower_mod: 0.8, description: "Torreta operada manualmente por um artilheiro. Campo de fogo limitado e vulnerável." },
            powered_turret: { name: "Torreta Motorizada (Hidráulica/Elétrica)", cost: 50000, weight: 300, metal_cost: 600, reliability_mod: 0.85, defensive_firepower_mod: 1.2, description: "Torreta com assistência hidráulica ou elétrica para movimentação, permitindo maior campo de fogo e resposta mais rápida. Mais complexa." },
            remote_turret: { name: "Torreta Remota", cost: 100000, weight: 250, metal_cost: 800, reliability_mod: 0.70, defensive_firepower_mod: 1.5, description: "Torreta controlada remotamente de dentro da aeronave, protegendo o artilheiro e oferecendo excelente campo de fogo. Extremamente avançada e não confiável no período." },
            defensive_mg_30: { name: "Metralhadora .30 (Defensiva)", cost: 4500, weight: 12, metal_cost: 100, firepower: 1 },
            defensive_mg_50: { name: "Metralhadora .50 (Defensiva)", cost: 11250, weight: 20, metal_cost: 250, firepower: 2 },
            defensive_cannon_20: { name: "Canhão 20mm (Defensivo)", cost: 15000, weight: 100, metal_cost: 400, firepower: 5 },
        },
        protection: {
            pilot_armor: { name: "Blindagem do Piloto", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, description: "Proteção para o piloto contra fogo inimigo." },
            engine_armor: { name: "Blindagem do Motor", cost: 15000, weight: 250, metal_cost: 400, reliability_mod: 1.0, description: "Proteção para o motor, aumentando a chance de sobreviver a acertos." },
            tank_armor: { name: "Blindagem dos Tanques", cost: 18000, weight: 180, metal_cost: 300, reliability_mod: 1.0, description: "Proteção para os tanques de combustível, reduzindo o risco de incêndio ou vazamento." },
            self_sealing_tanks: { name: "Tanques Auto-Selantes", cost: 22500, weight: 45, metal_cost: 100, reliability_mod: 1.15, description: "Tanques que se selam automaticamente após serem perfurados, prevenindo vazamentos e incêndios. Aumenta a confiabilidade." },
        },
        cockpit_comfort: {
            enclosed_cockpit: { name: "Cabine Fechada", cost: 3000, weight: 10, metal_cost: 30, drag_mod: 0.98, reliability_mod: 1.01, description: "Melhora o conforto da tripulação, reduz o arrasto aerodinâmico e aumenta ligeiramente a confiabilidade devido à proteção dos instrumentos." },
            heated_cockpit: { name: "Cabine Aquecida", cost: 2000, weight: 5, metal_cost: 20, reliability_mod: 1.02, description: "Aumenta o conforto da tripulação em voos de alta altitude ou em climas frios, melhorando a performance e a confiabilidade da tripulação." },
            oxygen_system: { name: "Sistema de Oxigênio", cost: 4000, weight: 15, metal_cost: 40, ceiling_mod: 1.2, reliability_mod: 1.01, description: "Permite operações seguras em altitudes elevadas por períodos prolongados, essencial para o bem-estar da tripulação e confiabilidade em altitude." },
            pressurized_cabin: { name: "Cabine Pressurizada", cost: 25000, weight: 60, metal_cost: 120, ceiling_mod: 1.4, reliability_mod: 0.90, description: "Permite voos confortáveis em altitudes muito elevadas, mas é um sistema complexo e com menor confiabilidade." },
            basic_autopilot: { name: "Piloto Automático Básico", cost: 15000, weight: 40, metal_cost: 100, range_mod: 1.05, reliability_mod: 1.03, description: "Sistema básico que ajuda a manter o curso e a altitude, reduzindo a fadiga do piloto em voos longos e melhorando a confiabilidade em missões estendidas." },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500, reliability_mod: 0.7, description: "Tecnologia experimental para ejetar o piloto em emergências. Extremamente caro e não confiável no período." }
        },
        advanced_avionics: {
            radio_direction_finder: { name: "Rádio Direção (RDF)", cost: 10000, weight: 25, metal_cost: 80, reliability_mod: 1.0, description: "Auxilia na navegação, permitindo que a aeronave encontre estações de rádio." },
            blind_flying_instruments: { name: "Instrumentos de Voo por Instrumentos", cost: 18000, weight: 30, metal_cost: 120, reliability_mod: 1.02, description: "Conjunto completo de instrumentos que permite voo em condições de baixa visibilidade (nevoeiro, noite), aumentando a segurança e confiabilidade em condições adversas." },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100, reliability_mod: 1.0, description: "Instrumentos adicionais para navegação precisa." },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150, reliability_mod: 1.0, description: "Bússola mais precisa e estável que a magnética, especialmente em manobras." },
            basic_bomb_sight: { name: "Mira de Bombardeio (Básica)", cost: 7000, weight: 15, metal_cost: 60, reliability_mod: 1.0, description: "Mira simples para bombardeio, melhora a precisão em alvos maiores." },
            advanced_bomb_sight: { name: "Mira de Bombardeio (Avançada)", cost: 25000, weight: 40, metal_cost: 180, reliability_mod: 0.95, description: "Mira giroscópica avançada, aumenta significativamente a precisão de bombardeio. Mais complexa e menos confiável que a básica." },
            camera_equipment: { name: "Equipamento de Câmera (Recon)", cost: 12000, weight: 60, metal_cost: 90, reliability_mod: 1.0, description: "Câmeras de alta resolução para missões de reconhecimento fotográfico." },
            early_radar: { name: "Radar Inicial (Experimental)", cost: 150000, weight: 200, metal_cost: 500, reliability_mod: 0.5, speed_mod: 0.95, description: "Tecnologia extremamente experimental e não confiável. Permite detecção de aeronaves inimigas à noite ou em mau tempo, mas é pesado, gera arrasto e falha frequentemente." }
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10, reliability_mod: 1.0, description: "Equipamento de segurança para a tripulação." },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1, description: "Sistema automático para combater incêndios a bordo, aumentando a confiabilidade e a segurança." },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200, reliability_mod: 1.0, description: "Rádio de alta frequência para comunicação de longo alcance." },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98, description: "Permite atirar através do arco da hélice sem atingi-la. Essencial para caças com armamento frontal, mas pode falhar." },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100, reliability_mod: 1.0, description: "Superfícies que se estendem para controlar a velocidade em mergulhos íngremes." },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20, reliability_mod: 1.0, description: "Sirenes montadas na aeronave para efeito psicológico sobre o inimigo." },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200, reliability_mod: 0.90, description: "Foguetes de curta duração para auxiliar na decolagem, especialmente com carga pesada. Uso único e pode ser perigoso." },
            extra_fuel_tanks: { name: "Tanques de Combustíveis Extras (Fixos)", cost: 8000, weight: 40, metal_cost: 150, range_mod: 1.4, maneuverability_mod: 0.9, reliability_mod: 0.98, description: "Aumenta o alcance com tanques internos maiores, mas o peso extra permanente prejudica a agilidade e adiciona pontos de falha." },
            drop_tanks: { name: "Tanques de Combustíveis Descartáveis", cost: 12000, weight: 20, metal_cost: 200, range_mod: 1.8, reliability_mod: 0.95, description: "Aumenta drasticamente o alcance. Os tanques são descartados antes do combate, não afetando a performance. Impede o uso de bombas ou foguetes e adiciona complexidade." },
            advanced_control_surfaces: { name: "Superfícies de Controle Avançadas", cost: 40000, weight: 50, metal_cost: 300, maneuverability_mod: 1.25, reliability_mod: 0.90, description: "Ailerons e profundores otimizados que permitem taxas de rolagem e curvas mais rápidas, ao custo de estabilidade e maior complexidade, impactando a confiabilidade." },
            arresting_hook: { name: "Gancho de Arresto", cost: 5000, weight: 20, metal_cost: 50, reliability_mod: 1.0, description: "Gancho retrátil para pousos em porta-aviões, essencial para aeronaves navais." },
            smoke_generators: { name: "Geradores de Fumaça", cost: 3000, weight: 50, metal_cost: 30, reliability_mod: 1.0, description: "Equipamento para criar cortinas de fumaça para ocultação ou sinalização durante o voo." },
            standardized_parts: { name: "Peças Padronizadas", cost: 10000, weight: 0, metal_cost: 50, reliability_mod: 1.08, description: "Uso de peças e componentes padronizados que facilitam a manutenção e aumentam a confiabilidade geral da aeronave." }
        },
        maintainability_features: {
            standardized_parts: { name: "Peças Padronizadas", cost: 10000, weight: 0, metal_cost: 50, reliability_mod: 1.08, description: "Uso de peças e componentes padronizados que facilitam a manutenção e aumentam a confiabilidade geral da aeronave." }
        }
    },
    constants: {
        standard_gravity_ms2: 9.80665,
        gas_constant_air_specific: 287.0528,
        temp_lapse_rate_k_per_m: 0.0065,
        temp_sea_level_k: 288.15,
        pressure_sea_level_pa: 101325,
        density_sea_level_kg_m3: 1.225,
        turn_g_force: 4.5,
        base_fuel_capacity_liters: 380,
        range_balance_factor: 1.7,
        country_cost_reduction_factor: 0.25,
        urbanization_cost_reduction_factor: 0.20,
        max_tech_civil_level: 150,
        max_urbanization_level: 80,
        min_roc_for_ceiling: 0.5,
        fuel_weight_per_liter: 0.72,
        crew_weight_kg: 90
    }
};

// --- DATA LOADING FUNCTIONS (Restored) ---
function cleanAndParseFloat(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    const cleanedValue = value.trim().replace('£', '').replace(/\./g, '').replace(',', '.').replace('%', '');
    return parseFloat(cleanedValue) || 0;
}

async function parseCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar CSV de ${url}: ${response.statusText}`);
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 1) return [];

        const robustSplit = (str) => {
            return str.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => {
                let value = v.trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
                return value.replace(/""/g, '"');
            });
        };

        const headers = robustSplit(lines[0].trim());
        
        return lines.slice(1).map(line => {
            const values = robustSplit(line.trim());
            let row = {};
            headers.forEach((header, i) => { row[header] = values[i] || ''; });
            return row;
        });
    } catch (error) {
        console.error(`Erro na requisição de rede para ${url}:`, error);
        throw error;
    }
}

async function loadGameDataFromSheets() {
    const countryDropdown = document.getElementById('country_doctrine');
    countryDropdown.innerHTML = '<option value="loading">Carregando dados...</option>';
    countryDropdown.disabled = true;

    try {
        const [countryStatsRaw, aeronavesRaw, metaisRaw] = await Promise.all([
            parseCSV(COUNTRY_STATS_URL),
            parseCSV(AERONAVES_URL),
            parseCSV(METAIS_URL)
        ]);

        const tempCountries = {};
        countryStatsRaw.forEach(row => {
            const countryName = row['País'];
            if (countryName) {
                tempCountries[countryName] = {
                    tech_civil: cleanAndParseFloat(row['Tec']),
                    urbanization: cleanAndParseFloat(row['Urbanização']),
                    tech_level_air: cleanAndParseFloat(row['Tecnologia Aeronautica']),
                    production_capacity: 0,
                    metal_balance: 0
                };
            }
        });

        aeronavesRaw.forEach(row => {
            const countryName = row['País'];
            if (tempCountries[countryName]) {
                tempCountries[countryName].production_capacity = cleanAndParseFloat(row['Capacidade de produção']);
            }
        });

        metaisRaw.forEach(row => {
            const countryName = row['País'];
            if (tempCountries[countryName]) {
                tempCountries[countryName].metal_balance = cleanAndParseFloat(row['Saldo']);
            }
        });
        
        tempCountries["Genérico / Padrão"] = { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 };

        gameData.countries = tempCountries;
        populateCountryDropdown();
        countryDropdown.disabled = false;
        
    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
        countryDropdown.disabled = false;
    }
}

function populateCountryDropdown() {
    const dropdown = document.getElementById('country_doctrine');
    dropdown.innerHTML = '';
    const sortedCountries = Object.keys(gameData.countries).sort();
    sortedCountries.forEach(countryName => {
        const option = document.createElement('option');
        option.value = countryName;
        option.textContent = countryName;
        dropdown.appendChild(option);
    });
    if (gameData.countries["Genérico / Padrão"]) {
        dropdown.value = "Genérico / Padrão";
    }
}

// --- AERODYNAMIC AND PERFORMANCE CALCULATION FUNCTIONS ---

/**
 * Calculates air properties (density, temperature, pressure) at a given altitude.
 * Uses the International Standard Atmosphere (ISA) model.
 * @param {number} altitude_m - Altitude in meters.
 * @returns {object} - Object containing density (kg/m^3), temperature (K), and pressure (Pa).
 */
function getAirPropertiesAtAltitude(altitude_m) {
    const { temp_sea_level_k, temp_lapse_rate_k_per_m, pressure_sea_level_pa, density_sea_level_kg_m3, gas_constant_air_specific, standard_gravity_ms2 } = gameData.constants;

    if (altitude_m < 11000) { // Troposphere
        const temperature_k = temp_sea_level_k - (temp_lapse_rate_k_per_m * altitude_m);
        const pressure_pa = pressure_sea_level_pa * Math.pow(temperature_k / temp_sea_level_k, standard_gravity_ms2 / (temp_lapse_rate_k_per_m * gas_constant_air_specific));
        const density_kg_m3 = pressure_pa / (gas_constant_air_specific * temperature_k);
        return { density: density_kg_m3, temperature: temperature_k, pressure: pressure_pa };
    } else { // Stratosphere (constant temperature at 11000m)
        const temperature_k_11000 = temp_sea_level_k - (temp_lapse_rate_k_per_m * 11000);
        const pressure_pa_11000 = pressure_sea_level_pa * Math.pow(temperature_k_11000 / temp_sea_level_k, standard_gravity_ms2 / (temp_lapse_rate_k_per_m * gas_constant_air_specific));
        
        const pressure_pa = pressure_pa_11000 * Math.exp(-standard_gravity_ms2 * (altitude_m - 11000) / (gas_constant_air_specific * temperature_k_11000));
        const density_kg_m3 = pressure_pa / (gas_constant_air_specific * temperature_k_11000);
        return { density: density_kg_m3, temperature: temperature_k_11000, pressure: pressure_pa };
    }
}

/**
 * Calculates the performance of the aircraft at a given altitude.
 * @param {number} altitude_m - Altitude in meters.
 * @param {number} combatWeight - Total weight of the aircraft in kg.
 * @param {number} totalEnginePower - Total engine power in HP.
 * @param {object} propData - Propeller data (efficiency).
 * @param {object} aero - Aerodynamic data (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod).
 * @param {object} superchargerData - Supercharger data (rated_altitude_m).
 * @returns {object} - Object containing speed (m/s, km/h), drag (N), and thrust (N).
 */
function calculatePerformanceAtAltitude(altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const { density } = getAirPropertiesAtAltitude(altitude_m);
    const { standard_gravity_ms2 } = gameData.constants;

    const wing_area_m2 = aero.wing_area_m2;
    const cd_0 = aero.cd_0 * aero.drag_mod;
    const aspect_ratio = aero.aspect_ratio;
    const oswald_efficiency = aero.oswald_efficiency;
    const propeller_efficiency = propData.efficiency;

    // Adjust engine power for altitude and supercharger
    let altitude_power_factor = 1.0;
    if (superchargerData.rated_altitude_m > 0) {
        if (altitude_m <= superchargerData.rated_altitude_m) {
            altitude_power_factor = 1.0; // Full power up to rated altitude
        } else {
            // Power decreases linearly above rated altitude
            altitude_power_factor = Math.max(0.1, 1 - ((altitude_m - superchargerData.rated_altitude_m) / 10000)); // Example: 10km above rated altitude, power is 0.1
        }
    } else {
        // Naturally aspirated engine: power decreases with density
        altitude_power_factor = density / gameData.constants.density_sea_level_kg_m3;
    }
    const engine_power_watts = totalEnginePower * 745.7 * altitude_power_factor; // Convert HP to Watts

    const weight_newtons = combatWeight * standard_gravity_ms2;

    let speed_ms = 0;
    let drag_newtons = 0;
    let thrust_newtons = 0;

    // Iteratively find speed where thrust equals drag
    // This is a simplified approach, a more accurate one would involve solving for V
    // For now, we'll iterate to find a reasonable equilibrium.
    // A more robust solution would involve a numerical solver or closed-form solution if possible.
    let best_speed_ms = 0;
    let min_diff = Infinity;

    for (let v = 50; v <= 300; v += 1) { // Iterate through speeds in m/s
        const cl = (2 * weight_newtons) / (density * v * v * wing_area_m2);
        const cd = cd_0 + (cl * cl) / (Math.PI * aspect_ratio * oswald_efficiency);
        const current_drag = 0.5 * density * v * v * wing_area_m2 * cd;
        const current_thrust = (engine_power_watts * propeller_efficiency) / v;

        const diff = Math.abs(current_thrust - current_drag);
        if (diff < min_diff) {
            min_diff = diff;
            best_speed_ms = v;
            drag_newtons = current_drag;
            thrust_newtons = current_thrust;
        }
    }
    speed_ms = best_speed_ms;

    return {
        speed_ms: speed_ms,
        speed_kmh: speed_ms * 3.6,
        drag_newtons: drag_newtons,
        thrust_newtons: thrust_newtons,
        v_ms: speed_ms // Adding v_ms for turn calculations
    };
}

/**
 * Calculates the rate of climb (RoC) at a given altitude.
 * @param {number} altitude_m - Altitude in meters.
 * @param {number} combatWeight - Total weight of the aircraft in kg.
 * @param {number} totalEnginePower - Total engine power in HP.
 * @param {object} propData - Propeller data (efficiency).
 * @param {object} aero - Aerodynamic data (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod).
 * @param {object} superchargerData - Supercharger data (rated_altitude_m).
 * @returns {number} - Rate of climb in m/s.
 */
function calculateRateOfClimb(altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const perf = calculatePerformanceAtAltitude(altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData);
    const { standard_gravity_ms2 } = gameData.constants;

    const excess_power = perf.thrust_newtons * perf.speed_ms - perf.drag_newtons * perf.speed_ms;
    const rate_of_climb_ms = excess_power / (combatWeight * standard_gravity_ms2);
    return isNaN(rate_of_climb_ms) ? 0 : Math.max(0, rate_of_climb_ms); // Ensure non-negative RoC
}


// --- MAIN CALCULATION FUNCTION ---
function updateCalculations() {
    const inputs = gatherInputs();
    const baseStats = calculateBaseStats(inputs);
    if (!baseStats) {
        updateUI(null);
        updateProgress();
        return null;
    }
    
    const modifiedStats = applyModifiers(baseStats, inputs);
    const performance = calculatePerformance(modifiedStats, inputs);

    updateUI(performance);
    
    if (performance) {
        stateManager.saveState(inputs);
    }
    
    return performance;
}

const debouncedUpdateCalculations = debounce(updateCalculations, 250);

// --- HELPER FUNCTIONS for calculation logic ---
function gatherInputs() {
    const getCheckboxValues = (containerId) => 
        Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(cb => cb.id);

    return {
        aircraftName: document.getElementById('aircraft_name')?.value || 'Aeronave Sem Nome',
        quantity: parseInt(document.getElementById('quantity')?.value) || 1,
        selectedCountryName: document.getElementById('country_doctrine')?.value,
        selectedAirDoctrine: document.getElementById('air_doctrine')?.value,
        aircraftType: document.getElementById('aircraft_type')?.value,
        structureType: document.getElementById('structure_type')?.value,
        wingType: document.getElementById('wing_type')?.value,
        landingGearType: document.getElementById('landing_gear_type')?.value,
        engineType: document.getElementById('engine_type')?.value,
        numEngines: parseInt(document.getElementById('num_engines')?.value) || 1,
        enginePower: parseInt(document.getElementById('engine_power')?.value) || 0,
        propellerType: document.getElementById('propeller_type')?.value,
        coolingSystem: document.getElementById('cooling_system')?.value,
        fuelFeed: document.getElementById('fuel_feed')?.value,
        supercharger: document.getElementById('supercharger')?.value,
        numCrewmen: parseInt(document.getElementById('num_crewmen')?.value) || 1,
        productionQualitySliderValue: parseInt(document.getElementById('production_quality_slider')?.value) || 50,
        defensiveTurretType: document.getElementById('defensive_turret_type')?.value,
        checkboxes: {
            wing_features: getCheckboxValues('wing_features_checkboxes'),
            engine_enhancements: getCheckboxValues('engine_enhancements_checkboxes'),
            protection: getCheckboxValues('protection_checkboxes'),
            cockpit_comfort: getCheckboxValues('cockpit_comfort_checkboxes'),
            advanced_avionics: getCheckboxValues('advanced_avionics_checkboxes'),
            equipment: getCheckboxValues('equipment_checkboxes'),
        },
        armaments: {
            offensive: Array.from(document.querySelectorAll('#offensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 })),
            defensive: Array.from(document.querySelectorAll('#defensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 }))
        }
    };
}

function calculateBaseStats(inputs) {
    const typeData = gameData.components.aircraft_types[inputs.aircraftType];
    const engineData = gameData.components.engines[inputs.engineType];
    
    if (!typeData || !engineData) return null;

    return {
        baseUnitCost: typeData.cost,
        baseMetalCost: typeData.metal_cost,
        totalEmptyWeight: typeData.weight,
        reliabilityModifier: typeData.reliability_base,
        aero: {
            wing_area_m2: typeData.wing_area_m2, cl_max: typeData.cl_max, cd_0: typeData.cd_0,
            aspect_ratio: typeData.aspect_ratio, oswald_efficiency: typeData.oswald_efficiency,
            maneuverability_mod: typeData.maneuverability_base, drag_mod: 1.0, power_mod: 1.0,
            range_mod: 1.0, ceiling_mod: 1.0, speed_mod: 1.0
        },
        typeData, engineData
    };
}

function applyModifiers(baseStats, inputs) {
    let { baseUnitCost, baseMetalCost, totalEmptyWeight, reliabilityModifier, aero } = baseStats;
    const { doctrineData, structureData, wingData, landingGearData, propData, coolingData, fuelFeedData, superchargerData, engineData } = getComponentData(inputs);

    if (doctrineData) {
        baseUnitCost *= doctrineData.cost_modifier || 1;
        reliabilityModifier *= doctrineData.reliability_modifier || 1;
        totalEmptyWeight *= doctrineData.weight_penalty || 1;
        if (doctrineData.performance_bonus) {
            aero.speed_mod *= doctrineData.performance_bonus.speed || 1;
            aero.maneuverability_mod *= doctrineData.performance_bonus.maneuverability || 1;
            aero.range_mod *= doctrineData.performance_bonus.range || 1;
            aero.ceiling_mod *= doctrineData.performance_bonus.service_ceiling || 1;
        }
    }
    
    [structureData, wingData].forEach(data => {
        if(data) {
            baseUnitCost *= data.cost_mod || 1;
            totalEmptyWeight *= data.weight_mod || 1;
            reliabilityModifier *= data.reliability_mod || 1;
            aero.drag_mod *= data.drag_mod || 1;
            aero.cl_max *= data.cl_max_mod || 1;
            aero.cd_0 *= data.cd_0_mod || 1;
            aero.aspect_ratio *= data.aspect_ratio_mod || 1;
            aero.maneuverability_mod *= data.maneuverability_mod || 1;
        }
    });

    if (landingGearData) {
        baseUnitCost += landingGearData.cost;
        totalEmptyWeight += landingGearData.weight;
        baseMetalCost += landingGearData.metal_cost;
        aero.drag_mod *= landingGearData.drag_mod;
        reliabilityModifier *= landingGearData.reliability_mod;
    }

    let totalEnginePower = 0;
    document.getElementById('engine_power_note').textContent = "";
    if (inputs.engineType && engineData && inputs.enginePower >= engineData.min_power && inputs.enginePower <= engineData.max_power) {
        totalEnginePower = inputs.enginePower * inputs.numEngines;
        baseUnitCost += (engineData.cost + (inputs.enginePower * 20)) * inputs.numEngines;
        baseMetalCost += engineData.metal_cost * inputs.numEngines;
        totalEmptyWeight += engineData.weight * inputs.numEngines;
        reliabilityModifier *= Math.pow(engineData.reliability, inputs.numEngines);
    } else if (inputs.engineType && engineData) {
        document.getElementById('engine_power_note').textContent = `Potência para ${engineData.name} deve ser entre ${engineData.min_power} e ${engineData.max_power} HP.`;
    }

    [propData, coolingData, fuelFeedData, superchargerData].forEach(data => {
        if(data) {
            baseUnitCost += (data.cost || 0) * inputs.numEngines;
            totalEmptyWeight += (data.weight || 0) * inputs.numEngines;
            reliabilityModifier *= Math.pow(data.reliability_mod || 1.0, inputs.numEngines);
            aero.drag_mod *= data.drag_mod || 1.0;
            aero.power_mod *= data.performance_mod || data.power_mod || 1.0;
        }
    });

    for (const category in inputs.checkboxes) {
        inputs.checkboxes[category].forEach(id => {
            const item = findItemAcrossCategories(id);
            if (item) {
                baseUnitCost += item.cost || 0;
                totalEmptyWeight += item.weight || 0;
                baseMetalCost += item.metal_cost || 0;
                reliabilityModifier *= item.reliability_mod || 1.0;
                aero.maneuverability_mod *= item.maneuverability_mod || 1.0;
                aero.range_mod *= item.range_mod || 1.0;
                aero.ceiling_mod *= item.ceiling_mod || 1.0;
                aero.speed_mod *= item.speed_mod || 1.0;
                aero.drag_mod *= item.drag_mod || 1.0;
                aero.cl_max *= item.cl_max_mod || 1.0;
            }
        });
    }

    let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
    let offensiveArmamentTexts = [];
    inputs.armaments.offensive.forEach(arm => {
        if (arm.qty > 0) {
            const armData = gameData.components.armaments[arm.id];
            if (armData) { // Added check for armData existence
                armamentCost += armData.cost * arm.qty;
                armamentWeight += armData.weight * arm.qty;
                armamentMetalCost += armData.metal_cost * arm.qty;
                offensiveArmamentTexts.push(`${arm.qty}x ${armData.name}`);
            }
        }
    });
    baseUnitCost += armamentCost;
    baseMetalCost += armamentMetalCost;

    let defensiveArmamentTexts = [];
    const turretData = gameData.components.defensive_armaments[inputs.defensiveTurretType];
    if (turretData && inputs.defensiveTurretType !== "none_turret") {
        baseUnitCost += turretData.cost;
        totalEmptyWeight += turretData.weight;
        baseMetalCost += turretData.metal_cost;
        reliabilityModifier *= turretData.reliability_mod;
        inputs.armaments.defensive.forEach(arm => {
            if (arm.qty > 0) {
                const defArmData = gameData.components.defensive_armaments[arm.id];
                if (defArmData) { // Added check for defArmData existence
                    baseUnitCost += defArmData.cost * arm.qty;
                    totalEmptyWeight += defArmData.weight * arm.qty;
                    baseMetalCost += defArmData.metal_cost * arm.qty;
                    defensiveArmamentTexts.push(`${arm.qty}x ${defArmData.name.replace(' (Defensiva)', '')}`);
                }
            }
        });
    }

    return { baseUnitCost, baseMetalCost, totalEmptyWeight, reliabilityModifier, aero, totalEnginePower, armamentWeight, offensiveArmamentTexts, defensiveArmamentTexts, propData, superchargerData };
}

function calculatePerformance(modifiedStats, inputs) {
    if (!modifiedStats || !inputs.aircraftType || !inputs.engineType) return null; // Ensure essential data is present
    const { baseUnitCost, baseMetalCost, totalEmptyWeight, reliabilityModifier, aero, totalEnginePower, armamentWeight, offensiveArmamentTexts, defensiveArmamentTexts, propData, superchargerData } = modifiedStats;
    const typeData = gameData.components.aircraft_types[inputs.aircraftType];
    
    // Check if typeData, propData, and superchargerData are valid before proceeding
    if (!typeData || !propData || !superchargerData) return null;

    const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000) * Math.sqrt(inputs.numEngines);
    const fuelWeight = fuelCapacity * gameData.constants.fuel_weight_per_liter;
    const combatWeight = totalEmptyWeight + armamentWeight + (inputs.numCrewmen * gameData.constants.crew_weight_kg) + fuelWeight;

    const qualityBias = (100 - inputs.productionQualitySliderValue) / 100;
    const productionBias = inputs.productionQualitySliderValue / 100;
    let adjustedUnitCost = baseUnitCost * (1 + (productionBias * 0.20) - (qualityBias * 0.20));
    let adjustedReliability = reliabilityModifier * (1 + (qualityBias * 0.15) - (productionBias * 0.15));
    
    const countryData = gameData.countries[inputs.selectedCountryName];
    if (countryData) {
        const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
        const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        const costReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
        adjustedUnitCost *= (1 - costReduction);
        const bonusNoteEl = document.getElementById('country_bonus_note');
        if (bonusNoteEl) {
            bonusNoteEl.textContent = `Tec. Civil: ${countryData.tech_civil}, Tec. Aérea: ${countryData.tech_level_air} | Redução de Custo: ${(costReduction * 100).toFixed(1)}%`;
        }
    }

    const perfSL = calculatePerformanceAtAltitude(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
    const perfAlt = calculatePerformanceAtAltitude(superchargerData.rated_altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData);
    
    let rawSpeedKmhAlt = perfAlt.speed_kmh * aero.speed_mod;
    const bsfc_kg_per_watt_s = (gameData.components.engines[inputs.engineType].bsfc_g_per_kwh / 1000) / 3.6e6;
    const L_D_ratio = Math.sqrt(aero.cd_0 * Math.PI * aero.aspect_ratio * aero.oswald_efficiency) / (2 * aero.cd_0);
    const range_m = (propData.efficiency / (gameData.constants.standard_gravity_ms2 * bsfc_kg_per_watt_s)) * L_D_ratio * Math.log(combatWeight / (combatWeight - fuelWeight));
    let rawRangeKm = (range_m / 1000) * aero.range_mod;

    let finalSpeedKmhAlt = Math.min(rawSpeedKmhAlt, typeData.limits.max_speed);
    let finalRangeKm = Math.min(rawRangeKm / gameData.constants.range_balance_factor, typeData.limits.max_range);

    let serviceCeiling = 0;
    for (let h = 0; h <= 15000; h += 250) {
        if (calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) < gameData.constants.min_roc_for_ceiling) {
            serviceCeiling = h;
            break;
        }
        if (h === 15000) serviceCeiling = h;
    }
    let finalServiceCeiling = serviceCeiling * aero.ceiling_mod;
    if (!inputs.checkboxes.cockpit_comfort.includes('pressurized_cabin') && finalServiceCeiling > 10000) finalServiceCeiling = 10000;
    if (!inputs.checkboxes.cockpit_comfort.includes('oxygen_system') && finalServiceCeiling > 5000) finalServiceCeiling = 5000;

    const v_turn = perfAlt.v_ms * 0.8;
    const max_load_factor = Math.min(gameData.constants.turn_g_force, (0.5 * getAirPropertiesAtAltitude(2000).density * v_turn * v_turn * aero.cl_max) / (combatWeight / aero.wing_area_m2));
    const turn_radius = (v_turn * v_turn) / (gameData.constants.standard_gravity_ms2 * Math.sqrt(Math.max(0.01, max_load_factor * max_load_factor - 1)));
    let turn_time_s = (2 * Math.PI * turn_radius) / v_turn / aero.maneuverability_mod;
    
    return {
        inputs, adjustedUnitCost: Math.round(adjustedUnitCost), baseMetalCost: Math.round(baseMetalCost), combatWeight, totalEnginePower,
        finalSpeedKmhSL: Math.min(perfSL.speed_kmh * aero.speed_mod, typeData.limits.max_speed), finalSpeedKmhAlt,
        rate_of_climb_ms: perfSL.roc_ms, finalServiceCeiling, finalRangeKm, turn_time_s: Math.max(12, Math.min(60, turn_time_s)),
        finalReliability: Math.max(5, Math.min(100, 100 * adjustedReliability)), offensiveArmamentTexts, defensiveArmamentTexts,
        countryData, wingLoading: combatWeight / aero.wing_area_m2, typeData, rawSpeedKmhAlt, rawRangeKm, superchargerData, aero, propData
    };
}

function updateUI(performance) {
    if (!performance) {
        document.getElementById('status').textContent = "Selecione o tipo de aeronave e um motor com potência válida para começar.";
        // Clear all display values when no performance data is available
        const displayElements = ['display_name', 'display_type', 'display_doctrine', 'unit_cost', 'total_production_cost',
                                 'total_metal_cost', 'total_weight', 'total_power', 'speed_max_sl', 'speed_max_alt',
                                 'rate_of_climb', 'service_ceiling', 'max_range', 'turn_time', 'main_armament',
                                 'reliability_display', 'country_production_capacity', 'producible_units', 'country_metal_balance'];
        displayElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'display_name') el.textContent = 'Sem nome';
                else if (id === 'display_type' || id === 'display_doctrine') el.textContent = '-';
                else if (id === 'main_armament') el.textContent = 'Desarmado';
                else el.textContent = '0'; // For numeric values
            }
        });
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (metalStatusEl) {
            metalStatusEl.textContent = '';
            metalStatusEl.className = 'text-xs font-medium mt-1 text-center';
        }
        return;
    }
    const { inputs, adjustedUnitCost, baseMetalCost, combatWeight, totalEnginePower, finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, finalReliability, offensiveArmamentTexts, countryData, typeData } = performance;
    
    const elements = {
        'display_name': inputs.aircraftName, 'display_type': typeData.name, 'display_doctrine': gameData.doctrines[inputs.selectedAirDoctrine]?.name || '-',
        'unit_cost': adjustedUnitCost.toLocaleString('pt-BR'), 'total_production_cost': (adjustedUnitCost * inputs.quantity).toLocaleString('pt-BR'),
        'total_metal_cost': (baseMetalCost * inputs.quantity).toLocaleString('pt-BR'), 'total_weight': `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
        'total_power': `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`, 'speed_max_sl': `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`,
        'speed_max_alt': `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`, 'rate_of_climb': `${rate_of_climb_ms.toFixed(1)} m/s`,
        'service_ceiling': `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`, 'max_range': `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
        'turn_time': `${turn_time_s.toFixed(1)} s`, 'main_armament': offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Desarmado",
        'reliability_display': `${finalReliability.toFixed(1)}%`
    };
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    if (countryData) {
        let countryProductionCapacity = countryData.production_capacity * (1 + ((inputs.productionQualitySliderValue / 100) * 0.25) - (((100 - inputs.productionQualitySliderValue) / 100) * 0.10));
        const producibleUnits = adjustedUnitCost > 0 ? Math.floor(countryProductionCapacity / adjustedUnitCost) : 'N/A';
        document.getElementById('country_production_capacity').textContent = Math.round(countryProductionCapacity).toLocaleString('pt-BR');
        document.getElementById('producible_units').textContent = producibleUnits.toLocaleString ? producibleUnits.toLocaleString('pt-BR') : 'N/A';
        document.getElementById('country_metal_balance').textContent = Math.round(countryData.metal_balance).toLocaleString('pt-BR');
        const totalMetalCost = baseMetalCost * inputs.quantity;
        const metalStatusEl = document.getElementById('metal_balance_status');
        metalStatusEl.textContent = totalMetalCost > countryData.metal_balance ? '⚠️ Saldo de metais insuficiente!' : '✅ Saldo de metais suficiente.';
        metalStatusEl.className = `text-xs font-medium mt-1 text-center ${totalMetalCost > countryData.metal_balance ? 'text-red-600' : 'text-green-600'}`;
    }
    updateStatusAndWarnings(performance);
}

function updateStatusAndWarnings(performance) {
    const statusContainer = document.getElementById('status-container');
    statusContainer.innerHTML = '';
    let warnings = [];
    const { totalEnginePower, combatWeight, wingLoading, finalReliability, typeData, rawSpeedKmhAlt, rawRangeKm } = performance;
    const powerToWeightRatio = (totalEnginePower * 745.7) / (combatWeight * gameData.constants.standard_gravity_ms2);

    if (powerToWeightRatio < 0.25 && typeData.name.includes('Caça')) warnings.push({ type: 'error', text: '🔥 Relação peso/potência crítica!' });
    else if (powerToWeightRatio < 0.35 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Relação peso/potência baixa.' });
    if (wingLoading > 200 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Carga alar alta, prejudica manobrabilidade.' });
    if (finalReliability < 70) warnings.push({ type: 'error', text: '🔥 Confiabilidade baixa: Propenso a falhas!' });
    if (typeData.limits) {
        if (rawSpeedKmhAlt > typeData.limits.max_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade acima do esperado. (Limitado a: ${typeData.limits.max_speed} km/h)` });
        if (rawRangeKm / gameData.constants.range_balance_factor > typeData.limits.max_range) warnings.push({ type: 'warning', text: `⚠️ Alcance acima do esperado. (Limitado a: ${typeData.limits.max_range} km)` });
    }
    if (warnings.length === 0) warnings.push({ type: 'ok', text: '✅ Design pronto para os céus!' });

    warnings.forEach(warning => {
        const statusEl = document.createElement('div');
        statusEl.className = `p-3 rounded-lg text-center text-sm font-medium status-${warning.type}`;
        statusEl.textContent = warning.text;
        statusContainer.appendChild(statusEl);
    });
}

// --- UI & INITIALIZATION ---
let currentStep = 1;
function toggleStep(step) {
    const content = document.getElementById(`step_${step}_content`);
    const icon = document.getElementById(`step_${step}_icon`);
    const card = document.getElementById(`step_${step}`);
    if (content.classList.contains('hidden')) {
        for (let i = 1; i <= 5; i++) {
            if (i !== step) {
                document.getElementById(`step_${i}_content`).classList.add('hidden');
                document.getElementById(`step_${i}_icon`).classList.remove('rotate-180');
                document.getElementById(`step_${i}`).classList.remove('active');
            }
        }
        content.classList.remove('hidden'); icon.classList.add('rotate-180'); card.classList.add('active');
        currentStep = step;
    } else {
        content.classList.add('hidden'); icon.classList.remove('rotate-180'); card.classList.remove('active');
    }
}

function updateProgress() {
    const requiredFields = ['aircraft_name', 'country_doctrine', 'air_doctrine', 'aircraft_type', 'engine_type'];
    let completedFields = 0;
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value && field.value !== '' && field.value !== 'loading') completedFields++;
    });
    document.getElementById('progress_bar').style.width = `${(completedFields / requiredFields.length) * 100}%`;
}

function generateSheet() {
    const performanceData = updateCalculations();
    if (performanceData) {
        const { inputs, adjustedUnitCost, combatWeight, totalEnginePower, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, finalReliability, offensiveArmamentTexts, defensiveArmamentTexts, aero, propData, superchargerData, typeData } = performanceData;
        
        const sheetData = {
            ...inputs,
            doctrineName: gameData.doctrines[inputs.selectedAirDoctrine]?.name || '-',
            aircraftTypeName: typeData.name,
            structureTypeName: gameData.components.structure_materials[inputs.structureType]?.name,
            wingTypeName: gameData.components.wing_types[inputs.wingType]?.name,
            landingGearTypeName: gameData.components.landing_gear_types[inputs.landingGearType]?.name,
            engineTypeName: gameData.components.engines[inputs.engineType]?.name,
            propellerTypeName: propData.name,
            coolingSystemName: gameData.components.cooling_systems[inputs.coolingSystem]?.name,
            fuelFeedName: gameData.components.fuel_feeds[inputs.fuelFeed]?.name,
            superchargerName: superchargerData.name,
            finalUnitCost: adjustedUnitCost.toLocaleString('pt-BR'),
            totalWeight: `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
            totalPower: `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`,
            speedMax: `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`,
            rateOfClimb: `${rate_of_climb_ms.toFixed(1)} m/s`,
            serviceCeiling: `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`,
            maxRange: `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
            turnTime: `${turn_time_s.toFixed(1)} s`,
            reliability: `${finalReliability.toFixed(1)}%`,
            offensiveArmamentText: offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Nenhum",
            defensiveArmamentTexts,
            selectedWingFeatures: inputs.checkboxes.wing_features.map(id => gameData.components.wing_features[id]?.name),
            selectedEngineEnhancements: inputs.checkboxes.engine_enhancements.map(id => gameData.components.engine_enhancements[id]?.name),
            selectedProtection: inputs.checkboxes.protection.map(id => gameData.components.protection[id]?.name),
            selectedCockpitComfort: inputs.checkboxes.cockpit_comfort.map(id => gameData.components.cockpit_comfort[id]?.name),
            selectedAdvancedAvionics: inputs.checkboxes.advanced_avionics.map(id => gameData.components.advanced_avionics[id]?.name),
            selectedEquipment: inputs.checkboxes.equipment.map(id => findItemAcrossCategories(id)?.name),
            performanceGraphData: generatePerformanceGraphData(performanceData)
        };
        localStorage.setItem('aircraftSheetData', JSON.stringify(sheetData));
        // localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft)); // realWorldAircraft is not defined in this scope
        window.open('ficha.html', '_blank');
    }
}

function generatePerformanceGraphData(performanceData) {
    const { combatWeight, totalEnginePower, propData, aero, superchargerData, finalServiceCeiling, typeData } = performanceData;
    const data = [];
    for (let h = 0; h <= 15000; h += 1000) { // Increased max altitude for graph to ensure ceiling is captured
        let cappedAlt = h;
        if (h > finalServiceCeiling && finalServiceCeiling > 0) { // Only cap if a ceiling is actually reached
            cappedAlt = finalServiceCeiling;
        }
        
        const perfPoint = calculatePerformanceAtAltitude(cappedAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let cappedSpeed = perfPoint.speed_kmh * aero.speed_mod;
        if (typeData.limits && cappedSpeed > typeData.limits.max_speed) {
            cappedSpeed = typeData.limits.max_speed;
        }

        data.push({
            altitude: cappedAlt,
            speed: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : cappedSpeed, // Speed is 0 above service ceiling
            roc: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : perfPoint.roc_ms // RoC is 0 above service ceiling
        });
        if (h >= finalServiceCeiling && finalServiceCeiling > 0) {
            // If we've reached or passed the ceiling, add one more point at the exact ceiling if not already there
            if (data[data.length -1].altitude !== finalServiceCeiling) {
                 data.push({
                    altitude: finalServiceCeiling,
                    speed: Math.min(calculatePerformanceAtAltitude(finalServiceCeiling, combatWeight, totalEnginePower, propData, aero, superchargerData).speed_kmh * aero.speed_mod, typeData.limits.max_speed),
                    roc: 0
                });
            }
            break;
        }
    }
    return data;
}

function getComponentData(inputs) {
    return {
        doctrineData: gameData.doctrines[inputs.selectedAirDoctrine],
        structureData: gameData.components.structure_materials[inputs.structureType],
        wingData: gameData.components.wing_types[inputs.wingType],
        landingGearData: gameData.components.landing_gear_types[inputs.landingGearType],
        propData: gameData.components.propellers[inputs.propellerType],
        coolingData: gameData.components.cooling_systems[inputs.coolingSystem],
        fuelFeedData: gameData.components.fuel_feeds[inputs.fuelFeed],
        superchargerData: gameData.components.superchargers[inputs.supercharger],
        engineData: gameData.components.engines[inputs.engineType]
    };
}

function findItemAcrossCategories(id) {
    for (const categoryKey in gameData.components) {
        if (gameData.components[categoryKey][id]) {
            return gameData.components[categoryKey][id];
        }
    }
    return null;
}

function createTemplateMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fixed top-4 right-4 z-40';
    menuContainer.innerHTML = `<button id="template-menu-btn" class="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors"><i class="fas fa-magic"></i></button><div id="template-menu" class="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-48 hidden"><div class="p-3 border-b border-gray-200"><h3 class="font-semibold text-gray-800">🎯 Templates</h3></div><div class="p-2">${templateManager.getAllTemplates().map(t => `<button onclick="templateManager.applyTemplate('${t.id}')" class="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"><div class="font-medium">${t.name}</div><div class="text-xs text-gray-600">${t.description}</div></button>`).join('')}</div></div>`;
    document.body.appendChild(menuContainer);
    const btn = document.getElementById('template-menu-btn');
    const menu = document.getElementById('template-menu');
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => { if (!menuContainer.contains(e.target)) menu.classList.add('hidden'); });
}

function createUndoRedoButtons() {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 left-4 flex flex-col gap-2 z-40';
    container.innerHTML = `<button id="undo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled><i class="fas fa-undo"></i></button><button id="redo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled><i class="fas fa-redo"></i></button>`;
    document.body.appendChild(container);
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    undoBtn.onclick = () => keyboardManager.undo();
    redoBtn.onclick = () => keyboardManager.redo();
    stateManager.addListener((manager) => {
        undoBtn.disabled = !manager.canUndo();
        redoBtn.disabled = !manager.canRedo();
    });
}

window.onload = function() {
    stateManager = new StateManager();
    templateManager = new TemplateManager();
    autoSaveManager = new AutoSaveManager();
    keyboardManager = new KeyboardManager();
    
    loadGameDataFromSheets().then(() => {
        toggleStep(1);
        updateCalculations();
        stateManager.saveState(autoSaveManager.getCurrentFormData());
    });

    createTemplateMenu();
    createUndoRedoButtons();

    window.toggleStep = toggleStep;
    window.updateCalculations = updateCalculations;
    window.generateSheet = generateSheet;
};
