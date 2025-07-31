// assets/js/ui.js

import { gameData, realWorldAircraft } from './data.js'; // Importa gameData e realWorldAircraft
import { updateCalculations } from './calculations.js'; // Importa updateCalculations para uso em generateSheet
import { templateManager, stateManager } from './managers.js'; // Importa managers

let currentStep = 1;

/**
 * Atualiza os elementos da interface do usuário com os dados de performance calculados.
 * @param {object|null} performance - Objeto contendo os dados de performance, ou null para limpar a UI.
 */
export function updateUI(performance) {
    if (!performance) {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = "Selecione o tipo de aeronave e um motor com potência válida para começar.";
        // Limpa todos os valores de exibição quando não há dados de performance
        const displayElements = ['display_name', 'display_type', 'display_doctrine', 'unit_cost', 'total_production_cost',
                                 'total_metal_cost', 'total_weight', 'total_power', 'speed_max_sl', 'speed_max_alt',
                                 'rate_of_climb', 'service_ceiling', 'max_range', 'turn_time', 'main_armament',
                                 'reliability_display', 'country_production_capacity', 'producible_units', 'country_metal_balance',
                                 'display_country_tech_civil', 'display_country_air_tech', 'display_country_urbanization', 'display_country_cost_reduction']; // Adicionados novos IDs
        displayElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'display_name') el.textContent = 'Sem nome';
                else if (['display_type', 'display_doctrine', 'display_country_tech_civil', 'display_country_air_tech', 'display_country_urbanization', 'display_country_cost_reduction'].includes(id)) el.textContent = 'N/A'; // Define N/A para os novos campos
                else if (id === 'main_armament') el.textContent = 'Desarmado';
                else el.textContent = '0'; // Para valores numéricos
            }
        });
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (metalStatusEl) {
            metalStatusEl.textContent = '';
            metalStatusEl.className = 'text-xs font-medium mt-1 text-center';
        }
        return;
    }
    const { inputs, adjustedUnitCost, baseMetalCost, combatWeight, totalEnginePower, finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s, finalReliability, offensiveArmamentTexts, countryData, typeData, countryCostReduction } = performance; // Desestruturado countryCostReduction

    const elements = {
        'display_name': inputs.aircraftName,
        'display_type': typeData.name,
        'display_doctrine': gameData.doctrines[inputs.selectedAirDoctrine]?.name || '-',
        'unit_cost': adjustedUnitCost.toLocaleString('pt-BR'),
        'total_production_cost': (adjustedUnitCost * inputs.quantity).toLocaleString('pt-BR'),
        'total_metal_cost': (baseMetalCost * inputs.quantity).toLocaleString('pt-BR'),
        'total_weight': `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
        'total_power': `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`,
        'speed_max_sl': `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`,
        'speed_max_alt': `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`,
        'rate_of_climb': `${rate_of_climb_ms.toFixed(1)} m/s`,
        'service_ceiling': `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`,
        'max_range': `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
        'turn_time': `${turn_time_s.toFixed(1)} s`,
        'main_armament': offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Desarmado",
        'reliability_display': `${finalReliability.toFixed(1)}%`
    };
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    if (countryData) {
        // Ajusta a capacidade de produção do país com base no slider de qualidade de produção
        // Aumenta a capacidade se o slider estiver para "produção" (alto valor)
        // Diminui a capacidade se o slider estiver para "qualidade" (baixo valor)
        let countryProductionCapacity = countryData.production_capacity * (1 + ((inputs.productionQualitySliderValue / 100) * 0.25) - (((100 - inputs.productionQualitySliderValue) / 100) * 0.10));
        document.getElementById('country_production_capacity').textContent = Math.round(countryProductionCapacity).toLocaleString('pt-BR');

        const producibleUnits = adjustedUnitCost > 0 ? Math.floor(countryProductionCapacity / adjustedUnitCost) : 'N/A';
        document.getElementById('producible_units').textContent = typeof producibleUnits === 'number' ? producibleUnits.toLocaleString('pt-BR') : producibleUnits;

        document.getElementById('country_metal_balance').textContent = Math.round(countryData.metal_balance).toLocaleString('pt-BR');
        const totalMetalCost = baseMetalCost * inputs.quantity;
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (metalStatusEl) {
            metalStatusEl.textContent = totalMetalCost > countryData.metal_balance ? '⚠️ Saldo de metais insuficiente!' : '✅ Saldo de metais suficiente.';
            metalStatusEl.className = `text-xs font-medium mt-1 text-center ${totalMetalCost > countryData.metal_balance ? 'text-red-600' : 'text-green-600'}`;
        }

        // NOVAS LINHAS PARA EXIBIR AS INFORMAÇÕES DO PAÍS
        const displayCountryTechCivil = document.getElementById('display_country_tech_civil');
        if (displayCountryTechCivil) {
            displayCountryTechCivil.textContent = Math.round(countryData.tech_civil).toLocaleString('pt-BR');
        }
        const displayCountryAirTech = document.getElementById('display_country_air_tech');
        if (displayCountryAirTech) {
            displayCountryAirTech.textContent = Math.round(countryData.tech_level_air).toLocaleString('pt-BR');
        }
        const displayCountryUrbanization = document.getElementById('display_country_urbanization');
        if (displayCountryUrbanization) {
            displayCountryUrbanization.textContent = Math.round(countryData.urbanization).toLocaleString('pt-BR');
        }
        const displayCountryCostReduction = document.getElementById('display_country_cost_reduction');
        if (displayCountryCostReduction) {
            displayCountryCostReduction.textContent = `${(countryCostReduction * 100).toFixed(1)}%`;
        }
    }
    updateStatusAndWarnings(performance);
}

/**
 * Alterna a visibilidade de uma seção (passo) do formulário.
 * @param {number} step - O número do passo a ser alternado.
 */
export function toggleStep(step) {
    const content = document.getElementById(`step_${step}_content`);
    const icon = document.getElementById(`step_${step}_icon`);
    const card = document.getElementById(`step_${step}`);
    if (!content || !icon || !card) return; // Garante que os elementos existem

    if (content.classList.contains('hidden')) {
        // Esconde todos os outros passos
        for (let i = 1; i <= 5; i++) {
            const otherContent = document.getElementById(`step_${i}_content`);
            const otherIcon = document.getElementById(`step_${i}_icon`);
            const otherCard = document.getElementById(`step_${i}`);
            if (otherContent && otherIcon && otherCard) {
                if (i !== step) {
                    otherContent.classList.add('hidden');
                    otherIcon.classList.remove('rotate-180');
                    otherCard.classList.remove('active');
                }
            }
        }
        // Mostra o passo selecionado
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
        card.classList.add('active');
        currentStep = step;
    } else {
        // Esconde o passo se já estiver aberto
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
        card.classList.remove('active');
    }
}

/**
 * Atualiza a barra de progresso com base nos campos obrigatórios preenchidos.
 */
export function updateProgress() {
    const requiredFields = ['aircraft_name', 'country_doctrine', 'air_doctrine', 'aircraft_type', 'engine_type'];
    let completedFields = 0;
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.value && field.value !== '' && field.value !== 'loading') completedFields++;
    });
    const progressBar = document.getElementById('progress_bar');
    if (progressBar) {
        progressBar.style.width = `${(completedFields / requiredFields.length) * 100}%`;
    }
}

/**
 * Gera a ficha da aeronave e a abre em uma nova aba.
 */
export function generateSheet() {
    const performanceData = updateCalculations();
    if (performanceData) {
        localStorage.setItem('aircraftSheetData', JSON.stringify(performanceData));
        localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft));
        window.open('ficha.html', '_blank');
    } else {
        console.error("Não foi possível gerar a ficha: dados da aeronave são inválidos.");
        const statusContainer = document.getElementById('status-container');
        if (statusContainer) {
            statusContainer.innerHTML = ''; // Limpa mensagens anteriores
            const errorEl = document.createElement('div');
            errorEl.className = 'p-3 rounded-lg text-center text-sm font-medium status-error text-red-600'; // Classes Tailwind
            errorEl.textContent = '🔥 Erro: Preencha os campos obrigatórios para gerar a ficha.';
            statusContainer.appendChild(errorEl);
        }
    }
}

/**
 * Gera dados para o gráfico de performance (velocidade e taxa de subida vs. altitude).
 * @param {object} performanceData - Os dados de performance calculados da aeronave.
 * @returns {Array<object>} - Um array de objetos com altitude, velocidade e RoC.
 */
export function generatePerformanceGraphData(performanceData) {
    const { combatWeight, totalEnginePower, propData, aero, superchargerData, finalServiceCeiling, typeData } = performanceData;
    const data = [];
    // Itera por altitudes em incrementos de 1000m até 15000m ou o teto de serviço
    for (let h = 0; h <= 15000; h += 1000) {
        let currentAlt = h;
        // Se a altitude atual for maior que o teto de serviço, usa o teto de serviço para o cálculo
        if (h > finalServiceCeiling && finalServiceCeiling > 0) {
            currentAlt = finalServiceCeiling;
        }

        const perfPoint = calculatePerformanceAtAltitude(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        let cappedSpeed = perfPoint.speed_kmh * aero.speed_mod;
        // Limita a velocidade à máxima permitida para o tipo de aeronave
        if (typeData.limits && cappedSpeed > typeData.limits.max_speed) {
            cappedSpeed = typeData.limits.max_speed;
        }

        data.push({
            altitude: currentAlt,
            // Velocidade e RoC são 0 acima do teto de serviço
            speed: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : cappedSpeed,
            roc: h > finalServiceCeiling && finalServiceCeiling > 0 ? 0 : calculateRateOfClimb(currentAlt, combatWeight, totalEnginePower, propData, aero, superchargerData)
        });

        // Se o teto de serviço foi atingido ou ultrapassado, adiciona um ponto extra no teto exato e para
        if (h >= finalServiceCeiling && finalServiceCeiling > 0) {
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

/**
 * Atualiza a área de status e exibe avisos ou mensagens de sucesso.
 * @param {object} performance - O objeto de performance da aeronave.
 */
export function updateStatusAndWarnings(performance) {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;

    statusContainer.innerHTML = ''; // Limpa mensagens anteriores
    let warnings = [];
    const { totalEnginePower, combatWeight, wingLoading, finalReliability, typeData, rawSpeedKmhAlt, rawRangeKm, finalSpeedKmhAlt, finalRangeKm } = performance;
    const powerToWeightRatio = (totalEnginePower * 745.7) / (combatWeight * gameData.constants.standard_gravity_ms2);

    // Adiciona avisos com base nas estatísticas
    if (powerToWeightRatio < 0.25 && typeData.name.includes('Caça')) warnings.push({ type: 'error', text: '🔥 Relação peso/potência crítica! Aeronave com performance muito baixa.' });
    else if (powerToWeightRatio < 0.35 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Relação peso/potência baixa. Aumente a potência ou reduza o peso.' });
    if (wingLoading > 200 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Carga alar alta, prejudicando a manobrabilidade em baixa velocidade.' });
    if (wingLoading > 250) warnings.push({ type: 'warning', text: '⚠️ Carga alar muito alta, resultando em altas velocidades de estol.' });
    if (finalReliability < 70) warnings.push({ type: 'error', text: '🔥 Confiabilidade baixa: Propenso a falhas críticas!' });
    if (typeData.limits) {
        if (rawSpeedKmhAlt < typeData.limits.min_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade abaixo do esperado para um ${typeData.name} (${Math.round(rawSpeedKmhAlt)} km/h).` });
        if (rawSpeedKmhAlt > typeData.limits.max_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade acima do esperado para um ${typeData.name}. (Calculado: ${Math.round(rawSpeedKmhAlt)} km/h, Limitado a: ${typeData.limits.max_speed} km/h)` });
        if (rawRangeKm / gameData.constants.range_balance_factor > typeData.limits.max_range) warnings.push({ type: 'warning', text: `⚠️ Alcance acima do esperado para um ${typeData.name}. (Calculado: ${Math.round(rawRangeKm / gameData.constants.range_balance_factor)} km, Limitado a: ${typeData.limits.max_range} km)` });
    }
    // Mensagem de sucesso se não houver avisos
    if (warnings.length === 0) {
        warnings.push({ type: 'ok', text: '✅ Design pronto para os céus! Clique no ícone de relatório para gerar a ficha.' });
    }
    // Exibe os avisos/mensagens
    warnings.forEach(warning => {
        const statusEl = document.createElement('div');
        statusEl.className = `p-3 rounded-lg text-center text-sm font-medium status-${warning.type}`; // Classes Tailwind
        statusEl.textContent = warning.text;
        statusContainer.appendChild(statusEl);
    });
}

/**
 * Cria e adiciona o menu de templates flutuante à página.
 * @param {TemplateManager} templateManagerInstance - Instância do TemplateManager.
 */
export function createTemplateMenu(templateManagerInstance) {
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fixed top-4 right-4 z-40';
    menuContainer.innerHTML = `
        <button id="template-menu-btn" class="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition-colors">
            <i class="fas fa-magic"></i>
        </button>
        <div id="template-menu" class="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg min-w-48 hidden">
            <div class="p-3 border-b border-gray-200">
                <h3 class="font-semibold text-gray-800">🎯 Templates</h3>
            </div>
            <div class="p-2">
                ${templateManagerInstance.getAllTemplates().map(t => `
                    <button data-template-id="${t.id}" class="w-full text-left p-2 hover:bg-gray-100 rounded text-sm template-apply-btn">
                        <div class="font-medium">${t.name}</div>
                        <div class="text-xs text-gray-600">${t.description}</div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(menuContainer);

    const btn = document.getElementById('template-menu-btn');
    const menu = document.getElementById('template-menu');
    if (btn && menu) {
        btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!menuContainer.contains(e.target)) menu.classList.add('hidden'); });

        // Adiciona listeners aos botões de template dentro do menu
        document.querySelectorAll('.template-apply-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.currentTarget.dataset.templateId;
                templateManagerInstance.applyTemplate(templateId);
                menu.classList.add('hidden'); // Esconde o menu após aplicar
            });
        });
    }
}

/**
 * Cria e adiciona os botões de desfazer/refazer flutuantes à página.
 * @param {StateManager} stateManagerInstance - Instância do StateManager.
 * @param {KeyboardManager} keyboardManagerInstance - Instância do KeyboardManager.
 */
export function createUndoRedoButtons(stateManagerInstance, keyboardManagerInstance) {
    const container = document.createElement('div');
    container.className = 'fixed bottom-4 left-4 flex flex-col gap-2 z-40';
    container.innerHTML = `
        <button id="undo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <i class="fas fa-undo"></i>
        </button>
        <button id="redo-btn" class="bg-gray-700 text-white w-10 h-10 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <i class="fas fa-redo"></i>
        </button>
    `;
    document.body.appendChild(container);

    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn && redoBtn) {
        undoBtn.onclick = () => keyboardManagerInstance.undo();
        redoBtn.onclick = () => keyboardManagerInstance.redo();
        stateManagerInstance.addListener((manager) => {
            undoBtn.disabled = !manager.canUndo();
            redoBtn.disabled = !manager.canRedo();
        });
    }
}
