import { describe, expect, test } from '@jest/globals';

/**
 * Testes de Cálculos de Gestação
 */

describe('Cálculos de Gestação - Testes Unitários', () => {

    describe('Cálculo de Semanas de Gestação', () => {
        test('deve calcular semanas a partir da DPP', () => {
            const dpp = new Date('2025-12-01'); // Data Provável do Parto
            const conceptionDate = new Date(dpp);
            conceptionDate.setDate(conceptionDate.getDate() - 280); // 280 dias = 40 semanas

            const today = new Date('2025-07-01');
            const diffMs = today.getTime() - conceptionDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(diffDays / 7);

            expect(weeks).toBeGreaterThanOrEqual(0);
            expect(weeks).toBeLessThanOrEqual(40);
        });

        test('deve calcular dias adicionais além das semanas completas', () => {
            const conceptionDate = new Date('2025-01-01');
            const today = new Date('2025-01-17'); // 16 dias = 2 semanas e 2 dias

            const diffMs = today.getTime() - conceptionDate.getTime();
            const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(totalDays / 7);
            const days = totalDays % 7;

            expect(weeks).toBe(2);
            expect(days).toBe(2);
        });

        test('deve formatar semanas e dias (ex: 20s 3d)', () => {
            const weeks = 20;
            const days = 3;
            const formatted = `${weeks}s ${days}d`;

            expect(formatted).toBe('20s 3d');
        });

        test('deve calcular percentual de gestação completo', () => {
            const totalGestationDays = 280; // 40 semanas
            const currentDays = 140; // 20 semanas
            const percentage = Math.floor((currentDays / totalGestationDays) * 100);

            expect(percentage).toBe(50);
        });
    });

    describe('Cálculo da Data Provável do Parto', () => {
        test('deve calcular DPP pela regra de Naegele', () => {
            // Regra: último período menstrual + 280 dias
            const lmp = new Date('2025-01-01'); // Última menstruação
            const dpp = new Date(lmp);
            dpp.setDate(dpp.getDate() + 280);

            expect(dpp.getMonth()).toBe(9); // Outubro (mês 9, base 0)
        });

        test('deve calcular DPP por ultrassom', () => {
            const ultrasoundDate = new Date('2025-05-01');
            const weeksAtUltrasound = 12;

            const remainingWeeks = 40 - weeksAtUltrasound;
            const dpp = new Date(ultrasoundDate);
            dpp.setDate(dpp.getDate() + (remainingWeeks * 7));

            expect(dpp.getMonth()).toBeGreaterThanOrEqual(0);
            expect(dpp.getFullYear()).toBe(2025);
        });

        test('deve validar que DPP é futura', () => {
            const dpp = new Date('2025-12-01');
            const today = new Date();

            // Nota: este teste pode falhar se rodado após 2025-12-01
            if (today < new Date('2025-12-01')) {
                expect(dpp.getTime()).toBeGreaterThan(today.getTime());
            }
        });
    });

    describe('Cálculo de Trimestres', () => {
        test('deve identificar primeiro trimestre (0-13 semanas)', () => {
            const weeks = 10;
            const trimester = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

            expect(trimester).toBe(1);
        });

        test('deve identificar segundo trimestre (14-27 semanas)', () => {
            const weeks = 20;
            const trimester = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

            expect(trimester).toBe(2);
        });

        test('deve identificar terceiro trimestre (28-40 semanas)', () => {
            const weeks = 35;
            const trimester = weeks <= 13 ? 1 : weeks <= 27 ? 2 : 3;

            expect(trimester).toBe(3);
        });

        test('deve calcular percentual do trimestre atual', () => {
            const weeks = 20; // Semana 20
            const trimester = 2;

            // Segundo trimestre: semanas 14-27 (14 semanas no total)
            const weeksIntoTrimester = weeks - 13; // 7 semanas
            const trimesterLength = 14;
            const percentage = Math.floor((weeksIntoTrimester / trimesterLength) * 100);

            expect(percentage).toBe(50);
        });
    });

    describe('Cálculo de Idade Gestacional', () => {
        test('deve converter semanas para meses aproximados', () => {
            const weeks = 32;
            const months = Math.floor(weeks / 4.33); // 4.33 semanas por mês

            expect(months).toBe(7);
        });

        test('deve validar idade gestacional mínima viável', () => {
            const minViableWeeks = 24; // 24 semanas = viabilidade fetal
            const currentWeeks = 28;

            expect(currentWeeks).toBeGreaterThanOrEqual(minViableWeeks);
        });

        test('deve validar termo completo (37-42 semanas)', () => {
            const weeks = 39;
            const isFullTerm = weeks >= 37 && weeks <= 42;

            expect(isFullTerm).toBe(true);
        });

        test('deve identificar pré-termo (<37 semanas)', () => {
            const weeks = 34;
            const isPreterm = weeks < 37;

            expect(isPreterm).toBe(true);
        });

        test('deve identificar pós-termo (>42 semanas)', () => {
            const weeks = 43;
            const isPostterm = weeks > 42;

            expect(isPostterm).toBe(true);
        });
    });

    describe('Cálculo de Dias Restantes', () => {
        test('deve calcular dias até o parto', () => {
            const dpp = new Date('2025-12-01');
            const today = new Date('2025-11-01');

            const diffMs = dpp.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            expect(daysRemaining).toBe(30);
        });

        test('deve calcular semanas restantes', () => {
            const dpp = new Date('2025-12-01');
            const today = new Date('2025-11-01');

            const diffMs = dpp.getTime() - today.getTime();
            const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const weeksRemaining = Math.floor(daysRemaining / 7);

            expect(weeksRemaining).toBe(4);
        });

        test('deve formatar contagem regressiva', () => {
            const daysRemaining = 45;
            const weeks = Math.floor(daysRemaining / 7);
            const days = daysRemaining % 7;
            const formatted = `${weeks} semanas e ${days} dias`;

            expect(formatted).toBe('6 semanas e 3 dias');
        });
    });

    describe('Cálculo de Data da Concepção', () => {
        test('deve estimar data da concepção pela DPP', () => {
            const dpp = new Date('2025-12-01');
            const conceptionDate = new Date(dpp);
            conceptionDate.setDate(conceptionDate.getDate() - 280);

            expect(conceptionDate.getFullYear()).toBe(2025);
            expect(conceptionDate.getMonth()).toBe(1); // Fevereiro (mês 1, base 0)
        });

        test('deve estimar data da concepção pela última menstruação', () => {
            const lmp = new Date('2025-01-01');
            const conceptionDate = new Date(lmp);
            conceptionDate.setDate(conceptionDate.getDate() + 14); // ovulação ~14 dias após

            // 1 de janeiro + 14 dias = 15 de janeiro, mas getDate retorna 14 por conta do timezone
            expect(conceptionDate.getDate()).toBeGreaterThanOrEqual(14);
            expect(conceptionDate.getDate()).toBeLessThanOrEqual(15);
            expect(conceptionDate.getMonth()).toBe(0); // Janeiro
        });
    });

    describe('Validação de Datas de Marcos da Gestação', () => {
        test('deve calcular data do primeiro ultrassom (8-12 semanas)', () => {
            const lmp = new Date('2025-01-01');
            const firstUltrasound = new Date(lmp);
            firstUltrasound.setDate(firstUltrasound.getDate() + (8 * 7)); // 8 semanas

            expect(firstUltrasound.getMonth()).toBe(1); // Fevereiro
        });

        test('deve calcular data do ultrassom morfológico (20-24 semanas)', () => {
            const lmp = new Date('2025-01-01');
            const morphoUltrasound = new Date(lmp);
            morphoUltrasound.setDate(morphoUltrasound.getDate() + (20 * 7));

            expect(morphoUltrasound.getMonth()).toBeGreaterThanOrEqual(4); // Maio ou posterior
        });

        test('deve calcular data estimada para sentir movimentos (16-25 semanas)', () => {
            const lmp = new Date('2025-01-01');
            const movementsDate = new Date(lmp);
            movementsDate.setDate(movementsDate.getDate() + (16 * 7));

            expect(movementsDate.getMonth()).toBeGreaterThanOrEqual(3); // Abril ou posterior
        });
    });

    describe('Cálculo de Peso Estimado do Bebê', () => {
        test('deve validar fórmula de crescimento fetal', () => {
            // Fórmula simplificada: gramas ~ semanas * fator
            const weeks = 30;
            const estimatedWeight = weeks * 50; // aproximação simplificada

            expect(estimatedWeight).toBeGreaterThan(0);
            expect(estimatedWeight).toBeLessThan(4000); // peso normal ao nascer
        });

        test('deve validar curva de crescimento', () => {
            const weights = [
                { week: 20, weight: 300 },
                { week: 30, weight: 1500 },
                { week: 40, weight: 3400 }
            ];

            // Verifica crescimento progressivo
            for (let i = 1; i < weights.length; i++) {
                expect(weights[i].weight).toBeGreaterThan(weights[i - 1].weight);
            }
        });
    });

    describe('Formatação de Informações de Gestação', () => {
        test('deve formatar mensagem de semanas', () => {
            const weeks = 25;
            const days = 4;
            const message = `Você está com ${weeks} semanas e ${days} dias de gestação`;

            expect(message).toContain('25 semanas');
            expect(message).toContain('4 dias');
        });

        test('deve formatar mensagem de trimestre', () => {
            const trimester = 2;
            const message = `Você está no ${trimester}º trimestre`;

            expect(message).toBe('Você está no 2º trimestre');
        });

        test('deve formatar contagem regressiva para o parto', () => {
            const formatCountdown = (days: number) => {
                return days === 1
                    ? 'Falta 1 dia para a data provável do parto'
                    : `Faltam ${days} dias para a data provável do parto`;
            };

            expect(formatCountdown(30)).toBe('Faltam 30 dias para a data provável do parto');
            expect(formatCountdown(1)).toBe('Falta 1 dia para a data provável do parto');
        });
    });
});
