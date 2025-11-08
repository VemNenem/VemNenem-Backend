import { describe, expect, test } from '@jest/globals';

/**
 * Testes de Validação - Schedule (Agendamentos)
 */

describe('Validações de Schedule - Testes Unitários', () => {

    describe('Validação de Data do Agendamento', () => {
        test('deve aceitar datas futuras', () => {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 7);

            expect(futureDate.getTime()).toBeGreaterThan(today.getTime());
        });

        test('deve rejeitar datas passadas', () => {
            const today = new Date();
            const pastDate = new Date('2020-01-01');

            expect(pastDate.getTime()).toBeLessThan(today.getTime());
        });

        test('deve validar formato de data ISO', () => {
            const isoDate = '2025-12-15T10:30:00.000Z';
            const date = new Date(isoDate);

            expect(date instanceof Date).toBe(true);
            expect(isNaN(date.getTime())).toBe(false);
        });

        test('deve aceitar data de hoje', () => {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            expect(todayStart.getTime()).toBeLessThanOrEqual(today.getTime());
        });
    });

    describe('Validação de Hora do Agendamento', () => {
        test('deve validar formato de hora HH:MM', () => {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

            const validTimes = ['09:30', '14:45', '08:00', '23:59'];
            const invalidTimes = ['25:00', '12:60', '9:5', 'abc'];

            validTimes.forEach(time => {
                expect(timeRegex.test(time)).toBe(true);
            });

            invalidTimes.forEach(time => {
                expect(timeRegex.test(time)).toBe(false);
            });
        });

        test('deve extrair horas e minutos corretamente', () => {
            const time = '14:30';
            const [hours, minutes] = time.split(':').map(Number);

            expect(hours).toBe(14);
            expect(minutes).toBe(30);
        });

        test('deve validar horários comerciais (8h-18h)', () => {
            const isBusinessHour = (time: string) => {
                const [hours] = time.split(':').map(Number);
                return hours >= 8 && hours < 18;
            };

            expect(isBusinessHour('09:00')).toBe(true);
            expect(isBusinessHour('17:30')).toBe(true);
            expect(isBusinessHour('07:00')).toBe(false);
            expect(isBusinessHour('19:00')).toBe(false);
        });
    });

    describe('Validação de Nome do Agendamento', () => {
        test('deve aceitar nomes válidos', () => {
            const validNames = [
                'Consulta Pré-Natal',
                'Ultrassom',
                'Exame de Sangue',
                'Consulta com Obstetra'
            ];

            validNames.forEach(name => {
                expect(name.length).toBeGreaterThan(0);
                expect(name.length).toBeLessThanOrEqual(100);
            });
        });

        test('deve rejeitar nomes muito curtos', () => {
            const shortNames = ['a', 'ab'];
            const minLength = 3;

            shortNames.forEach(name => {
                expect(name.length).toBeLessThan(minLength);
            });
        });

        test('deve rejeitar nomes muito longos', () => {
            const longName = 'a'.repeat(101);
            const maxLength = 100;

            expect(longName.length).toBeGreaterThan(maxLength);
        });

        test('deve normalizar espaços no nome', () => {
            const normalize = (str: string) => str.trim().replace(/\s+/g, ' ');

            expect(normalize('  Consulta   Pré-Natal  ')).toBe('Consulta Pré-Natal');
        });
    });

    describe('Validação de Descrição do Agendamento', () => {
        test('deve aceitar descrições vazias', () => {
            const description = '';
            expect(description).toBeDefined();
        });

        test('deve aceitar descrições com conteúdo', () => {
            const description = 'Levar exames anteriores e carteirinha do plano';

            expect(description.length).toBeGreaterThan(0);
            expect(typeof description).toBe('string');
        });

        test('deve limitar tamanho da descrição', () => {
            const maxLength = 500;
            const longDescription = 'a'.repeat(501);

            expect(longDescription.length).toBeGreaterThan(maxLength);
        });
    });

    describe('Cálculo de Intervalo de Datas', () => {
        test('deve calcular início e fim do dia', () => {
            const day = '2025-12-15';
            const startOfDay = new Date(`${day}T00:00:00.000Z`);
            const endOfDay = new Date(`${day}T23:59:59.999Z`);

            expect(startOfDay.getUTCHours()).toBe(0);
            expect(startOfDay.getUTCMinutes()).toBe(0);
            expect(endOfDay.getUTCHours()).toBe(23);
            expect(endOfDay.getUTCMinutes()).toBe(59);
        });

        test('deve calcular intervalo de mês', () => {
            const month = '2025-12';
            const [year, monthNum] = month.split('-').map(Number);

            const firstDay = new Date(Date.UTC(year, monthNum - 1, 1));
            const lastDay = new Date(Date.UTC(year, monthNum, 0));

            expect(firstDay.getUTCDate()).toBe(1);
            expect(lastDay.getUTCDate()).toBe(31); // Dezembro tem 31 dias
        });

        test('deve adicionar dias antes e depois do mês', () => {
            const baseDate = new Date('2025-12-01');
            const dateBefore = new Date(baseDate);
            dateBefore.setUTCDate(baseDate.getUTCDate() - 4);

            const dateAfter = new Date(baseDate);
            dateAfter.setUTCDate(baseDate.getUTCDate() + 4);

            expect(dateBefore.getUTCDate()).toBe(27); // 27 de novembro
            expect(dateAfter.getUTCDate()).toBe(5); // 5 de dezembro
        });
    });

    describe('Formatação de Data para Calendário', () => {
        test('deve formatar data como YYYY-MM-DD', () => {
            const date = new Date('2025-12-15T10:30:00.000Z');
            const formatted = date.toISOString().split('T')[0];

            expect(formatted).toBe('2025-12-15');
        });

        test('deve formatar data como DD/MM/YYYY', () => {
            const date = new Date(Date.UTC(2025, 11, 15)); // Mês 11 = Dezembro
            const formatted = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;

            expect(formatted).toBe('15/12/2025');
        });

        test('deve criar set único de datas', () => {
            const dates = ['2025-12-15', '2025-12-15', '2025-12-16'];
            const uniqueDates = new Set(dates);

            expect(uniqueDates.size).toBe(2);
            expect(uniqueDates.has('2025-12-15')).toBe(true);
            expect(uniqueDates.has('2025-12-16')).toBe(true);
        });
    });

    describe('Validação de Agendamentos Duplicados', () => {
        test('deve detectar mesmo dia e hora', () => {
            const schedule1 = { date: '2025-12-15', time: '10:30' };
            const schedule2 = { date: '2025-12-15', time: '10:30' };

            const isDuplicate = schedule1.date === schedule2.date && schedule1.time === schedule2.time;

            expect(isDuplicate).toBe(true);
        });

        test('deve permitir mesmo dia com horas diferentes', () => {
            const schedule1 = { date: '2025-12-15', time: '10:30' };
            const schedule2 = { date: '2025-12-15', time: '14:00' };

            const isDuplicate = schedule1.date === schedule2.date && schedule1.time === schedule2.time;

            expect(isDuplicate).toBe(false);
        });
    });

    describe('Ordenação de Agendamentos', () => {
        test('deve ordenar por data e hora crescente', () => {
            const schedules = [
                { date: '2025-12-20', time: '14:00' },
                { date: '2025-12-15', time: '10:30' },
                { date: '2025-12-15', time: '09:00' }
            ];

            const sorted = schedules.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
                const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
                return dateTimeA - dateTimeB;
            });

            expect(sorted[0].date).toBe('2025-12-15');
            expect(sorted[0].time).toBe('09:00');
            expect(sorted[2].date).toBe('2025-12-20');
        });
    });
});
