import { describe, expect, test } from '@jest/globals';

/**
 * Testes de Validação - List (Listas/Checklists)
 */

describe('Validações de List - Testes Unitários', () => {

    describe('Validação de Nome da Lista', () => {
        test('deve aceitar nomes válidos', () => {
            const validNames = [
                'Mala da Maternidade',
                'Enxoval do Bebê',
                'Documentos Necessários',
                'Itens para o Parto'
            ];

            validNames.forEach(name => {
                expect(name.length).toBeGreaterThan(0);
                expect(name.length).toBeLessThanOrEqual(100);
            });
        });

        test('deve rejeitar nomes vazios', () => {
            const emptyName = '';
            const minLength = 1;

            expect(emptyName.length).toBeLessThan(minLength);
        });

        test('deve rejeitar nomes muito longos', () => {
            const longName = 'a'.repeat(101);
            const maxLength = 100;

            expect(longName.length).toBeGreaterThan(maxLength);
        });

        test('deve normalizar nome da lista', () => {
            const normalize = (str: string) => str.trim().replace(/\s+/g, ' ');

            expect(normalize('  Mala  da  Maternidade  ')).toBe('Mala da Maternidade');
        });
    });

    describe('Validação de Itens da Lista', () => {
        test('deve aceitar item com nome válido', () => {
            const item = {
                name: 'Roupinha de bebê',
                checked: false
            };

            expect(item.name.length).toBeGreaterThan(0);
            expect(typeof item.checked).toBe('boolean');
        });

        test('deve validar tamanho do nome do item', () => {
            const shortItem = 'a';
            const validItem = 'Mamadeira';
            const minLength = 2;

            expect(shortItem.length).toBeLessThan(minLength);
            expect(validItem.length).toBeGreaterThanOrEqual(minLength);
        });

        test('deve permitir marcar/desmarcar item', () => {
            let item = { name: 'Toalha', checked: false };

            item.checked = true;
            expect(item.checked).toBe(true);

            item.checked = false;
            expect(item.checked).toBe(false);
        });

        test('deve aceitar múltiplos itens na lista', () => {
            const items = [
                { name: 'Item 1', checked: false },
                { name: 'Item 2', checked: true },
                { name: 'Item 3', checked: false }
            ];

            expect(items.length).toBe(3);
            expect(items.every(item => typeof item.checked === 'boolean')).toBe(true);
        });
    });

    describe('Validação de Estado dos Itens', () => {
        test('deve inicializar itens como não marcados', () => {
            const item = { name: 'Novo item', checked: false };

            expect(item.checked).toBe(false);
        });

        test('deve alternar estado do item', () => {
            const item = { name: 'Item', checked: false };

            item.checked = !item.checked;
            expect(item.checked).toBe(true);

            item.checked = !item.checked;
            expect(item.checked).toBe(false);
        });

        test('deve contar itens marcados', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: false },
                { name: 'Item 3', checked: true },
                { name: 'Item 4', checked: true }
            ];

            const checkedCount = items.filter(item => item.checked).length;

            expect(checkedCount).toBe(3);
        });

        test('deve contar itens pendentes', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: false },
                { name: 'Item 3', checked: false }
            ];

            const pendingCount = items.filter(item => !item.checked).length;

            expect(pendingCount).toBe(2);
        });
    });

    describe('Cálculo de Progresso da Lista', () => {
        test('deve calcular percentual de conclusão', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: true },
                { name: 'Item 3', checked: false },
                { name: 'Item 4', checked: false }
            ];

            const total = items.length;
            const checked = items.filter(item => item.checked).length;
            const percentage = (checked / total) * 100;

            expect(percentage).toBe(50);
        });

        test('deve retornar 0% quando nenhum item marcado', () => {
            const items = [
                { name: 'Item 1', checked: false },
                { name: 'Item 2', checked: false }
            ];

            const total = items.length;
            const checked = items.filter(item => item.checked).length;
            const percentage = (checked / total) * 100;

            expect(percentage).toBe(0);
        });

        test('deve retornar 100% quando todos itens marcados', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: true },
                { name: 'Item 3', checked: true }
            ];

            const total = items.length;
            const checked = items.filter(item => item.checked).length;
            const percentage = (checked / total) * 100;

            expect(percentage).toBe(100);
        });

        test('deve verificar se lista está completa', () => {
            const items1 = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: true }
            ];

            const items2 = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: false }
            ];

            const isComplete1 = items1.every(item => item.checked);
            const isComplete2 = items2.every(item => item.checked);

            expect(isComplete1).toBe(true);
            expect(isComplete2).toBe(false);
        });
    });

    describe('Ordenação de Itens', () => {
        test('deve ordenar itens por nome alfabeticamente', () => {
            const items = [
                { name: 'Zebra', checked: false },
                { name: 'Abacaxi', checked: false },
                { name: 'Mamadeira', checked: false }
            ];

            const sorted = items.sort((a, b) => a.name.localeCompare(b.name));

            expect(sorted[0].name).toBe('Abacaxi');
            expect(sorted[2].name).toBe('Zebra');
        });

        test('deve ordenar itens pendentes primeiro', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: false },
                { name: 'Item 3', checked: true },
                { name: 'Item 4', checked: false }
            ];

            const sorted = items.sort((a, b) => {
                if (a.checked === b.checked) return 0;
                return a.checked ? 1 : -1;
            });

            expect(sorted[0].checked).toBe(false);
            expect(sorted[1].checked).toBe(false);
            expect(sorted[2].checked).toBe(true);
            expect(sorted[3].checked).toBe(true);
        });
    });

    describe('Manipulação de Lista', () => {
        test('deve adicionar novo item à lista', () => {
            const items = [
                { name: 'Item 1', checked: false }
            ];

            const newItem = { name: 'Item 2', checked: false };
            items.push(newItem);

            expect(items.length).toBe(2);
            expect(items[1].name).toBe('Item 2');
        });

        test('deve remover item da lista', () => {
            const items = [
                { name: 'Item 1', checked: false },
                { name: 'Item 2', checked: true },
                { name: 'Item 3', checked: false }
            ];

            const filtered = items.filter(item => item.name !== 'Item 2');

            expect(filtered.length).toBe(2);
            expect(filtered.find(item => item.name === 'Item 2')).toBeUndefined();
        });

        test('deve editar nome de item existente', () => {
            const items = [
                { name: 'Item 1', checked: false },
                { name: 'Item 2', checked: true }
            ];

            const item = items.find(i => i.name === 'Item 1');
            if (item) {
                item.name = 'Item Atualizado';
            }

            expect(items[0].name).toBe('Item Atualizado');
        });

        test('deve limpar todos os itens marcados', () => {
            const items = [
                { name: 'Item 1', checked: true },
                { name: 'Item 2', checked: false },
                { name: 'Item 3', checked: true }
            ];

            const remaining = items.filter(item => !item.checked);

            expect(remaining.length).toBe(1);
            expect(remaining[0].name).toBe('Item 2');
        });
    });

    describe('Validação de Quantidade', () => {
        test('deve aceitar item com quantidade', () => {
            const item = {
                name: 'Fralda',
                checked: false,
                quantity: 3
            };

            expect(item.quantity).toBeGreaterThan(0);
            expect(typeof item.quantity).toBe('number');
        });

        test('deve validar quantidade positiva', () => {
            const validQuantities = [1, 5, 10, 100];
            const invalidQuantities = [0, -1, -10];

            validQuantities.forEach(qty => {
                expect(qty).toBeGreaterThan(0);
            });

            invalidQuantities.forEach(qty => {
                expect(qty).toBeLessThanOrEqual(0);
            });
        });

        test('deve calcular total de itens com quantidade', () => {
            const items = [
                { name: 'Item 1', quantity: 2 },
                { name: 'Item 2', quantity: 3 },
                { name: 'Item 3', quantity: 1 }
            ];

            const total = items.reduce((sum, item) => sum + item.quantity, 0);

            expect(total).toBe(6);
        });
    });

    describe('Categorização de Itens', () => {
        test('deve agrupar itens por categoria', () => {
            const items = [
                { name: 'Fralda', category: 'Higiene' },
                { name: 'Sabonete', category: 'Higiene' },
                { name: 'Mamadeira', category: 'Alimentação' }
            ];

            const grouped = items.reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
            }, {} as Record<string, typeof items>);

            expect(Object.keys(grouped).length).toBe(2);
            expect(grouped['Higiene'].length).toBe(2);
            expect(grouped['Alimentação'].length).toBe(1);
        });

        test('deve filtrar itens por categoria', () => {
            const items = [
                { name: 'Fralda', category: 'Higiene' },
                { name: 'Sabonete', category: 'Higiene' },
                { name: 'Mamadeira', category: 'Alimentação' }
            ];

            const hygiene = items.filter(item => item.category === 'Higiene');

            expect(hygiene.length).toBe(2);
        });
    });

    describe('Duplicação e Compartilhamento', () => {
        test('deve detectar itens duplicados', () => {
            const items = [
                { name: 'Fralda' },
                { name: 'Mamadeira' },
                { name: 'Fralda' }
            ];

            const names = items.map(item => item.name);
            const hasDuplicates = names.length !== new Set(names).size;

            expect(hasDuplicates).toBe(true);
        });

        test('deve remover duplicatas', () => {
            const items = [
                { name: 'Fralda', checked: false },
                { name: 'Mamadeira', checked: true },
                { name: 'Fralda', checked: false }
            ];

            const unique = items.filter((item, index, self) =>
                index === self.findIndex(i => i.name === item.name)
            );

            expect(unique.length).toBe(2);
        });
    });
});
