// assets/js/main.js

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
const AERONAVES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=565684512&single=true&output=csv';

// --- DADOS DO JOGO - AERONAVES (COM PARÂMETROS AERODINÂMICOS) ---
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
            light_fighter: { name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 18, cl_max: 1.6, cd_0: 0.022, aspect_ratio: 6.0, oswald_efficiency: 0.8, description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado." },
            heavy_fighter: { name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, cl_max: 1.5, cd_0: 0.028, aspect_ratio: 6.5, oswald_efficiency: 0.78, description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves." },
            cas: { name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, cl_max: 1.7, cd_0: 0.035, aspect_ratio: 5.8, oswald_efficiency: 0.75, description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado." },
            tactical_bomber: { name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, cl_max: 1.4, cd_0: 0.030, aspect_ratio: 7.0, oswald_efficiency: 0.82, description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada." },
            strategic_bomber: { name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, cl_max: 1.5, cd_0: 0.028, aspect_ratio: 8.5, oswald_efficiency: 0.85, description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo." },
            zeppelin: { name: "Zeppelin", cost: 500000, weight: 50000, metal_cost: 15000, crew: 20, wing_area_m2: 500, cl_max: 0.8, cd_0: 0.020, aspect_ratio: 1.0, oswald_efficiency: 0.7, description: "Dirigível gigante para bombardeio ou reconhecimento. Lento e vulnerável, mas com alcance e carga imensos." },
            naval_fighter: { name: "Caça Naval", cost: 60000, weight: 2200, metal_cost: 2800, crew: 1, wing_area_m2: 22, cl_max: 1.65, cd_0: 0.026, aspect_ratio: 5.5, oswald_efficiency: 0.78, description: "Caça adaptado para operações em porta-aviões, com estrutura reforçada e geralmente asas dobráveis." },
            naval_cas: { name: "CAS Naval", cost: 90000, weight: 4000, metal_cost: 4500, crew: 2, wing_area_m2: 35, cl_max: 1.75, cd_0: 0.038, aspect_ratio: 5.2, oswald_efficiency: 0.72, description: "Aeronave de ataque naval, incluindo bombardeiros de mergulho e torpedeiros." },
            naval_bomber: { name: "Bombardeiro Naval", cost: 150000, weight: 6000, metal_cost: 7000, crew: 4, wing_area_m2: 60, cl_max: 1.5, cd_0: 0.032, aspect_ratio: 7.5, oswald_efficiency: 0.8, description: "Bombardeiro médio/pesado adaptado para operações navais, geralmente baseado em terra." },
            naval_recon: { name: "Reconhecimento Naval", cost: 45000, weight: 2000, metal_cost: 2000, crew: 2, wing_area_m2: 25, cl_max: 1.4, cd_0: 0.024, aspect_ratio: 8.0, oswald_efficiency: 0.85, description: "Aeronave de longo alcance para patrulha marítima e reconhecimento." },
            transport: { name: "Transporte", cost: 100000, weight: 8000, metal_cost: 5000, crew: 4, wing_area_m2: 80, cl_max: 1.8, cd_0: 0.040, aspect_ratio: 7.0, oswald_efficiency: 0.75, description: "Projetado para transportar tropas ou carga. Lento e vulnerável, com pouca ou nenhuma capacidade de combate." },
            seaplane: { name: "Hidroavião", cost: 55000, weight: 2500, metal_cost: 2500, crew: 3, wing_area_m2: 30, cl_max: 1.5, cd_0: 0.045, aspect_ratio: 6.0, oswald_efficiency: 0.7, description: "Capaz de pousar e decolar da água. Usado para reconhecimento, patrulha e resgate." },
        },
        structure_materials: {
            wood_fabric: { name: "Madeira e Tecido", cost_mod: 0.7, weight_mod: 0.8, reliability_mod: 0.9, armor_mod: 0.7, description: "Leve e barato, mas frágil e vulnerável a fogo. Comum em designs mais antigos ou leves." },
            wood_metal: { name: "Madeira e Metal", cost_mod: 1.0, weight_mod: 1.0, reliability_mod: 1.0, armor_mod: 1.0, description: "Estrutura de metal com superfícies de madeira/tecido. Bom equilíbrio entre custo e durabilidade." },
            all_metal: { name: "Metal Completo", cost_mod: 1.4, weight_mod: 1.2, reliability_mod: 1.1, armor_mod: 1.2, description: "Estrutura totalmente metálica (sem estresse de pele). Robusto, mas mais pesado que designs posteriores." },
            duralumin: { name: "Duralumínio (Monocoque)", cost_mod: 1.6, weight_mod: 1.05, reliability_mod: 1.15, armor_mod: 1.3, description: "Construção de ponta com pele de alumínio tensionada. Leve, forte e aerodinâmico, mas caro e complexo de produzir." },
        },
        engines: {
            radial_7: { name: "Motor Radial 7 cilindros", cost: 15000, weight: 350, metal_cost: 1200, min_power: 200, max_power: 500, reliability: 1.1, frontal_area_mod: 1.1, bsfc_g_per_kwh: 320, description: "Simples e confiável, mas com grande arrasto. Bom para aeronaves de treinamento ou leves." },
            radial_11: { name: "Motor Radial 11 cilindros", cost: 25000, weight: 500, metal_cost: 2000, min_power: 400, max_power: 1000, reliability: 1.05, frontal_area_mod: 1.2, bsfc_g_per_kwh: 310, description: "Potência decente com boa confiabilidade. Um motor comum para caças e bombardeiros leves." },
            radial_16: { name: "Motor Radial 16 cilindros", cost: 45000, weight: 800, metal_cost: 3500, min_power: 800, max_power: 1600, reliability: 1.0, frontal_area_mod: 1.3, bsfc_g_per_kwh: 300, description: "Motor de dupla estrela potente, para caças pesados e bombardeiros médios." },
            radial_18: { name: "Motor Radial 18 cilindros", cost: 60000, weight: 1100, metal_cost: 4500, min_power: 1200, max_power: 2200, reliability: 0.95, frontal_area_mod: 1.4, bsfc_g_per_kwh: 290, description: "Extremamente potente, mas pesado e complexo. Usado nos maiores bombardeiros e caças de final de período." },
            rotary_9: { name: "Motor Rotativo 9 cilindros", cost: 10000, weight: 150, metal_cost: 800, min_power: 80, max_power: 200, reliability: 0.85, frontal_area_mod: 1.0, bsfc_g_per_kwh: 350, description: "Design da Grande Guerra. Leve, mas o efeito giroscópico torna a pilotagem difícil. Obsoleto." },
            v8: { name: "Motor V8", cost: 20000, weight: 400, metal_cost: 1800, min_power: 300, max_power: 700, reliability: 1.0, frontal_area_mod: 0.85, bsfc_g_per_kwh: 300, description: "Motor em V refrigerado a líquido. Menor arrasto que um radial, mas sistema de refrigeração mais vulnerável." },
            v12: { name: "Motor V12", cost: 35000, weight: 600, metal_cost: 2500, min_power: 600, max_power: 1500, reliability: 0.95, frontal_area_mod: 0.8, bsfc_g_per_kwh: 290, description: "O motor de caça de alta performance por excelência. Perfil fino, alta potência, mas complexo." },
            v16: { name: "Motor V16", cost: 55000, weight: 850, metal_cost: 4000, min_power: 1000, max_power: 2000, reliability: 0.9, frontal_area_mod: 0.9, bsfc_g_per_kwh: 285, description: "Experimental e potente. Pesado e propenso a problemas de confiabilidade." },
            v24: { name: "Motor V24", cost: 80000, weight: 1200, metal_cost: 6000, min_power: 1800, max_power: 3000, reliability: 0.8, frontal_area_mod: 1.0, bsfc_g_per_kwh: 280, description: "Monstro de potência, essencialmente dois V12 juntos. Extremamente pesado, caro e não confiável." },
        },
        propellers: {
            wood_2: { name: "Madeira 2 pás", cost: 1000, weight: 30, metal_cost: 20, efficiency: 0.75, description: "Simples e leve. Ineficiente em altas velocidades e altitudes." },
            wood_3: { name: "Madeira 3 pás", cost: 1800, weight: 45, metal_cost: 30, efficiency: 0.80, description: "Melhor tração para decolagem e subida que a de 2 pás." },
            metal_2: { name: "Metal 2 pás", cost: 2500, weight: 60, metal_cost: 200, efficiency: 0.82, description: "Mais durável que a de madeira, permite perfis de pá mais finos e eficientes." },
            metal_3: { name: "Metal 3 pás", cost: 4000, weight: 90, metal_cost: 300, efficiency: 0.88, description: "Bom desempenho geral, padrão para muitos caças de meio de período." },
            adjustable: { name: "Passo Variável/Vel. Constante", cost: 15000, weight: 120, metal_cost: 500, efficiency: 0.95, description: "Permite ao piloto otimizar a performance em diferentes regimes de voo. Complexo e caro." }
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
            none: { name: "Nenhum", cost: 0, weight: 0, rated_altitude_m: 0, description: "Motor naturalmente aspirado. Perde potência rapidamente com a altitude." },
            single_stage: { name: "Mecânico - 1 Estágio", cost: 8000, weight: 50, rated_altitude_m: 4000, description: "Melhora a performance em altitudes médias. Padrão para a maioria dos caças." },
            two_stage: { name: "Mecânico - 2 Estágios", cost: 20000, weight: 90, rated_altitude_m: 7500, description: "Excelente performance em altas altitudes. Complexo e rouba mais potência do motor." },
            turbo: { name: "Turboalimentador", cost: 30000, weight: 150, rated_altitude_m: 9000, description: "Usa os gases de escape para performance superior em altitudes muito elevadas. Pesado, caro e gera muito calor." }
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
        protection: {
            pilot_armor: { name: "Blindagem do Piloto", cost: 15000, weight: 250, metal_cost: 400 },
            engine_armor: { name: "Blindagem do Motor", cost: 15000, weight: 250, metal_cost: 400 },
            tank_armor: { name: "Blindagem dos Tanques", cost: 18000, weight: 180, metal_cost: 300 },
            self_sealing_tanks: { name: "Tanques Auto-Selantes", cost: 22500, weight: 45, metal_cost: 100, reliability_mod: 1.15 },
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10 },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500 },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1 },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200 },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100 },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150 },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98 },
            retractable_gear: { name: "Trem de Pouso Retrátil", cost: 22500, weight: 150, metal_cost: 300, drag_mod: 0.85, reliability_mod: 0.97 },
            pressurized_cabin: { name: "Cabine Pressurizada", cost: 25000, weight: 60, metal_cost: 120, ceiling_mod: 1.2 },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100 },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20 },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200 },
            extra_fuel_tanks: { name: "Tanques de Combustíveis Extras (Fixos)", cost: 8000, weight: 40, metal_cost: 150, range_mod: 1.4, maneuverability_mod: 0.9, description: "Aumenta o alcance com tanques internos maiores, mas o peso extra permanente prejudica a agilidade." },
            drop_tanks: { name: "Tanques de Combustíveis Descartáveis", cost: 12000, weight: 20, metal_cost: 200, range_mod: 1.8, description: "Aumenta drasticamente o alcance. Os tanques são descartados antes do combate, não afetando a performance. Impede o uso de bombas ou foguetes." },
            advanced_control_surfaces: { name: "Superfícies de Controle Avançadas", cost: 40000, weight: 50, metal_cost: 300, maneuverability_mod: 1.25, reliability_mod: 0.98, description: "Ailerons e profundores otimizados que permitem taxas de rolagem e curvas mais rápidas, ao custo de estabilidade e maior complexidade." },
        }
    },
    constants: {
        standard_gravity_ms2: 9.80665,
        gas_constant_air_specific: 287.0528,
        temp_lapse_rate_k_per_m: 0.0065,
        temp_sea_level_k: 288.15,
        pressure_sea_level_pa: 101325,
        density_sea_level_kg_m3: 1.225,
        turn_g_force: 4.5, // Fator G estrutural médio para caças
        base_fuel_capacity_liters: 380, // Reduzido para balancear o alcance
        country_cost_reduction_factor: 0.25,
        urbanization_cost_reduction_factor: 0.20,
        max_tech_civil_level: 150,
        max_urbanization_level: 80,
    }
};

// --- DADOS DE AERONAVES REAIS ---
const realWorldAircraft = [
    { id: 'bf109e3', name: 'Messerschmitt Bf 109 E-3', image_url: 'https://lh3.googleusercontent.com/d/1nvIkjIeZtmgpJXAZajyeqDBicQlAWNFj' },
    { id: 'bf109g6', name: 'Messerschmitt Bf 109 G-6', image_url: 'https://lh3.googleusercontent.com/d/1cbSlGQcEtXrD1hIK_FBX7kUB9N6cVTef' },
    { id: 'd520', name: 'Dewoitine D.520', image_url: 'https://lh3.googleusercontent.com/d/1xVChn5gbXSzdQ_3-VFvZZ48yY3iPeGzr' },
    { id: 'fw190a8', name: 'Focke-Wulf Fw 190 A-8', image_url: 'https://lh3.googleusercontent.com/d/14Il4G9wpTsIrmin2PNgNj_RezZEEj1Ps' },
    { id: 'hurricane', name: 'Hawker Hurricane Mk.IIC', image_url: 'https://lh3.googleusercontent.com/d/16YD7iFd_b0nTt-bky4f7aCBqHqEXTzuS' },
    { id: 'i16', name: 'Polikarpov I-16', image_url: 'https://lh3.googleusercontent.com/d/1VAClb1ppQoWfu7AeWfqJY4I985STUnyo' },
    { id: 'iar80', name: 'IAR 80', image_url: 'https://lh3.googleusercontent.com/d/19-pueHMabuaWUFDqeUQe9AJdRKYFUNmY' },
    { id: 'ki43', name: 'Nakajima Ki-43 Hayabusa', image_url: 'https://lh3.googleusercontent.com/d/1y2YdNFQcUxST_-tBWYeTRClfi1ad7GP4' },
    { id: 'ki61', name: 'Kawasaki Ki-61 Hien', image_url: 'https://lh3.googleusercontent.com/d/1C4iuS2GHgy9TX5r5jgrWbtkJazbyMMas' },
    { id: 'lagg3', name: 'Lavochkin LaGG-3', image_url: 'https://lh3.googleusercontent.com/d/1NLhY87GwVDJ0bWI66u1xqGIM5OicyoVQ' },
    { id: 'p40', name: 'Curtiss P-40 Warhawk', image_url: 'https://lh3.googleusercontent.com/d/1cQpmeh-eR7YQLZFw1qNMHBxp76UTbcFF' },
    { id: 'p47', name: 'Republic P-47 Thunderbolt', image_url: 'https://lh3.googleusercontent.com/d/1b4NNln8WHlsjElg20B8lxbnUeXzcOXPY' },
    { id: 'p51d', name: 'North American P-51D Mustang', image_url: 'https://lh3.googleusercontent.com/d/1wa1nl1SoQX_5XG5ea-1RQGpTbFuY5w-0' },
    { id: 'spitfire', name: 'Supermarine Spitfire Mk I', image_url: 'https://lh3.googleusercontent.com/d/15J2DmLBCLXzWeo8cOsstqwpYECKIrk3U' },
    { id: 'yak3', name: 'Yakovlev Yak-3', image_url: 'https://lh3.googleusercontent.com/d/1NbMiOees0x2LSuzzeqo0lYUa4Erg_gYB' },
    { id: 'other', name: 'Yakovlev Yak-3 (alt)', image_url: 'https://lh3.googleusercontent.com/d/1hcPeyJkleEbn0oqDgKGykVWl47n9NDdF' }
];

// --- FUNÇÕES AUXILIARES DE FÍSICA ---

function getAirPropertiesAtAltitude(h) {
    const T0 = gameData.constants.temp_sea_level_k;
    const P0 = gameData.constants.pressure_sea_level_pa;
    const L = gameData.constants.temp_lapse_rate_k_per_m;
    const R = gameData.constants.gas_constant_air_specific;
    const g = gameData.constants.standard_gravity_ms2;

    const T = Math.max(216.65, T0 - L * h); // Evita temperaturas abaixo da tropopausa
    const P = P0 * Math.pow((T / T0), g / (L * R));
    const rho = P / (R * T);
    
    return { temperature: T, pressure: P, density: rho };
}

function calculateEnginePowerAtAltitude(basePower, h, superchargerData) {
    if (h <= superchargerData.rated_altitude_m) {
        return basePower;
    } else {
        const ratedAltProps = getAirPropertiesAtAltitude(superchargerData.rated_altitude_m);
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / ratedAltProps.density;
        return basePower * densityRatio;
    }
}

// --- FUNÇÕES DE CARREGAMENTO DE DADOS ---

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

        const headers = robustSplit(lines[0]);
        
        return lines.slice(1).map(line => {
            const values = robustSplit(line);
            let row = {};
            headers.forEach((header, i) => { row[headers[i]] = values[i] || ''; });
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
        updateCalculations();

    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
        countryDropdown.disabled = false;
        updateCalculations();
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

// --- FUNÇÃO PRINCIPAL DE CÁLCULO ---
function updateCalculations() {
    // --- Entradas do Usuário ---
    const aircraftName = document.getElementById('aircraft_name').value || 'Aeronave Sem Nome';
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const selectedCountryName = document.getElementById('country_doctrine').value;
    const selectedAirDoctrine = document.getElementById('air_doctrine').value;
    const aircraftType = document.getElementById('aircraft_type').value;
    const structureType = document.getElementById('structure_type').value;
    const engineType = document.getElementById('engine_type').value;
    const enginePower = parseInt(document.getElementById('engine_power').value) || 0;
    const propellerType = document.getElementById('propeller_type').value;
    const coolingSystem = document.getElementById('cooling_system').value;
    const fuelFeed = document.getElementById('fuel_feed').value;
    const supercharger = document.getElementById('supercharger').value;
    const numCrewmen = parseInt(document.getElementById('num_crewmen').value) || 1;
    const productionQualitySliderValue = parseInt(document.getElementById('production_quality_slider').value) || 50;

    // --- Variáveis de Cálculo ---
    let baseUnitCost = 0, baseMetalCost = 0, totalEmptyWeight = 0;
    let costModifier = 1.0, weightModifier = 1.0, reliabilityModifier = 1.0;
    let performanceBonuses = { speed: 1.0, maneuverability: 1.0, rate_of_climb: 1.0, range: 1.0, service_ceiling: 1.0 };
    
    // --- Processamento Imediato (País e Doutrina) ---
    const doctrineData = gameData.doctrines[selectedAirDoctrine];
    const countryData = gameData.countries[selectedCountryName];
    document.getElementById('doctrine_note').textContent = doctrineData ? doctrineData.description : "Selecione uma doutrina para ver seus efeitos.";
    let countryCostReduction = 0, countryProductionCapacity = 0, countryMetalBalance = 0;
    if (countryData) {
        const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
        const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        countryCostReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
        countryProductionCapacity = countryData.production_capacity;
        countryMetalBalance = countryData.metal_balance;
        document.getElementById('country_bonus_note').textContent = `Bônus do País: Redução de Custo de ${(countryCostReduction * 100).toFixed(1)}%, Tec. Aeronáutica: ${countryData.tech_level_air}.`;
    } else {
        document.getElementById('country_bonus_note').textContent = "Selecione um país para ver seus bônus.";
    }

    // --- Validação Inicial ---
    const typeData = gameData.components.aircraft_types[aircraftType];
    if (!typeData || !engineType || enginePower <= 0) {
        document.getElementById('status').textContent = "Selecione o tipo de aeronave e um motor com potência válida para começar.";
        document.getElementById('status').className = "status-indicator";
        // Limpa a UI de resultados se a seleção for inválida
        ['unit_cost', 'total_production_cost', 'total_metal_cost', 'total_weight', 'total_power', 'speed_max_sl', 'speed_max_alt', 'rate_of_climb', 'service_ceiling', 'max_range', 'turn_time', 'main_armament', 'reliability_display', 'producible_units'].forEach(id => document.getElementById(id).textContent = '0');
        return null;
    }

    // --- Continua o Processamento ---
    baseUnitCost += typeData.cost;
    baseMetalCost += typeData.metal_cost;
    totalEmptyWeight += typeData.weight;
    document.getElementById('aircraft_type_note').textContent = typeData.description;
    
    // Aplica modificadores de doutrina
    if (doctrineData) {
        costModifier *= (doctrineData.cost_modifier || 1.0);
        reliabilityModifier *= (doctrineData.reliability_modifier || 1.0);
        weightModifier *= (doctrineData.weight_penalty || 1.0);
        if(doctrineData.performance_bonus) {
            for(const key in doctrineData.performance_bonus) performanceBonuses[key] *= doctrineData.performance_bonus[key];
        }
    }

    // Estrutura
    const structureData = gameData.components.structure_materials[structureType];
    costModifier *= structureData.cost_mod;
    weightModifier *= structureData.weight_mod;
    reliabilityModifier *= structureData.reliability_mod;
    document.getElementById('structure_note').textContent = structureData.description;

    // Motor e Propulsão
    const engineData = gameData.components.engines[engineType];
    let baseEnginePower = enginePower;
    document.getElementById('engine_type_note').textContent = engineData.description;
    if (enginePower < engineData.min_power || enginePower > engineData.max_power) {
        document.getElementById('engine_power_note').textContent = `Potência para ${engineData.name} deve ser entre ${engineData.min_power} e ${engineData.max_power} HP.`;
        baseEnginePower = 0; // Invalida
    } else {
        document.getElementById('engine_power_note').textContent = "";
        baseUnitCost += engineData.cost + (enginePower * 20);
        baseMetalCost += engineData.metal_cost;
        totalEmptyWeight += engineData.weight;
        reliabilityModifier *= engineData.reliability;
    }
    
    const propData = gameData.components.propellers[propellerType];
    baseUnitCost += propData.cost;
    totalEmptyWeight += propData.weight;
    baseMetalCost += propData.metal_cost;
    document.getElementById('propeller_type_note').textContent = propData.description;

    const coolingData = gameData.components.cooling_systems[coolingSystem];
    baseUnitCost += coolingData.cost;
    totalEmptyWeight += coolingData.weight;
    reliabilityModifier *= coolingData.reliability_mod;
    document.getElementById('cooling_system_note').textContent = coolingData.description;

    const fuelFeedData = gameData.components.fuel_feeds[fuelFeed];
    baseUnitCost += fuelFeedData.cost;
    totalEmptyWeight += fuelFeedData.weight;
    reliabilityModifier *= fuelFeedData.reliability_mod;
    baseEnginePower *= fuelFeedData.performance_mod;
    document.getElementById('fuel_feed_note').textContent = fuelFeedData.description;

    const superchargerData = gameData.components.superchargers[supercharger];
    baseUnitCost += superchargerData.cost;
    totalEmptyWeight += superchargerData.weight;
    document.getElementById('supercharger_note').textContent = superchargerData.description;

    // Equipamentos
    let equipmentWeight = 0;
    document.querySelectorAll('#protection-section input:checked, #equipment-section input:checked').forEach(cb => {
        const item = gameData.components.protection[cb.id] || gameData.components.equipment[cb.id];
        baseUnitCost += item.cost;
        equipmentWeight += item.weight;
        baseMetalCost += item.metal_cost;
        if(item.reliability_mod) reliabilityModifier *= item.reliability_mod;
        if(item.maneuverability_mod) performanceBonuses.maneuverability *= item.maneuverability_mod;
        if(item.range_mod) performanceBonuses.range *= item.range_mod;
    });
    
    // Lógica dos Tanques Descartáveis
    const dropTanks = document.getElementById('drop_tanks').checked;
    if (dropTanks) {
        ['bomb_50', 'bomb_100', 'bomb_250', 'bomb_500', 'bomb_1000', 'torpedo', 'incendiary', 'rockets'].forEach(id => {
            const el = document.getElementById(id);
            el.value = 0;
            el.disabled = true;
        });
    } else {
         ['bomb_50', 'bomb_100', 'bomb_250', 'bomb_500', 'bomb_1000', 'torpedo', 'incendiary', 'rockets'].forEach(id => {
            document.getElementById(id).disabled = false;
        });
    }

    // Armamentos e Carga
    let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
    let armamentTexts = [];
    document.querySelectorAll('#armament-section .item-row input[type="number"]').forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const armData = gameData.components.armaments[input.id];
            armamentCost += armData.cost * qty;
            armamentWeight += armData.weight * qty;
            armamentMetalCost += armData.metal_cost * qty;
            armamentTexts.push(`${qty}x ${armData.name}`);
        }
    });
    baseUnitCost += armamentCost;
    baseMetalCost += armamentMetalCost;
    finalArmamentText = armamentTexts.length > 0 ? armamentTexts.join(', ') : "Desarmado";

    // Peso Total de Combate
    totalEmptyWeight += equipmentWeight;
    const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000);
    const fuelWeight = fuelCapacity * 0.72;
    const combatWeight = totalEmptyWeight + armamentWeight + (numCrewmen * 90) + fuelWeight;

    // Modificadores Finais
    baseUnitCost *= costModifier * (1 - countryCostReduction);
    let sliderValue = ((productionQualitySliderValue - 50) / 50);
    reliabilityModifier *= (1 + (sliderValue * 0.15));
    baseUnitCost *= (1 + (sliderValue * 0.20));
    countryProductionCapacity *= (1 - (sliderValue * 0.25));
    document.getElementById('production_quality_note').textContent = `Foco ${sliderValue > 0 ? 'em Produção' : 'em Qualidade'}: Confiabilidade ${sliderValue > 0 ? '-' : '+'} / Custo ${sliderValue > 0 ? '-' : '+'} / Capacidade Prod. ${sliderValue > 0 ? '+' : '-'}`;

    // --- CÁLCULOS DE PERFORMANCE COM FÍSICA APRIMORADA ---
    const calculatePerformanceAtAltitude = (h) => {
        const airProps = getAirPropertiesAtAltitude(h);
        const powerAtAltitude = calculateEnginePowerAtAltitude(baseEnginePower, h, superchargerData);
        const powerWatts = powerAtAltitude * 745.7;

        let v_ms = 150; // Chute inicial
        for (let i = 0; i < 5; i++) { // Iteração para velocidade
             const thrust = (powerWatts * propData.efficiency) / Math.max(v_ms, 30);
             const CL = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * v_ms * v_ms * typeData.wing_area_m2);
             const CDi = (CL * CL) / (Math.PI * typeData.aspect_ratio * typeData.oswald_efficiency);
             const CD = typeData.cd_0 + CDi;
             const dragForce = 0.5 * airProps.density * v_ms * v_ms * typeData.wing_area_m2 * CD;
             v_ms = Math.sqrt((thrust / Math.max(dragForce, 0.1)) * v_ms * v_ms);
        }
        return { speed_kmh: v_ms * 3.6, power_w: powerWatts, v_ms: v_ms };
    };
    
    const perfSL = calculatePerformanceAtAltitude(0);
    const perfAlt = calculatePerformanceAtAltitude(superchargerData.rated_altitude_m);
    const finalSpeedKmhSL = perfSL.speed_kmh * performanceBonuses.speed;
    const finalSpeedKmhAlt = perfAlt.speed_kmh * performanceBonuses.speed;

    // Razão de Subida
    const thrust_sl = (perfSL.power_w * propData.efficiency) / 80; // Empuxo em vel de subida
    const drag_sl = 0.5 * gameData.constants.density_sea_level_kg_m3 * 80 * 80 * typeData.wing_area_m2 * typeData.cd_0;
    const rate_of_climb_ms = ((thrust_sl - drag_sl) * 80) / (combatWeight * gameData.constants.standard_gravity_ms2) * performanceBonuses.rate_of_climb;
    
    // Teto de Serviço
    let serviceCeiling = 0;
    for (let h = 0; h < 15000; h += 500) {
        const roc = calculatePerformanceAtAltitude(h).power_w > (combatWeight * gameData.constants.standard_gravity_ms2 * 0.5) ? 0.5 : 0;
        if(roc < 0.5) { serviceCeiling = h; break; }
        if(h >= 14500) serviceCeiling = h;
    }
    const finalServiceCeiling = serviceCeiling * performanceBonuses.service_ceiling;

    // Manobrabilidade
    const wingLoading = combatWeight / typeData.wing_area_m2;
    const v_turn = perfAlt.v_ms * 0.8; // Velocidade de curva
    const max_load_factor = Math.min(gameData.constants.turn_g_force, (0.5 * getAirPropertiesAtAltitude(2000).density * v_turn * v_turn * typeData.cl_max) / wingLoading);
    const turn_radius = (v_turn * v_turn) / (gameData.constants.standard_gravity_ms2 * Math.sqrt(Math.max(1.1, max_load_factor * max_load_factor) - 1));
    let turn_time_s = (2 * Math.PI * turn_radius) / v_turn;
    turn_time_s /= performanceBonuses.maneuverability;
    turn_time_s = Math.max(12, Math.min(60, turn_time_s));

    // Alcance
    const bsfc_kg_per_watt_s = (engineData.bsfc_g_per_kwh / 1000) / 3.6e6;
    const L_D_ratio = typeData.cd_0 > 0 ? 1 / (2 * Math.sqrt(typeData.cd_0 * (1 / (Math.PI * typeData.aspect_ratio * typeData.oswald_efficiency)))) : 10;
    const range_m = (propData.efficiency / (gameData.constants.standard_gravity_ms2 * bsfc_kg_per_watt_s)) * L_D_ratio * Math.log(combatWeight / (combatWeight - fuelWeight));
    const finalRangeKm = (range_m / 1000) * performanceBonuses.range;

    const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));


    // --- Atualização da UI ---
    document.getElementById('display_name').textContent = aircraftName;
    document.getElementById('display_type').textContent = typeData.name;
    document.getElementById('display_doctrine').textContent = doctrineData ? doctrineData.name : '-';
    const finalUnitCost = Math.round(baseUnitCost);
    document.getElementById('unit_cost').textContent = finalUnitCost.toLocaleString('pt-BR');
    document.getElementById('total_production_cost').textContent = (finalUnitCost * quantity).toLocaleString('pt-BR');
    document.getElementById('total_metal_cost').textContent = (Math.round(baseMetalCost) * quantity).toLocaleString('pt-BR');
    document.getElementById('total_weight').textContent = `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`;
    document.getElementById('total_power').textContent = `${Math.round(baseEnginePower).toLocaleString('pt-BR')} hp`;
    document.getElementById('speed_max_sl').textContent = `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`;
    document.getElementById('speed_max_alt').textContent = `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`;
    document.getElementById('rate_of_climb').textContent = `${rate_of_climb_ms.toFixed(1)} m/s`;
    document.getElementById('service_ceiling').textContent = `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`;
    document.getElementById('max_range').textContent = `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`;
    document.getElementById('turn_time').textContent = `${turn_time_s.toFixed(1)} s`;
    document.getElementById('main_armament').textContent = finalArmamentText;
    document.getElementById('reliability_display').textContent = `${finalReliability.toFixed(1)}%`;
    document.getElementById('country_production_capacity').textContent = Math.round(countryProductionCapacity).toLocaleString('pt-BR');
    const producibleUnits = finalUnitCost > 0 ? Math.floor(countryProductionCapacity / finalUnitCost) : 'N/A';
    document.getElementById('producible_units').textContent = producibleUnits.toLocaleString ? producibleUnits.toLocaleString('pt-BR') : 'N/A';
    document.getElementById('country_metal_balance').textContent = Math.round(countryMetalBalance).toLocaleString('pt-BR');
    
    const totalMetalCost = Math.round(baseMetalCost) * quantity;
    const metalStatusEl = document.getElementById('metal_balance_status');
    if (totalMetalCost > countryMetalBalance) {
        metalStatusEl.textContent = '⚠️ Saldo de metais insuficiente!';
        metalStatusEl.className = 'text-sm font-medium mt-1 text-center status-warning';
    } else {
        metalStatusEl.textContent = '✅ Saldo de metais suficiente.';
        metalStatusEl.className = 'text-sm font-medium mt-1 text-center status-ok';
    }
    
    // Lógica de Status Final
    const statusEl = document.getElementById('status');
    if (finalReliability < 70) {
        statusEl.textContent = "🔥 Confiabilidade baixa: Propenso a falhas!";
        statusEl.className = "status-indicator status-error";
    } else if (finalSpeedKmhAlt < 350 && typeData.name.includes('Caça')) {
        statusEl.textContent = "⚠️ Caça muito lento para o combate aéreo.";
        statusEl.className = "status-indicator status-warning";
    } else if (turn_time_s > 28 && typeData.name.includes('Caça')) {
        statusEl.textContent = "⚠️ Caça pouco manobrável.";
        statusEl.className = "status-indicator status-warning";
    } else {
        statusEl.textContent = "✅ Design pronto para os céus! Clique no resumo para gerar a ficha.";
        statusEl.className = "status-indicator status-ok";
    }


    // --- Retornar dados para a ficha ---
    return {
        aircraftName, quantity, selectedCountryName, doctrineName: doctrineData ? doctrineData.name : '-',
        aircraftTypeName: typeData.name, aircraftTypeDescription: typeData.description,
        structureTypeName: structureData.name, structureTypeDescription: structureData.description,
        engineTypeName: engineData ? engineData.name : '-', enginePower: Math.round(baseEnginePower),
        propellerTypeName: propData.name, propellerTypeDescription: propData.description,
        coolingSystemName: coolingData.name, coolingSystemDescription: coolingData.description,
        fuelFeedName: fuelFeedData.name, fuelFeedDescription: fuelFeedData.description,
        superchargerName: superchargerData.name, superchargerDescription: superchargerData.description,
        numCrewmen, finalUnitCost: finalUnitCost.toLocaleString('pt-BR'),
        totalProductionCost: (finalUnitCost * quantity).toLocaleString('pt-BR'),
        totalMetalCost: (Math.round(baseMetalCost) * quantity).toLocaleString('pt-BR'),
        totalWeight: `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
        speedMaxSL: `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`,
        speedMaxAlt: `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`,
        rateOfClimb: `${rate_of_climb_ms.toFixed(1)} m/s`,
        serviceCeiling: `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`,
        maxRange: `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
        turnTime: `${turn_time_s.toFixed(1)} s`, armamentText: finalArmamentText,
        reliability: `${finalReliability.toFixed(1)}%`,
        selectedProtection: Array.from(document.querySelectorAll('#protection-section input:checked')).map(cb => gameData.components.protection[cb.id].name),
        selectedEquipment: Array.from(document.querySelectorAll('#equipment-section input:checked')).map(cb => gameData.components.equipment[cb.id].name),
    };
}

// --- INICIALIZAÇÃO ---
window.onload = function() {
    loadGameDataFromSheets();
    window.updateCalculations = updateCalculations;

    const summaryPanel = document.querySelector('.summary-panel');
    summaryPanel.style.cursor = 'pointer';
    summaryPanel.title = 'Clique para gerar a ficha detalhada da aeronave';
    summaryPanel.addEventListener('click', () => {
        const aircraftData = updateCalculations();
        if(aircraftData){
            localStorage.setItem('aircraftSheetData', JSON.stringify(aircraftData));
            localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft));
            window.open('ficha.html', '_blank');
        }
    });
};
