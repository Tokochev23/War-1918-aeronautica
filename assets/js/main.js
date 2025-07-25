// assets/js/main.js

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
const AERONAVES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=565684512&single=true&output=csv';

// --- DADOS DO JOGO - AERONAVES ---
const gameData = {
    countries: {}, // Será preenchido dinamicamente
    doctrines: {
        air_superiority: {
            name: "Superioridade Aérea",
            description: "Foco em caças de alta performance para dominar os céus. Prioriza velocidade, manobrabilidade e poder de fogo ar-ar.",
            cost_modifier: 1.15,
            performance_bonus: { speed: 1.05, maneuverability: 1.10, rate_of_climb: 1.05 },
            reliability_modifier: 0.95,
        },
        strategic_bombing: {
            name: "Bombardeio Estratégico",
            description: "Doutrina centrada em bombardeiros pesados de longo alcance para destruir a indústria e a moral inimiga. Prioriza alcance, carga de bombas e defesas.",
            cost_modifier: 1.20,
            performance_bonus: { range: 1.20, service_ceiling: 1.10 },
            maneuverability_penalty: 0.85,
        },
        ground_support: {
            name: "Apoio Tático",
            description: "Uso de aeronaves para atacar alvos no campo de batalha. Prioriza robustez, capacidade de carga (bombas/foguetes) e operação em baixa altitude.",
            cost_modifier: 1.0,
            reliability_modifier: 1.10,
            armor_effectiveness_modifier: 1.10,
            speed_penalty: 0.90,
        },
        fleet_defense: {
            name: "Defesa de Frota",
            description: "Caças e bombardeiros baseados em porta-aviões. Requerem construção robusta para pousos e decolagens, e bom alcance sobre o mar.",
            cost_modifier: 1.25,
            reliability_modifier: 1.05,
            performance_bonus: { range: 1.10 },
            weight_penalty: 1.05,
        }
    },
    components: {
        aircraft_types: {
            light_fighter: { name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 15, base_drag_coeff: 0.025, description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado." },
            heavy_fighter: { name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, base_drag_coeff: 0.035, description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves." },
            cas: { name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, base_drag_coeff: 0.042, description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado." },
            tactical_bomber: { name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, base_drag_coeff: 0.045, description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada." },
            strategic_bomber: { name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, base_drag_coeff: 0.050, description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo." },
            zeppelin: { name: "Zeppelin", cost: 500000, weight: 50000, metal_cost: 15000, crew: 20, wing_area_m2: 500, base_drag_coeff: 0.020, description: "Dirigível gigante para bombardeio estratégico ou reconhecimento de longo alcance. Lento, vulnerável, mas com alcance e carga imensos." },
            naval_fighter: { name: "Caça Naval", cost: 60000, weight: 2200, metal_cost: 2800, crew: 1, wing_area_m2: 22, base_drag_coeff: 0.038, description: "Caça adaptado para operações em porta-aviões, com estrutura reforçada e geralmente asas dobráveis." },
            naval_cas: { name: "CAS Naval", cost: 90000, weight: 4000, metal_cost: 4500, crew: 2, wing_area_m2: 35, base_drag_coeff: 0.048, description: "Aeronave de ataque naval, incluindo bombardeiros de mergulho e torpedeiros." },
            naval_bomber: { name: "Bombardeiro Naval", cost: 150000, weight: 6000, metal_cost: 7000, crew: 4, wing_area_m2: 60, base_drag_coeff: 0.052, description: "Bombardeiro médio/pesado adaptado para operações navais, geralmente baseado em terra." },
            naval_recon: { name: "Reconhecimento Naval", cost: 45000, weight: 2000, metal_cost: 2000, crew: 2, wing_area_m2: 25, base_drag_coeff: 0.030, description: "Aeronave de longo alcance para patrulha marítima e reconhecimento." },
            transport: { name: "Transporte", cost: 100000, weight: 8000, metal_cost: 5000, crew: 4, wing_area_m2: 80, base_drag_coeff: 0.060, description: "Projetado para transportar tropas ou carga. Lento e vulnerável, com pouca ou nenhuma capacidade de combate." },
            seaplane: { name: "Hidroavião", cost: 55000, weight: 2500, metal_cost: 2500, crew: 3, wing_area_m2: 30, base_drag_coeff: 0.055, description: "Capaz de pousar e decolar da água. Usado para reconhecimento, patrulha e resgate." },
        },
        structure_materials: {
            wood_fabric: { name: "Madeira e Tecido", cost_mod: 0.7, weight_mod: 0.8, reliability_mod: 0.9, armor_mod: 0.7, description: "Leve e barato, mas frágil e vulnerável a fogo. Comum em designs mais antigos ou leves." },
            wood_metal: { name: "Madeira e Metal", cost_mod: 1.0, weight_mod: 1.0, reliability_mod: 1.0, armor_mod: 1.0, description: "Estrutura de metal com superfícies de madeira/tecido. Bom equilíbrio entre custo e durabilidade." },
            all_metal: { name: "Metal Completo", cost_mod: 1.4, weight_mod: 1.2, reliability_mod: 1.1, armor_mod: 1.2, description: "Estrutura totalmente metálica (sem estresse de pele). Robusto, mas mais pesado que designs posteriores." },
            duralumin: { name: "Duralumínio (Monocoque)", cost_mod: 1.6, weight_mod: 1.05, reliability_mod: 1.15, armor_mod: 1.3, description: "Construção de ponta com pele de alumínio tensionada. Leve, forte e aerodinâmico, mas caro e complexo de produzir." },
        },
        engines: {
            radial_7: { name: "Motor Radial 7 cilindros", cost: 15000, weight: 350, metal_cost: 1200, min_power: 200, max_power: 500, reliability: 1.1, frontal_area_mod: 1.1, description: "Simples e confiável, mas com grande arrasto. Bom para aeronaves de treinamento ou leves." },
            radial_11: { name: "Motor Radial 11 cilindros", cost: 25000, weight: 500, metal_cost: 2000, min_power: 400, max_power: 1000, reliability: 1.05, frontal_area_mod: 1.2, description: "Potência decente com boa confiabilidade. Um motor comum para caças e bombardeiros leves." },
            radial_16: { name: "Motor Radial 16 cilindros", cost: 45000, weight: 800, metal_cost: 3500, min_power: 800, max_power: 1600, reliability: 1.0, frontal_area_mod: 1.3, description: "Motor de dupla estrela potente, para caças pesados e bombardeiros médios." },
            radial_18: { name: "Motor Radial 18 cilindros", cost: 60000, weight: 1100, metal_cost: 4500, min_power: 1200, max_power: 2200, reliability: 0.95, frontal_area_mod: 1.4, description: "Extremamente potente, mas pesado e complexo. Usado nos maiores bombardeiros e caças de final de período." },
            rotary_9: { name: "Motor Rotativo 9 cilindros", cost: 10000, weight: 150, metal_cost: 800, min_power: 80, max_power: 200, reliability: 0.85, frontal_area_mod: 1.0, description: "Design da Grande Guerra. Leve, mas o efeito giroscópico torna a pilotagem difícil. Obsoleto." },
            v8: { name: "Motor V8", cost: 20000, weight: 400, metal_cost: 1800, min_power: 300, max_power: 700, reliability: 1.0, frontal_area_mod: 0.85, description: "Motor em V refrigerado a líquido. Menor arrasto que um radial, mas sistema de refrigeração mais vulnerável." },
            v12: { name: "Motor V12", cost: 35000, weight: 600, metal_cost: 2500, min_power: 600, max_power: 1500, reliability: 0.95, frontal_area_mod: 0.8, description: "O motor de caça de alta performance por excelência. Perfil fino, alta potência, mas complexo." },
            v16: { name: "Motor V16", cost: 55000, weight: 850, metal_cost: 4000, min_power: 1000, max_power: 2000, reliability: 0.9, frontal_area_mod: 0.9, description: "Experimental e potente. Pesado e propenso a problemas de confiabilidade." },
            v24: { name: "Motor V24", cost: 80000, weight: 1200, metal_cost: 6000, min_power: 1800, max_power: 3000, reliability: 0.8, frontal_area_mod: 1.0, description: "Monstro de potência, essencialmente dois V12 juntos. Extremamente pesado, caro e não confiável." },
        },
        propellers: {
            wood_2: { name: "Madeira 2 pás", cost: 1000, weight: 30, metal_cost: 20, efficiency: 0.75, description: "Simples e leve. Ineficiente em altas velocidades e altitudes." },
            wood_3: { name: "Madeira 3 pás", cost: 1800, weight: 45, metal_cost: 30, efficiency: 0.80, description: "Melhor tração para decolagem e subida que a de 2 pás." },
            metal_2: { name: "Metal 2 pás", cost: 2500, weight: 60, metal_cost: 200, efficiency: 0.82, description: "Mais durável que a de madeira, permite perfis de pá mais finos e eficientes." },
            metal_3: { name: "Metal 3 pás", cost: 4000, weight: 90, metal_cost: 300, efficiency: 0.88, description: "Bom desempenho geral, padrão para muitos caças de meio de período." },
            adjustable: { name: "Passo Ajustável", cost: 15000, weight: 120, metal_cost: 500, efficiency: 0.95, description: "Permite ao piloto ajustar o passo da hélice para otimizar a performance em diferentes regimes de voo. Complexo e caro." }
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
            none: { name: "Nenhum", cost: 0, weight: 0, ceiling_mod: 1.0, power_mod_alt: 1.0, description: "Motor naturalmente aspirado. Perde potência rapidamente com a altitude." },
            single_stage: { name: "Mecânico - 1 Estágio", cost: 8000, weight: 50, ceiling_mod: 1.25, power_mod_alt: 1.2, description: "Melhora a performance em altitudes médias. Padrão para a maioria dos caças." },
            two_stage: { name: "Mecânico - 2 Estágios", cost: 20000, weight: 90, ceiling_mod: 1.5, power_mod_alt: 1.4, description: "Excelente performance em altas altitudes. Complexo e rouba mais potência do motor." },
            turbo: { name: "Turboalimentador", cost: 30000, weight: 150, ceiling_mod: 1.7, power_mod_alt: 1.6, description: "Usa os gases de escape para performance superior em altitudes muito elevadas. Pesado, caro e gera muito calor." }
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
            pilot_armor: { name: "Blindagem do Piloto", cost: 15000, weight: 250, metal_cost: 400, description: "Placas de aço ao redor do cockpit para proteger o piloto. Aumenta o peso." },
            engine_armor: { name: "Blindagem do Motor", cost: 15000, weight: 250, metal_cost: 400, description: "Proteção para componentes vitais do motor, aumentando a chance de sobreviver a danos." },
            tank_armor: { name: "Blindagem dos Tanques", cost: 18000, weight: 180, metal_cost: 300, description: "Placas de blindagem ao redor dos tanques de combustível para reduzir o risco de incêndio." },
            self_sealing_tanks: { name: "Tanques Auto-Selantes", cost: 22500, weight: 45, metal_cost: 100, reliability_mod: 1.15, description: "Tanques com revestimento de borracha que selam pequenos furos, reduzindo drasticamente o risco de incêndios e vazamentos." },
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10, description: "Equipamento de segurança básico para a tripulação. Aumenta a moral." },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500, description: "Tecnologia experimental e muito rara que permite a ejeção segura em alta velocidade. Pesado e caro." },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1, description: "Sistema para apagar incêndios no motor, aumentando muito a sobrevivência da aeronave." },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200, description: "Permite comunicação de longa distância e coordenação tática. Essencial para caças e bombardeiros." },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100, description: "Auxilia na navegação em longas distâncias ou em mau tempo. Essencial para bombardeiros e patrulha naval." },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150, description: "Mais precisa que uma bússola magnética, essencial para navegação precisa e voo por instrumentos." },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98, description: "Permite atirar através do arco da hélice. Essencial para caças, mas é um sistema complexo que pode falhar." },
            retractable_gear: { name: "Trem de Pouso Retrátil", cost: 22500, weight: 150, metal_cost: 300, drag_mod: 0.8, reliability_mod: 0.97, description: "Reduz drasticamente o arrasto, aumentando a velocidade. Adiciona peso e complexidade mecânica." },
            pressurized_cabin: { name: "Cabine Pressurizada", cost: 25000, weight: 60, metal_cost: 120, ceiling_mod: 1.2, description: "Permite operações em altitudes muito elevadas sem a necessidade constante de máscaras de oxigênio. Aumenta o teto de serviço." },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100, description: "Permite mergulhos controlados em alta velocidade para bombardeio preciso. Essencial para bombardeiros de mergulho." },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20, description: "Gera um som aterrorizante durante o mergulho para guerra psicológica. Sem efeito prático na performance." },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200, description: "Foguetes de uso único para decolagens curtas, especialmente para bombardeiros pesados ou de pistas improvisadas." },
        }
    },
    constants: {
        air_density_sea_level: 1.225,
        propeller_efficiency_base: 0.70,
        lift_coefficient: 1.4,
        climb_power_factor: 0.7,
        turn_g_force: 3,
        base_fuel_capacity_liters: 400,
        fuel_consumption_base_factor: 0.0005,
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


// --- FUNÇÕES AUXILIARES ---

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
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            let row = {};
            headers.forEach((header, i) => {
                row[header] = values[i];
            });
            return row;
        });
        return data;
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
                    tech_level_air: cleanAndParseFloat(row['Tecnologia Aeronautica']), // Coluna K
                    production_capacity: 0,
                    metal_balance: 0
                };
            }
        });

        aeronavesRaw.forEach(row => {
            const countryName = row['País'];
            if (tempCountries[countryName]) {
                // Coluna P para Capacidade de Produção Aérea
                tempCountries[countryName].production_capacity = cleanAndParseFloat(row['Capacidade de Produção Aérea']);
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
        document.getElementById('status').textContent = `Erro ao carregar dados. Usando valores padrão.`;
        document.getElementById('status').className = "status-indicator status-error";
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

function getSelectedText(elementId) {
    const selectEl = document.getElementById(elementId);
    if (selectEl && selectEl.selectedIndex >= 0) {
        return selectEl.options[selectEl.selectedIndex].text;
    }
    return 'N/A';
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
    let baseUnitCost = 0, baseMetalCost = 0, totalWeight = 0;
    let costModifier = 1.0, weightModifier = 1.0, reliabilityModifier = 1.0, dragModifier = 1.0;
    let performanceBonuses = { speed: 1.0, maneuverability: 1.0, rate_of_climb: 1.0, range: 1.0, service_ceiling: 1.0 };
    let finalArmamentText = "N/A";

    // --- Processamento dos Componentes ---
    const typeData = gameData.components.aircraft_types[aircraftType];
    if (!typeData) {
        document.getElementById('status').textContent = "Selecione um tipo de aeronave para começar.";
        return;
    }
    baseUnitCost += typeData.cost;
    baseMetalCost += typeData.metal_cost;
    totalWeight += typeData.weight;
    let wingArea = typeData.wing_area_m2;
    dragModifier *= typeData.base_drag_coeff;
    document.getElementById('aircraft_type_note').textContent = typeData.description;
    
    const crewInput = document.getElementById('num_crewmen');
    crewInput.min = typeData.crew;
    if(numCrewmen < typeData.crew) crewInput.value = typeData.crew;
    document.getElementById('crew_note').textContent = `Tripulação recomendada para ${typeData.name}: ${typeData.crew}`;

    // Doutrina e País
    const doctrineData = gameData.doctrines[selectedAirDoctrine];
    if (doctrineData) {
        costModifier *= (doctrineData.cost_modifier || 1.0);
        reliabilityModifier *= (doctrineData.reliability_modifier || 1.0);
        weightModifier *= (doctrineData.weight_penalty || 1.0);
        if(doctrineData.performance_bonus) {
            for(const key in doctrineData.performance_bonus) {
                performanceBonuses[key] *= doctrineData.performance_bonus[key];
            }
        }
    }
    
    const countryData = gameData.countries[selectedCountryName];
    let countryCostReduction = 0;
    let countryProductionCapacity = 0;
    let countryMetalBalance = 0;
    if(countryData) {
        const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
        const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        countryCostReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
        countryProductionCapacity = countryData.production_capacity;
        countryMetalBalance = countryData.metal_balance;
    }

    // Estrutura
    const structureData = gameData.components.structure_materials[structureType];
    costModifier *= structureData.cost_mod;
    weightModifier *= structureData.weight_mod;
    reliabilityModifier *= structureData.reliability_mod;
    document.getElementById('structure_note').textContent = structureData.description;

    // Motor e Propulsão
    const engineData = gameData.components.engines[engineType];
    let finalEnginePower = enginePower;
    if (engineData) {
        if (enginePower < engineData.min_power || enginePower > engineData.max_power) {
            document.getElementById('engine_power_note').textContent = `Potência para ${engineData.name} deve ser entre ${engineData.min_power} e ${engineData.max_power} HP.`;
            finalEnginePower = 0;
        } else {
            document.getElementById('engine_power_note').textContent = "";
            baseUnitCost += engineData.cost + (enginePower * 10);
            baseMetalCost += engineData.metal_cost;
            totalWeight += engineData.weight;
            dragModifier *= engineData.frontal_area_mod;
            reliabilityModifier *= engineData.reliability;
        }
    }
    
    const propData = gameData.components.propellers[propellerType];
    baseUnitCost += propData.cost;
    totalWeight += propData.weight;
    baseMetalCost += propData.metal_cost;
    let propEfficiency = gameData.constants.propeller_efficiency_base * propData.efficiency;
    document.getElementById('propeller_type_note').textContent = propData.description;

    const coolingData = gameData.components.cooling_systems[coolingSystem];
    baseUnitCost += coolingData.cost;
    totalWeight += coolingData.weight;
    reliabilityModifier *= coolingData.reliability_mod;
    dragModifier *= coolingData.drag_mod;
    document.getElementById('cooling_system_note').textContent = coolingData.description;

    const fuelFeedData = gameData.components.fuel_feeds[fuelFeed];
    baseUnitCost += fuelFeedData.cost;
    totalWeight += fuelFeedData.weight;
    reliabilityModifier *= fuelFeedData.reliability_mod;
    finalEnginePower *= fuelFeedData.performance_mod;
    document.getElementById('fuel_feed_note').textContent = fuelFeedData.description;

    const superchargerData = gameData.components.superchargers[supercharger];
    baseUnitCost += superchargerData.cost;
    totalWeight += superchargerData.weight;
    performanceBonuses.service_ceiling *= superchargerData.ceiling_mod;
    document.getElementById('supercharger_note').textContent = superchargerData.description;

    // Armamentos
    let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
    let armamentTexts = [];
    document.querySelectorAll('#armament-section .item-row').forEach(row => {
        const input = row.querySelector('input[type="number"]');
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const armId = input.id;
            const armData = gameData.components.armaments[armId];
            armamentCost += armData.cost * qty;
            armamentWeight += armData.weight * qty;
            armamentMetalCost += armData.metal_cost * qty;
            armamentTexts.push(`${qty}x ${armData.name}`);
        }
    });

    baseUnitCost += armamentCost;
    totalWeight += armamentWeight;
    baseMetalCost += armamentMetalCost;
    finalArmamentText = armamentTexts.length > 0 ? armamentTexts.join(', ') : "Desarmado";

    // Proteção e Equipamentos
    document.querySelectorAll('#protection-section input[type="checkbox"]:checked').forEach(cb => {
        const item = gameData.components.protection[cb.id];
        baseUnitCost += item.cost;
        totalWeight += item.weight;
        baseMetalCost += item.metal_cost;
        if(item.reliability_mod) reliabilityModifier *= item.reliability_mod;
    });
    document.querySelectorAll('#equipment-section input[type="checkbox"]:checked').forEach(cb => {
        const item = gameData.components.equipment[cb.id];
        baseUnitCost += item.cost;
        totalWeight += item.weight;
        baseMetalCost += item.metal_cost;
        if(item.reliability_mod) reliabilityModifier *= item.reliability_mod;
        if(item.drag_mod) dragModifier *= item.drag_mod;
        if(item.ceiling_mod) performanceBonuses.service_ceiling *= item.ceiling_mod;
    });


    // Modificadores Finais
    totalWeight *= weightModifier;
    baseUnitCost *= costModifier * (1 - countryCostReduction);
    let sliderValue = ((productionQualitySliderValue - 50) / 50);
    reliabilityModifier *= (1 + (sliderValue * 0.15));
    baseUnitCost *= (1 + (sliderValue * 0.20));
    countryProductionCapacity *= (1 - (sliderValue * 0.25));

    // --- Cálculos de Performance ---
    const thrust = (finalEnginePower * 745.7 * propEfficiency);
    const drag = dragModifier * wingArea * gameData.constants.lift_coefficient;
    const speed_ms = Math.sqrt((2 * thrust) / (gameData.constants.air_density_sea_level * drag)) * performanceBonuses.speed;
    const finalSpeedKmh = Math.max(0, speed_ms * 3.6);
    const rate_of_climb_ms = Math.max(0, (thrust / (totalWeight * 9.81)) * speed_ms * 0.1) * performanceBonuses.rate_of_climb;
    const finalServiceCeiling = Math.max(0, (finalEnginePower / totalWeight) * 2500 * performanceBonuses.service_ceiling * superchargerData.ceiling_mod);
    const turn_radius = (Math.pow(speed_ms, 2)) / (9.81 * Math.sqrt(Math.pow(gameData.constants.turn_g_force, 2) - 1));
    let turn_time_s = (2 * Math.PI * turn_radius) / speed_ms;
    turn_time_s /= performanceBonuses.maneuverability;
    turn_time_s = Math.max(8, turn_time_s);
    const fuelConsumption = (finalEnginePower * gameData.constants.fuel_consumption_base_factor);
    const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalWeight / 2000);
    const flightTimeHours = (fuelCapacity * 0.8) / (fuelConsumption * 3600);
    const finalRangeKm = Math.max(0, flightTimeHours * finalSpeedKmh * 0.8) * performanceBonuses.range;
    const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));

    // --- Atualização da UI ---
    document.getElementById('display_name').textContent = aircraftName;
    document.getElementById('display_type').textContent = typeData.name;
    document.getElementById('display_doctrine').textContent = doctrineData ? doctrineData.name : '-';
    const finalUnitCost = Math.round(baseUnitCost);
    document.getElementById('unit_cost').textContent = finalUnitCost.toLocaleString('pt-BR');
    document.getElementById('total_production_cost').textContent = (finalUnitCost * quantity).toLocaleString('pt-BR');
    document.getElementById('total_metal_cost').textContent = (Math.round(baseMetalCost) * quantity).toLocaleString('pt-BR');
    document.getElementById('total_weight').textContent = `${Math.round(totalWeight).toLocaleString('pt-BR')} kg`;
    document.getElementById('total_power').textContent = `${Math.round(finalEnginePower).toLocaleString('pt-BR')} hp`;
    document.getElementById('speed_max').textContent = `${Math.round(finalSpeedKmh).toLocaleString('pt-BR')} km/h`;
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

    // --- Retornar dados para a ficha ---
    return {
        aircraftName, quantity, selectedCountryName, doctrineName: doctrineData ? doctrineData.name : '-',
        aircraftTypeName: typeData.name, aircraftTypeDescription: typeData.description,
        structureTypeName: structureData.name, structureTypeDescription: structureData.description,
        engineTypeName: engineData ? engineData.name : '-', enginePower: Math.round(finalEnginePower),
        propellerTypeName: propData.name, propellerTypeDescription: propData.description,
        coolingSystemName: coolingData.name, coolingSystemDescription: coolingData.description,
        fuelFeedName: fuelFeedData.name, fuelFeedDescription: fuelFeedData.description,
        superchargerName: superchargerData.name, superchargerDescription: superchargerData.description,
        numCrewmen, finalUnitCost: finalUnitCost.toLocaleString('pt-BR'),
        totalProductionCost: (finalUnitCost * quantity).toLocaleString('pt-BR'),
        totalMetalCost: (Math.round(baseMetalCost) * quantity).toLocaleString('pt-BR'),
        totalWeight: `${Math.round(totalWeight).toLocaleString('pt-BR')} kg`,
        speedMax: `${Math.round(finalSpeedKmh).toLocaleString('pt-BR')} km/h`,
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

    document.querySelector('.summary-panel').addEventListener('click', () => {
        const aircraftData = updateCalculations();
        localStorage.setItem('aircraftSheetData', JSON.stringify(aircraftData));
        localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft));
        window.open('ficha.html', '_blank');
    });
};
