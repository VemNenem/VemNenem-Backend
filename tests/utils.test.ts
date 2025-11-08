import { describe, expect, test } from '@jest/globals';

/**
 * Testes de Funções Utilitárias
 */

describe('Utilitários - Testes Manuais', () => {

    describe('Manipulação de Datas', () => {
        test('deve calcular semanas de gestação', () => {
            const today = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 140); // 20 semanas (140 dias)

            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeksRemaining = Math.floor(diffDays / 7);

            expect(weeksRemaining).toBeGreaterThanOrEqual(19);
            expect(weeksRemaining).toBeLessThanOrEqual(21);
        });

        test('deve formatar data para exibição', () => {
            const date = new Date('2025-12-01');
            const formatted = date.toLocaleDateString('pt-BR');

            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
        });

        test('deve verificar se data é válida', () => {
            const validDate = new Date('2025-12-01');
            const invalidDate = new Date('invalid');

            expect(isNaN(validDate.getTime())).toBe(false);
            expect(isNaN(invalidDate.getTime())).toBe(true);
        });
    });

    describe('Formatação de Strings', () => {
        test('deve capitalizar primeira letra', () => {
            const capitalize = (str: string) =>
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

            expect(capitalize('maria')).toBe('Maria');
            expect(capitalize('JOÃO')).toBe('João');
            expect(capitalize('aNa')).toBe('Ana');
        });

        test('deve normalizar nome completo', () => {
            const normalizeName = (name: string) =>
                name.trim().split(/\s+/).map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');

            expect(normalizeName('  maria  silva  ')).toBe('Maria Silva');
            expect(normalizeName('JOÃO PEDRO SANTOS')).toBe('João Pedro Santos');
        });

        test('deve remover caracteres especiais', () => {
            const removeSpecialChars = (str: string) =>
                str.replace(/[^a-zA-Z0-9\s]/g, '');

            expect(removeSpecialChars('Maria@Silva#123')).toBe('MariaSilva123');
            expect(removeSpecialChars('Test!@#$%')).toBe('Test');
        });
    });

    describe('Validação de CPF (exemplo)', () => {
        test('deve validar formato de CPF', () => {
            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

            const validFormat = '123.456.789-00';
            const invalidFormat = '12345678900';

            expect(cpfRegex.test(validFormat)).toBe(true);
            expect(cpfRegex.test(invalidFormat)).toBe(false);
        });

        test('deve remover formatação de CPF', () => {
            const removeCPFFormat = (cpf: string) => cpf.replace(/\D/g, '');

            expect(removeCPFFormat('123.456.789-00')).toBe('12345678900');
            expect(removeCPFFormat('123.456.789-00').length).toBe(11);
        });
    });

    describe('Validação de Telefone', () => {
        test('deve validar formato de telefone brasileiro', () => {
            const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

            const validPhones = ['(11) 98888-7777', '(21) 3333-4444'];
            const invalidPhones = ['1198888777', '(11)988887777'];

            validPhones.forEach(phone => {
                expect(phoneRegex.test(phone)).toBe(true);
            });

            invalidPhones.forEach(phone => {
                expect(phoneRegex.test(phone)).toBe(false);
            });
        });

        test('deve extrair DDD do telefone', () => {
            const extractDDD = (phone: string) => {
                const match = phone.match(/\((\d{2})\)/);
                return match ? match[1] : null;
            };

            expect(extractDDD('(11) 98888-7777')).toBe('11');
            expect(extractDDD('(21) 3333-4444')).toBe('21');
            expect(extractDDD('988887777')).toBeNull();
        });
    });

    describe('Cálculo de Idade', () => {
        test('deve calcular idade a partir da data de nascimento', () => {
            const calculateAge = (birthDate: Date) => {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                return age;
            };

            const birthDate = new Date('1990-01-01');
            const age = calculateAge(birthDate);

            expect(age).toBeGreaterThanOrEqual(30);
            expect(typeof age).toBe('number');
        });
    });

    describe('Geração de Códigos', () => {
        test('deve gerar código aleatório', () => {
            const generateCode = (length: number) => {
                return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
            };

            const code1 = generateCode(6);
            const code2 = generateCode(6);

            expect(code1.length).toBeLessThanOrEqual(6);
            expect(code2.length).toBeLessThanOrEqual(6);
            expect(code1).not.toBe(code2); // Probabilidade muito alta de serem diferentes
        });

        test('deve gerar UUID simples', () => {
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const uuid = generateUUID();

            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });
    });

    describe('Máscaras de Dados', () => {
        test('deve mascarar email', () => {
            const maskEmail = (email: string) => {
                const [username, domain] = email.split('@');
                const maskedUsername = username.charAt(0) + '***' + username.slice(-1);
                return `${maskedUsername}@${domain}`;
            };

            expect(maskEmail('maria@example.com')).toBe('m***a@example.com');
            expect(maskEmail('joao@test.com')).toBe('j***o@test.com');
        });

        test('deve mascarar telefone', () => {
            const maskPhone = (phone: string) => {
                // Remove não-dígitos e mascara o meio do número
                const cleaned = phone.replace(/\D/g, '');
                return cleaned.replace(/(\d{2})\d{4,5}(\d{4})/, '$1****$2');
            };

            expect(maskPhone('11988887777')).toBe('11****7777');
            expect(maskPhone('(11) 98888-7777')).toBe('11****7777');
        });
    });

    describe('Arrays e Listas', () => {
        test('deve remover duplicatas de array', () => {
            const removeDuplicates = (arr: any[]) => [...new Set(arr)];

            const withDuplicates = [1, 2, 2, 3, 4, 4, 5];
            const unique = removeDuplicates(withDuplicates);

            expect(unique).toEqual([1, 2, 3, 4, 5]);
            expect(unique.length).toBe(5);
        });

        test('deve ordenar array de objetos por propriedade', () => {
            const clients = [
                { name: 'Maria', age: 30 },
                { name: 'Ana', age: 25 },
                { name: 'João', age: 35 },
            ];

            const sorted = [...clients].sort((a, b) => a.age - b.age);

            expect(sorted[0].name).toBe('Ana');
            expect(sorted[2].name).toBe('João');
        });

        test('deve filtrar array por condição', () => {
            const clients = [
                { name: 'Maria', active: true },
                { name: 'Ana', active: false },
                { name: 'João', active: true },
            ];

            const activeClients = clients.filter(c => c.active);

            expect(activeClients.length).toBe(2);
            expect(activeClients.every(c => c.active)).toBe(true);
        });
    });

    describe('Objetos', () => {
        test('deve mesclar objetos', () => {
            const obj1 = { name: 'Maria', age: 30 };
            const obj2 = { email: 'maria@example.com', age: 31 };

            const merged = { ...obj1, ...obj2 };

            expect(merged).toEqual({
                name: 'Maria',
                age: 31,
                email: 'maria@example.com'
            });
        });

        test('deve extrair propriedades específicas', () => {
            const client = {
                id: 1,
                name: 'Maria',
                email: 'maria@example.com',
                password: 'secret',
            };

            const { password, ...safeClient } = client;

            expect(safeClient).not.toHaveProperty('password');
            expect(safeClient).toHaveProperty('name');
            expect(safeClient).toHaveProperty('email');
        });
    });
});
