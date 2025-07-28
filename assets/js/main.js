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
            // Adicionando limites de performance e manobrabilidade base
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
            basic_autopilot: { name: "Piloto Automático Básico", cost: 15000, weight: 40, metal_cost: 100, range_mod: 1.05, reliability_mod: 1.03, description: "Sistema básico que ajuda a manter o curso e a altitude, reduzindo a fadiga do piloto em voos longos e melhorando a confiabilidade em missões estendidas." }
        },
        advanced_avionics: {
            radio_direction_finder: { name: "Rádio Direção (RDF)", cost: 10000, weight: 25, metal_cost: 80, reliability_mod: 1.0, description: "Auxilia na navegação, permitindo que a aeronave encontre estações de rádio." },
            blind_flying_instruments: { name: "Instrumentos de Voo por Instrumentos", cost: 18000, weight: 30, metal_cost: 120, reliability_mod: 1.02, description: "Conjunto completo de instrumentos que permite voo em condições de baixa visibilidade (nevoeiro, noite), aumentando a segurança e confiabilidade em condições adversas." },
            basic_bomb_sight: { name: "Mira de Bombardeio (Básica)", cost: 7000, weight: 15, metal_cost: 60, reliability_mod: 1.0, description: "Mira simples para bombardeio, melhora a precisão em alvos maiores." },
            advanced_bomb_sight: { name: "Mira de Bombardeio (Avançada)", cost: 25000, weight: 40, metal_cost: 180, reliability_mod: 0.95, description: "Mira giroscópica avançada, aumenta significativamente a precisão de bombardeio. Mais complexa e menos confiável que a básica." },
            camera_equipment: { name: "Equipamento de Câmera (Recon)", cost: 12000, weight: 60, metal_cost: 90, reliability_mod: 1.0, description: "Câmeras de alta resolução para missões de reconhecimento fotográfico." },
            early_radar: { name: "Radar Inicial (Experimental)", cost: 150000, weight: 200, metal_cost: 500, reliability_mod: 0.5, speed_mod: 0.95, description: "Tecnologia extremamente experimental e não confiável. Permite detecção de aeronaves inimigas à noite ou em mau tempo, mas é pesado, gera arrasto e falha frequentemente." }
        },
        equipment: {
            parachute: { name: "Paraquedas", cost: 7500, weight: 15, metal_cost: 10, reliability_mod: 1.0, description: "Equipamento de segurança para a tripulação." },
            ejection_seat: { name: "Assento Ejetável (Exp.)", cost: 150000, weight: 378, metal_cost: 500, reliability_mod: 0.7, description: "Tecnologia experimental para ejetar o piloto em emergências. Extremamente caro e não confiável no período." },
            fire_extinguisher: { name: "Sistema Anti-Incêndio", cost: 45000, weight: 75, metal_cost: 150, reliability_mod: 1.1, description: "Sistema automático para combater incêndios a bordo, aumentando a confiabilidade e a segurança." },
            radio_hf: { name: "Rádio HF", cost: 22500, weight: 100, metal_cost: 200, reliability_mod: 1.0, description: "Rádio de alta frequência para comunicação de longo alcance." },
            nav_instruments: { name: "Instrumentos de Navegação", cost: 15000, weight: 50, metal_cost: 100, reliability_mod: 1.0, description: "Instrumentos adicionais para navegação precisa." },
            gyro_compass: { name: "Bússola Giroscópica", cost: 30000, weight: 80, metal_cost: 150, reliability_mod: 1.0, description: "Bússola mais precisa e estável que a magnética, especialmente em manobras." },
            gun_synchronizer: { name: "Sincronizador de Metralhadoras", cost: 60000, weight: 50, metal_cost: 100, reliability_mod: 0.98, description: "Permite atirar através do arco da hélice sem atingi-la. Essencial para caças com armamento frontal, mas pode falhar." },
            dive_brakes: { name: "Freios de Mergulho", cost: 8000, weight: 50, metal_cost: 100, reliability_mod: 1.0, description: "Superfícies que se estendem para controlar a velocidade em mergulhos íngremes." },
            sirens: { name: "Sirenes Psicológicas", cost: 2000, weight: 10, metal_cost: 20, reliability_mod: 1.0, description: "Sirenes montadas na aeronave para efeito psicológico sobre o inimigo." },
            jato: { name: "Foguetes Auxiliares (JATO)", cost: 30000, weight: 120, metal_cost: 200, reliability_mod: 0.90, description: "Foguetes de curta duração para auxiliar na decolagem, especialmente com carga pesada. Uso único e pode ser perigoso." },
            extra_fuel_tanks: { name: "Tanques de Combustíveis Extras (Fixos)", cost: 8000, weight: 40, metal_cost: 150, range_mod: 1.4, maneuverability_mod: 0.9, reliability_mod: 0.98, description: "Aumenta o alcance com tanques internos maiores, mas o peso extra permanente prejudica a agilidade e adiciona pontos de falha." },
            drop_tanks: { name: "Tanques de Combustíveis Descartáveis", cost: 12000, weight: 20, metal_cost: 200, range_mod: 1.8, reliability_mod: 0.95, description: "Aumenta drasticamente o alcance. Os tanques são descartados antes do combate, não afetando a performance. Impede o uso de bombas ou foguetes e adiciona complexidade." },
            advanced_control_surfaces: { name: "Superfícies de Controle Avançadas", cost: 40000, weight: 50, metal_cost: 300, maneuverability_mod: 1.25, reliability_mod: 0.90, description: "Ailerons e profundores otimizados que permitem taxas de rolagem e curvas mais rápidas, ao custo de estabilidade e maior complexidade, impactando a confiabilidade." },
            arresting_hook: { name: "Gancho de Arresto", cost: 5000, weight: 20, metal_cost: 50, reliability_mod: 1.0, description: "Gancho retrátil para pousos em porta-aviões, essencial para aeronaves navais." },
            smoke_generators: { name: "Geradores de Fumaça", cost: 3000, weight: 50, metal_cost: 30, reliability_mod: 1.0, description: "Equipamento para criar cortinas de fumaça para ocultação ou sinalização durante o voo." },
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
        turn_g_force: 4.5, // Fator G estrutural médio para caças
        base_fuel_capacity_liters: 380, // Reduzido para balancear o alcance
        country_cost_reduction_factor: 0.25,
        urbanization_cost_reduction_factor: 0.20,
        max_tech_civil_level: 150,
        max_urbanization_level: 80,
        min_roc_for_ceiling: 0.5, // m/s, minimum rate of climb to define service ceiling
        fuel_weight_per_liter: 0.72, // kg
        crew_weight_kg: 90
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

// --- FUNÇÕES DE FÍSICA E AERODINÂMICA ---

function getAirPropertiesAtAltitude(h_m) {
    const h = Math.max(0, h_m); // Altitude cannot be negative
    const T0 = gameData.constants.temp_sea_level_k;
    const P0 = gameData.constants.pressure_sea_level_pa;
    const L = gameData.constants.temp_lapse_rate_k_per_m;
    const R = gameData.constants.gas_constant_air_specific;
    const g = gameData.constants.standard_gravity_ms2;

    const T = Math.max(216.65, T0 - L * h); // Temp in Kelvin, capped at tropopause
    const P = P0 * Math.pow((T / T0), g / (L * R));
    const rho = P / (R * T);
    
    return { temperature: T, pressure: P, density: rho };
}

function calculateEnginePowerAtAltitude(basePower, h, superchargerData) {
    if (!superchargerData || superchargerData.name === "Nenhum") {
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / gameData.constants.density_sea_level_kg_m3;
        return basePower * densityRatio;
    }

    if (h <= superchargerData.rated_altitude_m) {
        return basePower;
    } else {
        const ratedAltProps = getAirPropertiesAtAltitude(superchargerData.rated_altitude_m);
        const currentAltProps = getAirPropertiesAtAltitude(h);
        const densityRatio = currentAltProps.density / ratedAltProps.density;
        return basePower * densityRatio;
    }
}

function calculatePerformanceAtAltitude(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    // Iterative calculation to find max speed
    let v_ms = 150; // Initial guess for speed in m/s
    for (let i = 0; i < 5; i++) {
        const thrust = (powerWatts * propData.efficiency) / Math.max(v_ms, 30); // Avoid division by zero
        const CL = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * v_ms * v_ms * aero.wing_area_m2);
        const CDi = (CL * CL) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
        const CD = aero.cd_0 * aero.drag_mod + CDi;
        const dragForce = 0.5 * airProps.density * v_ms * v_ms * aero.wing_area_m2 * CD;
        v_ms = Math.sqrt((thrust / Math.max(dragForce, 0.1)) * v_ms * v_ms);
    }
    const rateOfClimb = calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData);

    return { speed_kmh: v_ms * 3.6, roc_ms: rateOfClimb, v_ms };
}

function calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData) {
    const airProps = getAirPropertiesAtAltitude(h);
    const powerAtAltitude = calculateEnginePowerAtAltitude(totalEnginePower, h, superchargerData) * aero.power_mod;
    const powerWatts = powerAtAltitude * 745.7;

    // A more realistic climb speed (Vy) is usually lower than max speed
    const climbSpeed_ms = 80; 

    const thrust = (powerWatts * propData.efficiency) / Math.max(climbSpeed_ms, 1);
    
    const CL_climb = (combatWeight * gameData.constants.standard_gravity_ms2) / (0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2);
    const CDi_climb = (CL_climb * CL_climb) / (Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    const CD_climb = aero.cd_0 * aero.drag_mod + CDi_climb;
    const dragForce_climb = 0.5 * airProps.density * climbSpeed_ms * climbSpeed_ms * aero.wing_area_m2 * CD_climb;

    const excessPower = (thrust * climbSpeed_ms) - (dragForce_climb * climbSpeed_ms);
    const rateOfClimb = excessPower / (combatWeight * gameData.constants.standard_gravity_ms2);
    
    return Math.max(0, rateOfClimb); // Rate of climb cannot be negative
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
    // --- GATHER INPUTS ---
    const inputs = {
        aircraftName: document.getElementById('aircraft_name').value || 'Aeronave Sem Nome',
        quantity: parseInt(document.getElementById('quantity').value) || 1,
        selectedCountryName: document.getElementById('country_doctrine').value,
        selectedAirDoctrine: document.getElementById('air_doctrine').value,
        aircraftType: document.getElementById('aircraft_type').value,
        structureType: document.getElementById('structure_type').value,
        wingType: document.getElementById('wing_type').value,
        landingGearType: document.getElementById('landing_gear_type').value,
        engineType: document.getElementById('engine_type').value,
        numEngines: parseInt(document.getElementById('num_engines').value) || 1,
        enginePower: parseInt(document.getElementById('engine_power').value) || 0,
        propellerType: document.getElementById('propeller_type').value,
        coolingSystem: document.getElementById('cooling_system').value,
        fuelFeed: document.getElementById('fuel_feed').value,
        supercharger: document.getElementById('supercharger').value,
        numCrewmen: parseInt(document.getElementById('num_crewmen').value) || 1,
        productionQualitySliderValue: parseInt(document.getElementById('production_quality_slider').value), // BUG FIX: Removed || 50
        defensiveTurretType: document.getElementById('defensive_turret_type').value,
        checkboxes: {
            wing: Array.from(document.querySelectorAll('#wing-configuration-section input[type="checkbox"]:checked')).map(cb => cb.id),
            engine: Array.from(document.querySelectorAll('#engine-section input[type="checkbox"]:checked')).map(cb => cb.id),
            protection: Array.from(document.querySelectorAll('#protection-section input[type="checkbox"]:checked')).map(cb => cb.id),
            cockpit: Array.from(document.querySelectorAll('#cockpit-comfort-section input[type="checkbox"]:checked')).map(cb => cb.id),
            avionics: Array.from(document.querySelectorAll('#advanced-avionics-section input[type="checkbox"]:checked')).map(cb => cb.id),
            equipment: Array.from(document.querySelectorAll('#equipment-section input[type="checkbox"]:checked')).map(cb => cb.id),
            maintainability: Array.from(document.querySelectorAll('#reliability-maintainability-section input[type="checkbox"]:checked')).map(cb => cb.id),
        },
        armaments: {
            offensive: Array.from(document.querySelectorAll('#armament-section input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 })),
            defensive: Array.from(document.querySelectorAll('#defensive-armaments-section input[type="number"]')).map(i => ({ id: i.id, qty: parseInt(i.value) || 0 }))
        }
    };
    
    // --- VALIDATION ---
    const typeData = gameData.components.aircraft_types[inputs.aircraftType];
    const engineData = gameData.components.engines[inputs.engineType];
    if (!typeData || !engineData || inputs.enginePower <= 0) {
        document.getElementById('status').textContent = "Selecione o tipo de aeronave e um motor com potência válida para começar.";
        document.getElementById('status').className = "status-indicator";
        return null;
    }
    
    // --- CALCULATE BASE STATS & MODIFIERS ---
    let baseUnitCost = typeData.cost;
    let baseMetalCost = typeData.metal_cost;
    let totalEmptyWeight = typeData.weight;
    let reliabilityModifier = typeData.reliability_base;
    let aero = {
        wing_area_m2: typeData.wing_area_m2,
        cl_max: typeData.cl_max,
        cd_0: typeData.cd_0,
        aspect_ratio: typeData.aspect_ratio,
        oswald_efficiency: typeData.oswald_efficiency,
        maneuverability_mod: typeData.maneuverability_base,
        drag_mod: 1.0,
        power_mod: 1.0,
        range_mod: 1.0,
        ceiling_mod: 1.0,
        speed_mod: 1.0
    };

    // Doctrine
    const doctrineData = gameData.doctrines[inputs.selectedAirDoctrine];
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

    // Structure, Wings, Landing Gear
    const structureData = gameData.components.structure_materials[inputs.structureType];
    baseUnitCost *= structureData.cost_mod;
    totalEmptyWeight *= structureData.weight_mod;
    reliabilityModifier *= structureData.reliability_mod;

    const wingData = gameData.components.wing_types[inputs.wingType];
    baseUnitCost *= wingData.cost_mod;
    totalEmptyWeight *= wingData.weight_mod;
    aero.drag_mod *= wingData.drag_mod;
    aero.cl_max *= wingData.cl_max_mod;
    aero.cd_0 *= wingData.cd_0_mod;
    aero.aspect_ratio *= wingData.aspect_ratio_mod;
    aero.maneuverability_mod *= wingData.maneuverability_mod || 1.0;
    reliabilityModifier *= wingData.reliability_mod;

    const landingGearData = gameData.components.landing_gear_types[inputs.landingGearType];
    baseUnitCost += landingGearData.cost;
    totalEmptyWeight += landingGearData.weight;
    baseMetalCost += landingGearData.metal_cost;
    aero.drag_mod *= landingGearData.drag_mod;
    reliabilityModifier *= landingGearData.reliability_mod;

    // Engines & Propulsion
    let totalEnginePower = 0;
    document.getElementById('engine_power_note').textContent = "";
    if (inputs.enginePower < engineData.min_power || inputs.enginePower > engineData.max_power) {
        document.getElementById('engine_power_note').textContent = `Potência para ${engineData.name} deve ser entre ${engineData.min_power} e ${engineData.max_power} HP.`;
    } else {
        totalEnginePower = inputs.enginePower * inputs.numEngines;
        baseUnitCost += (engineData.cost + (inputs.enginePower * 20)) * inputs.numEngines;
        baseMetalCost += engineData.metal_cost * inputs.numEngines;
        totalEmptyWeight += engineData.weight * inputs.numEngines;
        reliabilityModifier *= Math.pow(engineData.reliability, inputs.numEngines); // Reliability decreases with more engines
    }
    
    const propData = gameData.components.propellers[inputs.propellerType];
    baseUnitCost += propData.cost * inputs.numEngines;
    totalEmptyWeight += propData.weight * inputs.numEngines;
    baseMetalCost += propData.metal_cost * inputs.numEngines;
    reliabilityModifier *= Math.pow(propData.reliability_mod, inputs.numEngines);

    // Other systems
    [
        gameData.components.cooling_systems[inputs.coolingSystem],
        gameData.components.fuel_feeds[inputs.fuelFeed],
        gameData.components.superchargers[inputs.supercharger]
    ].forEach(data => {
        baseUnitCost += data.cost * inputs.numEngines; // Cost per engine
        totalEmptyWeight += data.weight * inputs.numEngines; // Weight per engine
        reliabilityModifier *= Math.pow(data.reliability_mod, inputs.numEngines);
        aero.drag_mod *= data.drag_mod || 1.0;
        aero.power_mod *= data.performance_mod || 1.0;
    });

    // Process all checkbox-based components
    for (const category in inputs.checkboxes) {
        inputs.checkboxes[category].forEach(id => {
            const item = gameData.components[category === 'avionics' ? 'advanced_avionics' : category][id] || gameData.components.equipment[id] || gameData.components.cockpit_comfort[id];
            if(item) {
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

    // Armaments
    let armamentWeight = 0, armamentCost = 0, armamentMetalCost = 0;
    let offensiveArmamentTexts = [];
    inputs.armaments.offensive.forEach(arm => {
        if (arm.qty > 0) {
            const armData = gameData.components.armaments[arm.id];
            armamentCost += armData.cost * arm.qty;
            armamentWeight += armData.weight * arm.qty;
            armamentMetalCost += armData.metal_cost * arm.qty;
            offensiveArmamentTexts.push(`${arm.qty}x ${armData.name}`);
        }
    });
    baseUnitCost += armamentCost;
    baseMetalCost += armamentMetalCost;

    // Defensive Armaments
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
                baseUnitCost += defArmData.cost * arm.qty;
                totalEmptyWeight += defArmData.weight * arm.qty;
                baseMetalCost += defArmData.metal_cost * arm.qty;
                defensiveArmamentTexts.push(`${arm.qty}x ${defArmData.name.replace(' (Defensiva)', '')}`);
            }
        });
    }

    // --- FINAL WEIGHT AND COST ---
    const fuelCapacity = gameData.constants.base_fuel_capacity_liters * (totalEmptyWeight / 2000) * Math.sqrt(inputs.numEngines);
    const fuelWeight = fuelCapacity * gameData.constants.fuel_weight_per_liter;
    const combatWeight = totalEmptyWeight + armamentWeight + (inputs.numCrewmen * gameData.constants.crew_weight_kg) + fuelWeight;

    // Quality/Production Slider
    const qualityBias = (100 - inputs.productionQualitySliderValue) / 100;
    const productionBias = inputs.productionQualitySliderValue / 100;
    baseUnitCost *= (1 + (productionBias * 0.20) - (qualityBias * 0.20));
    reliabilityModifier *= (1 + (qualityBias * 0.15) - (productionBias * 0.15));
    
    // Country cost reduction
    const countryData = gameData.countries[inputs.selectedCountryName];
    let countryCostReduction = 0;
    if (countryData) {
        const civilTechReduction = (countryData.tech_civil / gameData.constants.max_tech_civil_level) * gameData.constants.country_cost_reduction_factor;
        const urbanizationReduction = (countryData.urbanization / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        countryCostReduction = Math.min(0.75, civilTechReduction + urbanizationReduction);
    }
    baseUnitCost *= (1 - countryCostReduction);
    
    // --- PERFORMANCE CALCULATIONS ---
    const superchargerData = gameData.components.superchargers[inputs.supercharger];
    const perfSL = calculatePerformanceAtAltitude(0, combatWeight, totalEnginePower, propData, aero, superchargerData);
    const perfAlt = calculatePerformanceAtAltitude(superchargerData.rated_altitude_m, combatWeight, totalEnginePower, propData, aero, superchargerData);
    
    const finalSpeedKmhSL = perfSL.speed_kmh * aero.speed_mod;
    const finalSpeedKmhAlt = perfAlt.speed_kmh * aero.speed_mod;
    const rate_of_climb_ms = perfSL.roc_ms;

    // Service Ceiling
    let serviceCeiling = 0;
    for (let h = 0; h <= 15000; h += 250) {
        const currentROC = calculateRateOfClimb(h, combatWeight, totalEnginePower, propData, aero, superchargerData);
        if (currentROC < gameData.constants.min_roc_for_ceiling) {
            serviceCeiling = h;
            break;
        }
        if (h === 15000) serviceCeiling = h;
    }
    let finalServiceCeiling = serviceCeiling * aero.ceiling_mod;
    // Hard caps for equipment
    if (!inputs.checkboxes.cockpit.includes('pressurized_cabin') && finalServiceCeiling > 10000) {
        finalServiceCeiling = 10000;
    }
    if (!inputs.checkboxes.cockpit.includes('oxygen_system') && finalServiceCeiling > 5000) {
        finalServiceCeiling = 5000;
    }

    // Maneuverability
    const wingLoading = combatWeight / aero.wing_area_m2;
    const v_turn = perfAlt.v_ms * 0.8;
    const max_load_factor = Math.min(gameData.constants.turn_g_force, (0.5 * getAirPropertiesAtAltitude(2000).density * v_turn * v_turn * aero.cl_max) / wingLoading);
    const turn_radius = (v_turn * v_turn) / (gameData.constants.standard_gravity_ms2 * Math.sqrt(Math.max(0.01, max_load_factor * max_load_factor - 1)));
    let turn_time_s = (2 * Math.PI * turn_radius) / v_turn;
    turn_time_s /= aero.maneuverability_mod;
    turn_time_s = Math.max(12, Math.min(60, turn_time_s));

    // Range
    const bsfc_kg_per_watt_s = (engineData.bsfc_g_per_kwh / 1000) / 3.6e6;
    const optimal_CL = Math.sqrt(aero.cd_0 * Math.PI * aero.aspect_ratio * aero.oswald_efficiency);
    const optimal_CD = aero.cd_0 * 2;
    const L_D_ratio = optimal_CD > 0 ? optimal_CL / optimal_CD : 10;
    const range_m = (propData.efficiency / (gameData.constants.standard_gravity_ms2 * bsfc_kg_per_watt_s)) * L_D_ratio * Math.log(combatWeight / (combatWeight - fuelWeight));
    const finalRangeKm = (range_m / 1000) * aero.range_mod;

    const finalReliability = Math.max(5, Math.min(100, 100 * reliabilityModifier));

    // --- UI UPDATE ---
    document.getElementById('display_name').textContent = inputs.aircraftName;
    document.getElementById('display_type').textContent = typeData.name;
    document.getElementById('display_doctrine').textContent = doctrineData ? doctrineData.name : '-';
    const finalUnitCost = Math.round(baseUnitCost);
    document.getElementById('unit_cost').textContent = finalUnitCost.toLocaleString('pt-BR');
    document.getElementById('total_production_cost').textContent = (finalUnitCost * inputs.quantity).toLocaleString('pt-BR');
    document.getElementById('total_metal_cost').textContent = (Math.round(baseMetalCost) * inputs.quantity).toLocaleString('pt-BR');
    document.getElementById('total_weight').textContent = `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`;
    document.getElementById('total_power').textContent = `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`;
    document.getElementById('speed_max_sl').textContent = `${Math.round(finalSpeedKmhSL).toLocaleString('pt-BR')} km/h`;
    document.getElementById('speed_max_alt').textContent = `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`;
    document.getElementById('rate_of_climb').textContent = `${rate_of_climb_ms.toFixed(1)} m/s`;
    document.getElementById('service_ceiling').textContent = `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`;
    document.getElementById('max_range').textContent = `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`;
    document.getElementById('turn_time').textContent = `${turn_time_s.toFixed(1)} s`;
    document.getElementById('main_armament').textContent = offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Desarmado";
    document.getElementById('reliability_display').textContent = `${finalReliability.toFixed(1)}%`;
    
    // Country Production UI
    if (countryData) {
        let countryProductionCapacity = countryData.production_capacity * (1 + (productionBias * 0.25) - (qualityBias * 0.10));
        document.getElementById('country_production_capacity').textContent = Math.round(countryProductionCapacity).toLocaleString('pt-BR');
        const producibleUnits = finalUnitCost > 0 ? Math.floor(countryProductionCapacity / finalUnitCost) : 'N/A';
        document.getElementById('producible_units').textContent = producibleUnits.toLocaleString ? producibleUnits.toLocaleString('pt-BR') : 'N/A';
        document.getElementById('country_metal_balance').textContent = Math.round(countryData.metal_balance).toLocaleString('pt-BR');
        const totalMetalCost = Math.round(baseMetalCost) * inputs.quantity;
        const metalStatusEl = document.getElementById('metal_balance_status');
        if (totalMetalCost > countryData.metal_balance) {
            metalStatusEl.textContent = '⚠️ Saldo de metais insuficiente!';
            metalStatusEl.className = 'text-sm font-medium mt-1 text-center status-warning';
        } else {
            metalStatusEl.textContent = '✅ Saldo de metais suficiente.';
            metalStatusEl.className = 'text-sm font-medium mt-1 text-center status-ok';
        }
    }

    // --- STATUS AND WARNINGS ---
    const statusContainer = document.getElementById('status-container');
    statusContainer.innerHTML = ''; // Clear previous warnings
    let warnings = [];
    const powerToWeightRatio = (totalEnginePower * 745.7) / (combatWeight * gameData.constants.standard_gravity_ms2);

    if (powerToWeightRatio < 0.25 && typeData.name.includes('Caça')) warnings.push({ type: 'error', text: '🔥 Relação peso/potência crítica! Aeronave com performance muito baixa.' });
    else if (powerToWeightRatio < 0.35 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Relação peso/potência baixa. Aumente a potência ou reduza o peso.' });
    
    if (wingLoading > 200 && typeData.name.includes('Caça')) warnings.push({ type: 'warning', text: '⚠️ Carga alar alta, prejudicando a manobrabilidade em baixa velocidade.' });
    if (wingLoading > 250) warnings.push({ type: 'warning', text: '⚠️ Carga alar muito alta, resultando em altas velocidades de estol.' });

    if (finalReliability < 70) warnings.push({ type: 'error', text: '🔥 Confiabilidade baixa: Propenso a falhas críticas!' });
    
    if (typeData.limits) {
        if (finalSpeedKmhAlt < typeData.limits.min_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade abaixo do esperado para um ${typeData.name} (${Math.round(finalSpeedKmhAlt)} km/h).` });
        if (finalSpeedKmhAlt > typeData.limits.max_speed) warnings.push({ type: 'warning', text: `⚠️ Velocidade acima do esperado para um ${typeData.name} (${Math.round(finalSpeedKmhAlt)} km/h).` });
        if (finalRangeKm < typeData.limits.min_range) warnings.push({ type: 'warning', text: `⚠️ Alcance abaixo do esperado para um ${typeData.name} (${Math.round(finalRangeKm)} km).` });
        if (finalRangeKm > typeData.limits.max_range) warnings.push({ type: 'warning', text: `⚠️ Alcance acima do esperado para um ${typeData.name} (${Math.round(finalRangeKm)} km).` });
    }

    if (warnings.length === 0) {
        warnings.push({ type: 'ok', text: '✅ Design pronto para os céus! Clique no ícone de relatório para gerar a ficha.' });
    }

    warnings.forEach(warning => {
        const statusEl = document.createElement('div');
        statusEl.className = `status-indicator status-${warning.type}`;
        statusEl.textContent = warning.text;
        statusContainer.appendChild(statusEl);
    });

    // --- GENERATE DATA FOR FICHA ---
    const performanceGraphData = [];
    for (let h = 0; h <= 14000; h += 1000) {
        let cappedAlt = h;
        if (h > finalServiceCeiling) cappedAlt = finalServiceCeiling;
        
        const perfPoint = calculatePerformanceAtAltitude(cappedAlt, combatWeight, totalEnginePower, propData, aero, superchargerData);
        
        performanceGraphData.push({
            altitude: cappedAlt,
            speed: h > finalServiceCeiling ? 0 : perfPoint.speed_kmh * aero.speed_mod,
            roc: h > finalServiceCeiling ? 0 : perfPoint.roc_ms
        });
        if (h >= finalServiceCeiling) break; // Stop after reaching ceiling
    }

    return {
        ...inputs,
        doctrineName: doctrineData ? doctrineData.name : '-',
        aircraftTypeName: typeData.name, aircraftTypeDescription: typeData.description,
        structureTypeName: structureData.name, structureTypeDescription: structureData.description,
        wingTypeName: wingData.name, wingTypeDescription: wingData.description,
        landingGearTypeName: landingGearData.name, landingGearTypeDescription: landingGearData.description,
        engineTypeName: engineData.name,
        propellerTypeName: propData.name, propellerTypeDescription: propData.description,
        coolingSystemName: gameData.components.cooling_systems[inputs.coolingSystem].name, coolingSystemDescription: gameData.components.cooling_systems[inputs.coolingSystem].description,
        fuelFeedName: gameData.components.fuel_feeds[inputs.fuelFeed].name, fuelFeedDescription: gameData.components.fuel_feeds[inputs.fuelFeed].description,
        superchargerName: superchargerData.name, superchargerDescription: superchargerData.description,
        defensiveTurretTypeName: turretData.name, defensiveTurretTypeDescription: turretData.description,
        finalUnitCost: finalUnitCost.toLocaleString('pt-BR'),
        totalWeight: `${Math.round(combatWeight).toLocaleString('pt-BR')} kg`,
        totalPower: `${Math.round(totalEnginePower).toLocaleString('pt-BR')} hp`,
        speedMax: `${Math.round(finalSpeedKmhAlt).toLocaleString('pt-BR')} km/h`,
        rateOfClimb: `${rate_of_climb_ms.toFixed(1)} m/s`,
        serviceCeiling: `${Math.round(finalServiceCeiling).toLocaleString('pt-BR')} m`,
        maxRange: `${Math.round(finalRangeKm).toLocaleString('pt-BR')} km`,
        turnTime: `${turn_time_s.toFixed(1)} s`, 
        reliability: `${finalReliability.toFixed(1)}%`,
        offensiveArmamentText: offensiveArmamentTexts.length > 0 ? offensiveArmamentTexts.join(', ') : "Nenhum",
        defensiveArmamentTexts: defensiveArmamentTexts,
        selectedWingFeatures: inputs.checkboxes.wing.map(id => gameData.components.wing_features[id].name),
        selectedEngineEnhancements: inputs.checkboxes.engine.map(id => gameData.components.engine_enhancements[id].name),
        selectedProtection: inputs.checkboxes.protection.map(id => gameData.components.protection[id].name),
        selectedCockpitComfort: inputs.checkboxes.cockpit.map(id => gameData.components.cockpit_comfort[id].name),
        selectedAdvancedAvionics: inputs.checkboxes.avionics.map(id => gameData.components.advanced_avionics[id].name),
        selectedEquipment: inputs.checkboxes.equipment.map(id => gameData.components.equipment[id].name),
        selectedMaintainabilityFeatures: inputs.checkboxes.maintainability.map(id => gameData.components.maintainability_features[id].name),
        performanceGraphData
    };
}

// --- INICIALIZAÇÃO ---
window.onload = function() {
    loadGameDataFromSheets();
    window.updateCalculations = updateCalculations;

    const summaryPanel = document.querySelector('.summary-panel');
    summaryPanel.addEventListener('click', (event) => {
        // Check if the click is not on an interactive element inside the panel
        if (event.target.closest('input, select, button, a')) {
            return;
        }

        const aircraftData = updateCalculations();
        if(aircraftData){
            localStorage.setItem('aircraftSheetData', JSON.stringify(aircraftData));
            localStorage.setItem('realWorldAircraftData', JSON.stringify(realWorldAircraft));
            window.open('ficha.html', '_blank');
        }
    });
};
