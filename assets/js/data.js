// assets/js/data.js

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
// URLs corrigidas para evitar o erro 404
export const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
export const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
export const AERONAVES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=565684512&single=true&output=csv';

// --- DADOS DO JOGO ---
export const gameData = {
    countries: {},
    doctrines: {
        air_superiority: { name: "Superioridade Aérea", description: "Foco em caças de alta performance para dominar os céus. Prioriza velocidade, manobrabilidade e poder de fogo ar-ar.", cost_modifier: 1.15, performance_bonus: { speed: 1.05, maneuverability: 1.10, rate_of_climb: 1.05 }, reliability_modifier: 0.95 },
        strategic_bombing: { name: "Bombardeio Estratégico", description: "Doutrina centrada em bombardeiros pesados de longo alcance para destruir a indústria e a moral inimiga.", cost_modifier: 1.20, performance_bonus: { range: 1.20, service_ceiling: 1.10 }, maneuverability_penalty: 0.85 },
        ground_support: { name: "Apoio Tático", description: "Uso de aeronaves para atacar alvos no campo de batalha. Prioriza robustez, capacidade de carga e operação em baixa altitude.", cost_modifier: 1.0, reliability_modifier: 1.10, armor_effectiveness_modifier: 1.10, speed_penalty: 0.90 },
        fleet_defense: { name: "Defesa de Frota", description: "Caças e bombardeiros baseados em porta-aviões. Requerem construção robusta, bom alcance e asas dobráveis.", cost_modifier: 1.25, reliability_modifier: 1.05, performance_bonus: { range: 1.10 }, weight_penalty: 1.05 }
    },
    components: {
        aircraft_types: {
            light_fighter: { name: "Caça Leve", cost: 40000, weight: 1500, metal_cost: 2000, crew: 1, wing_area_m2: 18, cl_max: 1.6, cd_0: 0.025, aspect_ratio: 6.0, oswald_efficiency: 0.8, reliability_base: 0.95, maneuverability_base: 1.15, limits: { min_speed: 450, max_speed: 750, min_range: 600, max_range: 2000 }, description: "Ágil e rápido, ideal para dogfights. Geralmente levemente armado e blindado." },
            heavy_fighter: { name: "Caça Pesado/Interceptor", cost: 75000, weight: 3500, metal_cost: 4000, crew: 2, wing_area_m2: 25, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 6.5, oswald_efficiency: 0.78, reliability_base: 0.90, maneuverability_base: 0.9, limits: { min_speed: 480, max_speed: 720, min_range: 1000, max_range: 2500 }, description: "Armamento pesado e boa performance em altitude para interceptar bombardeiros. Menos ágil que caças leves." },
            cas: { name: "Apoio Aéreo Próximo (CAS)", cost: 65000, weight: 3000, metal_cost: 3200, crew: 1, wing_area_m2: 28, cl_max: 1.7, cd_0: 0.038, aspect_ratio: 5.8, oswald_efficiency: 0.75, reliability_base: 0.98, maneuverability_base: 0.95, limits: { min_speed: 350, max_speed: 550, min_range: 500, max_range: 1500 }, description: "Robusto e bem armado para atacar alvos terrestres. Geralmente mais lento e blindado." },
            tactical_bomber: { name: "Bombardeiro Tático", cost: 120000, weight: 5000, metal_cost: 6000, crew: 4, wing_area_m2: 50, cl_max: 1.4, cd_0: 0.033, aspect_ratio: 7.0, oswald_efficiency: 0.82, reliability_base: 0.92, maneuverability_base: 0.7, limits: { min_speed: 400, max_speed: 600, min_range: 1200, max_range: 3000 }, description: "Velocidade e alcance para atacar alvos táticos atrás das linhas inimigas. Carga de bombas moderada." },
            strategic_bomber: { name: "Bombardeiro Estratégico", cost: 250000, weight: 12000, metal_cost: 10000, crew: 7, wing_area_m2: 100, cl_max: 1.5, cd_0: 0.030, aspect_ratio: 8.5, oswald_efficiency: 0.85, reliability_base: 0.88, maneuverability_base: 0.5, limits: { min_speed: 380, max_speed: 580, min_range: 3000, max_range: 6000 }, description: "Longo alcance e grande capacidade de bombas para missões estratégicas profundas em território inimigo." },
            zeppelin: { name: "Zeppelin", cost: 500000, weight: 50000, metal_cost: 15000, crew: 20, wing_area_m2: 500, cl_max: 0.8, cd_0: 0.020, aspect_ratio: 1.0, oswald_efficiency: 0.7, reliability_base: 0.90, maneuverability_base: 0.1, limits: { min_speed: 80, max_speed: 150, min_range: 5000, max_range: 15000 }, description: "Dirigível gigante para bombardeio ou reconhecimento. Lento e vulnerável, mas com alcance e carga imensos." },
            naval_fighter: { name: "Caça Naval", cost: 60000, weight: 2200, metal_cost: 2800, crew: 1, wing_area_m2: 22, cl_max: 1.65, cd_0: 0.028, aspect_ratio: 5.5, oswald_efficiency: 0.78, reliability_base: 0.93, maneuverability_base: 1.0, limits: { min_speed: 420, max_speed: 680, min_range: 800, max_range: 2200 }, description: "Caça adaptado para operações em porta-aviões, com estrutura reforçada e geralmente asas dobráveis." },
            naval_cas: { name: "CAS Naval", cost: 90000, weight: 4000, metal_cost: 4500, crew: 2, wing_area_m2: 35, cl_max: 1.75, cd_0: 0.040, aspect_ratio: 5.2, oswald_efficiency: 0.72, reliability_base: 0.96, maneuverability_base: 0.85, limits: { min_speed: 320, max_speed: 520, min_range: 700, max_range: 1800 }, description: "Aeronave de ataque naval, incluindo bombardeiros de mergulho e torpedeiros." },
            naval_bomber: { name: "Bombardeiro Naval", cost: 150000, weight: 6000, metal_cost: 7000, crew: 4, wing_area_m2: 60, cl_max: 1.5, cd_0: 0.035, aspect_ratio: 7.5, oswald_efficiency: 0.8, reliability_base: 0.90, maneuverability_base: 0.6, limits: { min_speed: 380, max_speed: 550, min_range: 2000, max_range: 4000 }, description: "Bombardeiro médio/pesado adaptado para operações navais, geralmente baseado em terra." },
            naval_recon: { name: "Reconhecimento Naval", cost: 45000, weight: 2000, metal_cost: 2000, crew: 2, wing_area_m2: 25, cl_max: 1.4, cd_0: 0.027, aspect_ratio: 8.0, oswald_efficiency: 0.85, reliability_base: 0.97, maneuverability_base: 0.8, limits: { min_speed: 250, max_speed: 450, min_range: 1500, max_range: 5000 }, description: "Aeronave de longo alcance para patrulha marítima e reconhecimento." },
            transport: { name: "Transporte", cost: 100000, weight: 8000, metal_cost: 5000, crew: 4, wing_area_m2: 80, cl_max: 1.8, cd_0: 0.042, aspect_ratio: 7.0, oswald_efficiency: 0.75, reliability_base: 0.95, maneuverability_base: 0.4, limits: { min_speed: 200, max_speed: 400, min_range: 1000, max_range: 3500 }, description: "Projetado para transportar tropas ou carga. Lento e vulnerável, com pouca ou nenhuma capacidade de combate." },
            seaplane: { name: "Hidroavião", cost: 55000, weight: 2500, metal_cost: 2500, crew: 3, wing_area_m2: 30, cl_max: 1.5, cd_0: 0.048, aspect_ratio: 6.0, oswald_efficiency: 0.7, reliability_base: 0.94, maneuverability_base: 0.75, limits: { min_speed: 220, max_speed: 420, min_range: 800, max_range: 2500 }, description: "Capaz de pousar e decolar da água. Usado para reconhecimento, patrulha e resgate." },
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
            skis: { name: "Esquis", cost: 5000, weight: 80, metal_cost: 100, drag_mod: 1.12, reliability_mod: 1.0, description: "Permite operações em superfícies nevadas ou geladas. Aumenta o arrasto." },
            floats: { name: "Flutuadores", cost: 15000, weight: 300, metal_cost: 200, drag_mod: 1.20, reliability_mod: 1.0, description: "Permite pousos e decolagens na água. Aumenta significativamente o peso e o arrasto." }
        },
        engines: {
            radial_7: { name: "Motor Radial 7 cilindros", cost: 15000, weight: 350, metal_cost: 1200, min_power: 200, max_power: 500, reliability: 0.95, frontal_area_mod: 1.1, bsfc_g_per_kwh: 320, description: "Simples e confiável, mas com grande arrasto. Bom para aeronaves de treinamento ou leves." },
            radial_11: { name: "Motor Radial 11 cilindros", cost: 25000, weight: 500, metal_cost: 2000, min_power: 400, max_power: 1000, reliability: 0.93, frontal_area_mod: 1.2, bsfc_g_per_kwh: 310, description: "Potência decente com boa confiabilidade. Um motor comum para caças e bombardeiros leves." },
            radial_16: { name: "Motor Radial 16 cilindros", cost: 45000, weight: 800, metal_cost: 3500, min_power: 800, max_power: 1600, reliability: 0.90, frontal_area_mod: 1.3, bsfc_g_per_kwh: 300, description: "Motor de dupla estrela potente, para caças pesados e bombardeiros médios." },
            radial_18: { name: "Motor Radial 18 cilindros", cost: 60000, weight: 1100, metal_cost: 4500, min_power: 1200, max_power: 2200, reliability: 0.85, frontal_area_mod: 1.4, bsfc_g_per_kwh: 290, description: "Extremamente potente, mas pesado e complexo. Usado nos maiores bombardeiros e caças de final de período." },
            rotary_9: { name: "Motor Rotativo 9 cilindros", cost: 10000, weight: 150, metal_cost: 800, min_power: 80, max_power: 200, reliability: 0.75, frontal_area_mod: 1.0, bsfc_g_per_kwh: 350, description: "Design da Grande Guerra. Leve, mas o efeito giroscópico torna a pilotagem difícil. Obsoleto e pouco confiável." },
            v8: { name: "Motor V8", cost: 20000, weight: 400, metal_cost: 1800, min_power: 300, max_power: 700, reliability: 0.90, frontal_area_mod: 0.85, bsfc_g_per_kwh: 300, description: "Motor em V refrigerado a líquido. Menor arrasto que um radial, mas sistema de refrigeração mais vulnerável." },
            v12: { name: "Motor V12", cost: 35000, weight: 600, metal_cost: 2500, min_power: 600, max_power: 1500, reliability: 0.88, frontal_area_mod: 0.80, bsfc_g_per_kwh: 290, description: "O motor de caça de alta performance por excelência. Perfil fino, alta potência, mas complexo." },
            v16: { name: "Motor V16", cost: 55000, weight: 850, metal_cost: 4000, min_power: 1000, max_power: 2000, reliability: 0.82, frontal_area_mod: 0.9, bsfc_g_per_kwh: 285, description: "Experimental e potente. Pesado e propenso a problemas de confiabilidade." },
            v24: { name: "Motor V24", cost: 80000, weight: 1200, metal_cost: 6000, min_power: 1800, max_power: 3000, reliability: 0.70, frontal_area_mod: 1.0, bsfc_g_per_kwh: 280, description: "Monstro de potência, essencialmente dois V12 juntos. Extremamente pesado, caro e não confiável." },
        },
        engine_enhancements: {
            ducted_radiators: { name: "Radiadores Dutados", cost: 10000, weight: 30, metal_cost: 80, drag_mod: 0.97, reliability_mod: 0.98, description: "Radiadores integrados na fuselagem ou asas, reduzindo significativamente o arrasto em comparação com radiadores externos. Aumenta a complexidade." },
            intercoolers: { name: "Intercoolers", cost: 8000, weight: 25, metal_cost: 70, power_mod: 1.03, reliability_mod: 0.95, description: "Resfria o air comprimido pelo superalimentador, aumentando a densidade do ar e a potência do motor, mas adiciona complexidade e pontos de falha." }
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
            injection: { name: "Injeção de Combustível", cost: 12000, weight: 20, reliability_mod: 1.05, performance_mod: 1.07, description: "Fornece combustível de forma precisa e confiável em qualquer atitude de voo. Aumenta a performance, mas é uma tecnologia cara e avançada." }
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
            basic_autopilot: { name: "Piloto Automático Básico", cost: 15000, weight: 40, metal_cost: 100, range_mod: 1.05, reliability_mod: 1.03, description: "Sistema básico que ajuda a manter o curso e a altitude, reduzindo a fatiga do piloto em voos longos e melhorando a confiabilidade em missões estendidas." },
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

// --- DADOS DE AERONAVES REAIS ---
export const realWorldAircraft = [
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

// --- FUNÇÕES DE CARREGAMENTO E PARSE DE DADOS ---
/**
 * Limpa e converte um valor para float.
 * Remove caracteres de moeda, pontos de milhar e vírgulas decimais.
 * @param {string|number} value - O valor a ser limpo e convertido.
 * @returns {number} - O valor numérico limpo.
 */
export function cleanAndParseFloat(value) {
    if (typeof value !== 'string') return parseFloat(value) || 0;
    const cleanedValue = value.trim().replace('£', '').replace(/\./g, '').replace(',', '.').replace('%', '');
    return parseFloat(cleanedValue) || 0;
}

/**
 * Faz o parse de um CSV a partir de uma URL.
 * @param {string} url - A URL do arquivo CSV.
 * @returns {Promise<Array<object>>} - Uma promessa que resolve para um array de objetos, onde cada objeto é uma linha do CSV.
 */
export async function parseCSV(url) {
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

/**
 * Carrega os dados do jogo (países, capacidades) a partir das planilhas do Google Sheets.
 */
export async function loadGameDataFromSheets() {
    const countryDropdown = document.getElementById('country_doctrine');
    if (countryDropdown) {
        countryDropdown.innerHTML = '<option value="loading">Carregando dados...</option>';
        countryDropdown.disabled = true;
    }

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
                    tech_level_air: cleanAndParseFloat(row['Aeronáutica']),
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

        // Adiciona um país genérico/padrão para fallback
        tempCountries["Genérico / Padrão"] = { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 };

        gameData.countries = tempCountries;
        populateCountryDropdown();
        if (countryDropdown) countryDropdown.disabled = false;

    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        if (countryDropdown) {
            countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
            countryDropdown.disabled = false;
        }
        // Fallback para dados genéricos em caso de falha no carregamento
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_air: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
    }
}

/**
 * Popula o dropdown de seleção de país com os dados carregados.
 */
export function populateCountryDropdown() {
    const dropdown = document.getElementById('country_doctrine');
    if (!dropdown) return;
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
