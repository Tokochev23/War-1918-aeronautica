// assets/js/calculations.js

import { gameData, realWorldAircraft } from './data.js';
import { updateUI, updateProgress, updateStatusAndWarnings } from './ui.js';
import { stateManager, autoSaveManager } from './managers.js';

// --- FUNÇÕES DE CÁLCULO AERODINÂMICO E DE PERFORMANCE ---

/**
 * Calcula as propriedades do ar (densidade, temperatura, pressão) em uma dada altitude.
 * Utiliza o modelo da Atmosfera Padrão Internacional (ISA).
 * @param {number} altitude_m - Altitude em metros.
 * @returns {object} - Objeto contendo densidade (kg/m^3), temperatura (K) e pressão (Pa).
 */
export function getAirPropertiesAtAltitude(h_m) {
    const h = Math.max(0, h_m); // Altitude não pode ser negativa
    const T0 = gameData.constants.temp_sea_level_k;
    const P0 = gameData.constants.pressure_sea_level_pa;
    const L = gameData.constants.temp_lapse_rate_k_per_m;
    const R = gameData.constants.gas_constant_air_specific;
    const g = gameData.constants.standard_gravity_ms2;

    const T = Math.max(216.65, T0 - L * h); // Temperatura em Kelvin, limitada na tropopausa
    const P = P0 * Math.pow((T / T0), g / (L * R));
    const rho = P / (R * T);

    return { temperature: T, pressure: P, density: rho };
}

/**
 * Calcula a potência do motor em uma dada altitude, considerando os efeitos do supercharger e diminishing returns.
 * @param {number} basePower - Potência do motor ao nível do mar (HP).
 * @param {number} h - Altitude em metros.
 * @param {object} superchargerData - Dados do supercharger.
 * @returns {number} - Potência do motor ajustada em HP.
 */
export function calculateEnginePowerAtAltitude(basePower, h, superchargerData) {
    let currentPower = 0;
    if (!superchargerData || superchargerData.name === "Nenhum") {
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / gameData.constants.density_sea_level_kg_m3;
        currentPower = basePower * densityRatio;
    } else if (h <= superchargerData.rated_altitude_m) {
        currentPower = basePower;
    } else {
        const ratedAltProps = getAirPropertiesAtAltitude(superchargerData.rated_altitude_m);
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / ratedAltProps.density;
        currentPower = basePower * densityRatio;
    }

    // Aplica o diminishing return de potência acima de 1000 HP
    const threshold = 1000;
    if (currentPower > threshold) {
        const excess = currentPower - threshold;
        const penaltyFactor = 1 - Math.pow(excess / threshold, 2) * 0.25;
        currentPower = threshold + excess * Math.max(0, penaltyFactor);
    }
    
    return currentPower;
}

/**
 * Calcula a performance da aeronave em uma dada altitude (velocidade, arrasto, empuxo).
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice (eficiência).
 * @param {object} aero - Dados aerodinâmicos (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod, power_mod, typeKey).
 * @param {object} superchargerData - Dados do supercharger (rated_altitude_m).
 * @returns {object} - Objeto contendo velocidade (m/s, km/h), arrasto (N) e empuxo (N).
 */
export function calculatePerformanceAtAltitude(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7; // Converte HP para Watts

    let v_ms = 150; // Chute inicial para velocidade em m/s
    let best_v_ms = v_ms;
    let min_diff = Infinity;

    for (let current_v = 50; current_v <= 350; current_v += 1) {
        const CL = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * current_v * current_v * aero.wing_area_m2);
        const CDi = (CL * CL) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
        
        let speed_kmh_current = current_v * 3.6;
        let additional_drag_coefficient = 0;
        let drag_mod_final = aero.drag_mod;

        // Lógica de cálculo por tipo de aeronave
        switch(aero.typeKey) {
            case 'light_fighter':
            case 'heavy_fighter':
            case 'naval_fighter':
                if (speed_kmh_current > 500) {
                    const overRatio = (speed_kmh_current - 500) / 100;
                    additional_drag_coefficient += 0.005 * Math.pow(overRatio, 2);
                }
                break;
            case 'cas':
            case 'naval_cas':
                if (h > 3000) {
                    drag_mod_final *= 1.15; // Penalidade de arrasto em altitude
                }
                break;
            case 'tactical_bomber':
            case 'strategic_bomber':
            case 'naval_bomber':
                const dragFromWeight = (combatWeight / 15000); // Exemplo de penalidade de peso
                drag_mod_final *= (1 + dragFromWeight);
                break;
            case 'seaplane':
                drag_mod_final *= 1.15; // 15% mais arrasto
                break;
            case 'zeppelin':
                speed_kmh_current = 130;
                drag_mod_final *= 5.0; // Arrasto muito alto
                break;
        }

        // Penalidade de compressibilidade mais forte
        const speed_penalty_factor = Math.pow(Math.max(0, speed_kmh_current - 400) / 200, 2);
        additional_drag_coefficient += 0.012 * speed_penalty_factor;

        const CD = aero.cd_0 * drag_mod_final + CDi + additional_drag_coefficient;
        const current_drag_force = 0.5 * airProps.density * current_v * current_v * aero.wing_area_m2 * CD;
        const current_thrust_force = (powerWatts * propData.efficiency) / Math.max(current_v, 1);

        const diff = Math.abs(current_thrust_force - current_drag_force);

        if (diff < min_diff) {
            min_diff = diff;
            best_v_ms = current_v;
        }
    }
    let v_ms_final = best_v_ms;
    
    // Recalcular com a melhor velocidade para os valores finais
    const CL_final = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * v_ms_final * v_ms_final * aero.wing_area_m2);
    const CDi_final = (CL_final * CL_final) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    let speed_kmh_final = v_ms_final * 3.6;
    const speed_penalty_factor_final = Math.pow(Math.max(0, speed_kmh_final - 400) / 200, 2);
    const additional_drag_coefficient_final = 0.012 * speed_penalty_factor_final;

    const CD_final = aero.cd_0 * aero.drag_mod + CDi_final + additional_drag_coefficient_final;
    const dragForce_final = 0.5 * airProps.density * v_ms_final * v_ms_final * aero.wing_area_m2 * CD_final;
    const thrust_final = (powerWatts * propData.efficiency) / Math.max(v_ms_final, 30);
    
    // Soft Cap de Velocidade
    const maxSpd = aero.limits?.max_speed;
    if (maxSpd && speed_kmh_final > maxSpd * 0.9) {
        const overRatio = speed_kmh_final / maxSpd - 0.9;
        speed_kmh_final *= 1 - (overRatio * 0.5);
    }
    
    return { speed_kmh: speed_kmh_final, roc_ms: 0, v_ms: v_ms_final, drag_newtons: dragForce_final, thrust_newtons: thrust_final };
}

/**
 * Calcula a taxa de subida (RoC) em uma dada altitude.
 * @param {number} h - Altitude em metros.
 * @param {number} combatWeight - Peso total da aeronave em kg.
 * @param {number} totalEnginePower - Potência total do motor em HP.
 * @param {object} propData - Dados da hélice (eficiência).
 * @param {object} aero - Dados aerodinâmicos (wing_area_m2, cd_0, aspect_ratio, oswald_efficiency, drag_mod, power_mod).
 * @param {object} superchargerData - Dados do supercharger (rated_altitude_m).
 * @returns {number} - Taxa de subida em m/s.
 */
export function calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    const climbSpeed_ms = 80; // Velocidade de subida ótima, pode ser refinada

    const thrust = (powerWatts * propData.efficiency) / Math.max(climbSpeed_ms, 1);

    const CL_climb = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2);
    const CDi_climb = (CL_climb * CL_climb) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);

    // Aplicar a mesma penalidade de arrasto dependente da velocidade para a subida
    const speed_kmh_climb = climbSpeed_ms * 3.6;
    const speed_penalty_factor_climb = Math.pow(Math.max(0, speed_kmh_climb - 400) / 200, 2);
    const additional_drag_coefficient_climb = 0.012 * speed_penalty_factor_climb; // Alterado para 0.012

    const CD_climb = aero.cd_0 * aero.drag_mod + CDi_climb + additional_drag_coefficient_climb;
    const dragForce_climb = 0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2 * CD_climb;

    const excessPower = (thrust * climbSpeed_ms) - (dragForce_climb * climbSpeed_ms);
    const rateOfClimb = excessPower / (combatWeight * gameData.constants.standard_gravity_ms2);

    return Math.max(0, rateOfClimb);
}

/**
 * Função auxiliar para encontrar um item de componente em diferentes categorias em gameData.components.
 * Isso é útil porque os IDs dos checkboxes podem não mapear diretamente para suas chaves de categoria de nível superior.
 * @param {string} id - O ID do componente a ser encontrado.
 * @returns {object|null} - O objeto do componente se encontrado, caso contrário null.
 */
export function findItemAcrossCategories(id) {
    for (const categoryKey in gameData.components) {
        if (gameData.components[categoryKey][id]) {
            return gameData.components[categoryKey][id];
        }
    }
    return null;
}

/**
 * Coleta os inputs do formulário, calcula todas as estatísticas da aeronave
 * e atualiza a interface do usuário.
 * @returns {object|null} - Objeto com todos os dados de performance calculados, ou null se houver validação falha.
 */
export function updateCalculations() {
    // --- COLETAR INPUTS ---
    const inputs = {
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
            // Mapeia os IDs dos checkboxes marcados por seção
            wing_features: Array.from(document.querySelectorAll('#wing_features_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            engine_enhancements: Array.from(document.querySelectorAll('#engine_enhancements_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            protection: Array.from(document.querySelectorAll('#protection_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            cockpit_comfort: Array.from(document.querySelectorAll('#cockpit_comfort_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            advanced_avionics: Array.from(document.querySelectorAll('#advanced_avionics_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            equipment: Array.from(document.querySelectorAll('#equipment_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
            maintainability_features: Array.from(document.querySelectorAll('#maintainability_features_checkboxes input[type="checkbox"]:checked')).map(cb => cb.id),
        },
        armaments: {
            // Mapeia os armamentos ofensivos e suas quantidades
            offensive: Array.from(document.querySelectorAll('#offensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 })),
            // Mapeia os armamentos defensivos e suas quantidades
            defensive: Array.from(document.querySelectorAll('#defensive_armaments input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 }))
        }
    };

    // --- VALIDAÇÃO E CONFIGURAÇÃO DE DADOS ---
    const typeData = gameData.components.aircraft_types[inputs.aircraftType];
    const engineData = gameData.components.engines[inputs.engineType];
    const structureData = gameData.components.structure_materials[inputs.structureType];
    const wingData = gameData.components.wing_types[inputs.wingType];
    const landingGearData = gameData.components.landing_gear_types[inputs.landingGearType];
    const propData = gameData.components.propellers[inputs.propellerType];
    const coolingData = gameData.components.cooling_systems[inputs.coolingSystem];
    const fuelFeedData = gameData.components.fuel_feeds[inputs.fuelFeed];
    const superchargerData = gameData.components.superchargers[inputs.supercharger];
    const doctrineData = gameData.doctrines[inputs.selectedAirDoctrine];

    // Atualiza as descrições na página principal
    document.getElementById('aircraft_type_note').textContent = typeData ? typeData.description : '';
    document.getElementById('structure_note').textContent = structureData ? structureData.description : '';
    document.getElementById('wing_type_note').textContent = wingData ? wingData.description : '';
    document.getElementById('landing_gear_type_note').textContent = landingGearData ? landingGearData.description : '';
    document.getElementById('engine_type_note').textContent = engineData ? engineData.description : '';
    document.getElementById('propeller_type_note').textContent = propData ? propData.description : '';
    document.getElementById('cooling_system_note').textContent = coolingData ? coolingData.description : '';
    document.getElementById('fuel_feed_note').textContent = fuelFeedData ? fuelFeedData.description : '';
    document.getElementById('supercharger_note').textContent = superchargerData ? superchargerData.description : "Selecione uma doutrina para ver seus efeitos.";

    // Validação inicial para componentes essenciais
    if (!typeData || !engineData || inputs.enginePower <= 0 || !propData || !superchargerData) {
        updateUI(null); // Limpa a UI se dados essenciais estiverem faltando
        updateProgress();
        return null;
    }

    // --- CALCULAR ESTATÍSTICAS BASE E MODIFICADORES ---
    let baseUnitCost = typeData.cost;
    let baseMetalCost = typeData.metal_cost;
    let totalEmptyWeight = typeData.weight;
    let reliabilityModifier = typeData.reliability_base; // Começa com a confiabilidade base do tipo de aeronave
    let aero = {
        wing_area_m2: typeData.wing_area_m2,
        cl_max: typeData.cl_max,
        cd_0: typeData.cd_0,
        aspect_ratio: typeData.aspect_ratio,
        oswald_efficiency: typeData.oswald_efficiency,
        maneuverability_mod: typeData.maneuverability_base,
        drag_mod: 1.0, power_mod: 1.0, range_mod: 1.0, ceiling_mod: 1.0, speed_mod: 1.0,
        typeKey: inputs.aircraftType // Adicionado para uso na lógica de tipo
    };

    // Doutrina
    if (doctrineData) {
        baseUnitCost *= (doctrineData.cost_modifier || 1.0);
        reliabilityModifier *= (doctrineData.reliability_modifier || 1.0);
        totalEmptyWeight *= (doctrineData.weight_penalty || 1.0);
        if(doctrineData.performance_bonus) {
            aero.speed_mod *= doctrineData.performance_bonus.speed || 1.0;
            aero.maneuverability_mod *= doctrineData.performance_bonus.maneuverability || 1.0;
            aero.range_mod *= doctrineData.performance_bonus.range || 1.0;
            aero.ceiling_mod *= doctrineData.performance_bonus.service_ceiling || 1.0;
        }
    }

    // Estrutura, Asas, Trem de Pouso
    baseUnitCost *= structureData.cost_mod;
    totalEmptyWeight *= structureData.weight_mod;
    reliabilityModifier *= structureData.reliability_mod;

    baseUnitCost *= wingData.cost_mod;
    totalEmptyWeight *= wingData.weight_mod;
    aero.drag_mod *= wingData.drag_mod;
    aero.cl_max *= wingData.cl_max_mod;
    aero.cd_0 *= wingData.cd_0_mod;
    aero.aspect_ratio *= wingData.aspect_ratio_mod;
    aero.maneuverability_mod *= wingData.maneuverability_mod || 1.0;
    reliabilityModifier *= wingData.reliability_mod;

    baseUnitCost += landingGearData.cost;
    totalEmptyWeight += landingGearData.weight;
    baseMetalCost += landingGearData.metal_cost;
    aero.drag_mod *= landingGearData.drag_mod;
    reliabilityModifier *= landingGearData.reliability_mod;

    // --- NOVO: Aplicar área frontal do motor ao arrasto ---
    aero.drag_mod *= engineData.frontal_area_mod || 1.0;

    // Motores e Propulsão
    let totalEnginePower = 0;
    const enginePowerNote = document.getElementById('engine_power_note');
    if (enginePowerNote) enginePowerNote.textContent = "";

    if (inputs.enginePower < engineData.min_power || inputs.enginePower > engineData.max_power) {
        if (enginePowerNote) enginePowerNote.textContent = `Potência para ${engineData.name} deve ser entre ${engineData.min_power} e ${engineData.max_power} HP.`;
        updateUI(null); // Limpa a UI se a potência do motor for inválida
        updateProgress();
        return null;
    } else {
        totalEnginePower = inputs.enginePower * inputs.numEngines;
        baseUnitCost += (engineData.cost + (inputs.enginePower * 20)) * inputs.numEngines;
        baseMetalCost += engineData.metal_cost * inputs.numEngines;
        totalEmptyWeight += engineData.weight * inputs.numEngines;
        reliabilityModifier *= Math.pow(engineData.reliability, inputs.numEngines);
    }

    baseUnitCost += propData.cost * inputs.numEngines;
    totalEmptyWeight += propData.weight * inputs.numEngines;
    baseMetalCost += propData.metal_cost * inputs.numEngines;
    reliabilityModifier *= Math.pow(propData.reliability_mod, inputs.numEngines);

    // Outros sistemas por motor
    [coolingData, fuelFeedData, superchargerData].forEach(data => {
        baseUnitCost += (data.cost || 0) * inputs.numEngines;
        totalEmptyWeight += (data.weight || 0) * inputs.numEngines;
        reliabilityModifier *= Math.pow(data.reliability_mod || 1.0, inputs.numEngines);
        aero.drag_mod *= data.drag_mod || 1.0;
        aero.power_mod *= data.performance_mod || data.power_mod || 1.0;
    });

    // Processa todos os componentes baseados em checkboxes
    for (const categoryKey in inputs.checkboxes) {
        inputs.checkboxes[categoryKey].forEach(id => {
            // Usa findItemAcrossCategories para obter corretamente os dados de gameData.components
            const item = findItemAcrossCategories(id);
            if(item) {
                baseUnitCost += item.cost || 0;
                totalEmptyWeight += item.weight || 0;
                baseMetalCost = (baseMetalCost || 0) + (item.metal_cost || 0);
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

    // Armamentos
    let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
    let offensiveArmamentTexts = [];
    inputs.armaments.offensive.forEach(arm => {
        if (arm.qty > 0) {
            const armData = gameData.components.armaments[arm.id];
            if (armData) {
                armamentCost += armData.cost * arm.qty;
                armamentWeight += armData.weight * arm.qty;
                armamentMetalCost += armData.metal_cost * arm.qty;
                offensiveArmamentTexts.push(`${arm.qty}x ${armData.name}`);
            }
        }
    });
    baseUnitCost += armamentCost;
    baseMetalCost += armamentMetalCost;

    // Armamentos Defensivos
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
                if (defArmData) {
                    baseUnitCost += defArmData.cost * arm.qty;
                    totalEmptyWeight += defArmData.weight * arm.qty;
                    baseMetalCost += defArmData.metal_cost * arm.qty;
                    defensiveArmamentTexts.push(`${arm.qty}x ${defArmData.name.replace(' (Defensiva)', '')}`);
                }
            }
        });
    }

    // --- PESO FINAL E CUSTO ---
    const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000) * Math.sqrt(inputs.numEngines);
    const fuelWeight = fuelCapacity * gameData.constants.fuel_weight_per_liter;
    const combatWeight = totalEmptyWeight + armamentWeight + (inputs.numCrewmen * gameData.constants.crew_weight_kg) + fuelWeight;

    // Slider de Qualidade/Produção
    const qualityBias = (100 - inputs.productionQualitySliderValue) / 100;
    const productionBias = inputs.productionQualitySliderValue / 100;

    // Custo aumenta com a qualidade (qualityBias) e diminui com a produção (productionBias)
    baseUnitCost *= (1 + (qualityBias * 0.20) - (productionBias * 0.20));

    // Aplica o bônus de confiabilidade de 20% UMA VEZ no final
    reliabilityModifier *= 1.20; // Aumenta a confiabilidade total em 20%
    reliabilityModifier *= (1 + (qualityBias * 0.15) - (productionBias * 0.15)); // Aplica o bias do slider

    // Redução de custo do país
    const countryData = gameData.countries[inputs.selectedCountryName];
    let countryCostReduction = 0;
    if (countryData) {
        const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
        const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        countryCostReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
    }
    const finalUnitCost = baseUnitCost * (1 - countryCostReduction);

    // --- CÁLCULOS DE PERFORMANCE ---
    const perfSL = calculatePerformanceAtAltitude(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
    const perfAlt = calculatePerformanceAtAltitude(superchargerData.rated_altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData);

    // Valores calculados brutos
    let rawSpeedKmhSL = perfSL.speed_kmh * aero.speed_mod;
    let rawSpeedKmhAlt = perfAlt.speed_kmh * aero.speed_mod;
    const bsfc_kg_per_watt_s = (gameData.components.engines[inputs.engineType].bsfc_g_per_kwh / 1000) / 3.6e6;
    const optimal_CL = Math.sqrt(aero.cd_0 * Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    const optimal_CD = aero.cd_0 * 2; // Isso pode ser simplificado, geralmente CD_induced = CD_0 para max L/D
    const L_D_ratio = optimal_CD > 0 ? optimal_CL / optimal_CD : 10; // Evita divisão por zero
    const range_m = (propData.efficiency / (gameData.constants.standard_gravity_ms2 * bsfc_kg_per_watt_s)) * L_D_ratio * Math.log(combatWeight / (combatWeight - fuelWeight));
    let rawRangeKm = (range_m / 1000) * aero.range_mod;

    const rate_of_climb_ms = calculateRateOfClimb(0, combatWeight, totalEnginePower, propData, aero, superchargerData); // Calcula RoC ao nível do mar

    // --- APLICAR LIMITES DE PERFORMANCE (CAPPING) ---
    let finalSpeedKmhSL = rawSpeedKmhSL;
    let finalSpeedKmhAlt = rawSpeedKmhAlt;
    // Aplica o fator de balanço ao alcance
    let finalRangeKm = rawRangeKm / gameData.constants.range_balance_factor;

    if (typeData.limits) {
        finalSpeedKmhAlt = Math.min(finalSpeedKmhAlt, typeData.limits.max_speed);
        finalSpeedKmhSL = Math.min(finalSpeedKmhSL, typeData.limits.max_speed); // Também limita a velocidade SL
        finalRangeKm = Math.min(finalRangeKm, typeData.limits.max_range);
    }

    // Teto de Serviço
    let serviceCeiling = 0;
    for (let h = 0; h <= 15000; h += 250) {
        const currentROC = calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData);
        if (currentROC < gameData.constants.min_roc_for_ceiling) {
            serviceCeiling = h;
            break;
        }
        if (h === 15000) serviceCeiling = h; // Se atingir o limite, define o teto como o limite
    }
    let finalServiceCeiling = serviceCeiling * aero.ceiling_mod;
    // Limita o teto de serviço com base nos sistemas de cabine
    if (!inputs.checkboxes.cockpit_comfort.includes('pressurized_cabin') && finalServiceCeiling > 10000) finalServiceCeiling = 10000;
    if (!inputs.checkboxes.cockpit_comfort.includes('oxygen_system') && finalServiceCeiling > 5000) finalServiceCeiling = 5000;

    // Manobrabilidade
    const wingLoading = combatWeight / aero.wing_area_m2;
    const v_turn = perfAlt.v_ms * 0.8; // Usa velocidade na altitude ótima para cálculos de curva
    const max_load_factor = Math.min(gameData.constants.turn_g_force, (0.5 * getAirPropertiesAtAltitude(2000).density * v_turn * v_turn * aero.cl_max) / wingLoading);
    const turn_radius = (v_turn * v_turn) / (gameData.constants.standard_gravity_ms2 * Math.sqrt(Math.max(0.01, max_load_factor * max_load_factor - 1)));
    let turn_time_s = (2 * Math.PI * turn_radius) / v_turn;
    turn_time_s /= aero.maneuverability_mod;
    turn_time_s = Math.max(12, Math.min(60, turn_time_s)); // Limita o tempo de curva entre 12 e 60 segundos

    const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));

    // --- ATUALIZAÇÃO DA UI ---
    const calculatedPerformance = {
        inputs, adjustedUnitCost: finalUnitCost, baseMetalCost, combatWeight, totalEnginePower,
        finalSpeedKmhSL, finalSpeedKmhAlt, rate_of_climb_ms, finalServiceCeiling, finalRangeKm, turn_time_s,
        finalReliability, offensiveArmamentTexts, defensiveArmamentTexts,
        countryData, wingLoading, typeData, rawSpeedKmhAlt, rawRangeKm, superchargerData, aero, propData,
        countryCostReduction: countryCostReduction // Inclui a redução de custo do país aqui
    };
    updateUI(calculatedPerformance);

    // Salva o estado para undo/redo
    stateManager.saveState(inputs); // Salva os inputs brutos para restauração precisa

    return calculatedPerformance;
}
