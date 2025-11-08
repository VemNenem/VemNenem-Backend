# Guia de Testes - VemNenem Backend

## 📋 Configuração do Jest

O projeto está configurado com Jest para testes unitários e de integração.

### Dependências Instaladas

- `jest`: Framework de testes
- `@types/jest`: Tipos TypeScript para Jest
- `ts-jest`: Preset para usar Jest com TypeScript
- `@jest/globals`: Tipos globais do Jest

## 🚀 Como Executar os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch (re-executa ao salvar)
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes com mais detalhes
```bash
npm run test:verbose
```

## 📁 Estrutura de Testes

```
tests/
├── client.validation.test.ts   # Testes de validação de dados de cliente
├── client.service.test.ts      # Testes do serviço de cliente (com mocks)
└── utils.test.ts               # Testes de funções utilitárias
```

## 📝 Tipos de Testes Criados

### 1. Testes de Validação (`client.validation.test.ts`)
Testa regras de negócio e validações:
- ✅ Validação de email
- ✅ Validação de senha
- ✅ Validação de data de parto
- ✅ Validação de gênero do bebê
- ✅ Campos obrigatórios
- ✅ Termos e políticas
- ✅ Estrutura de dados

### 2. Testes de Serviço (`client.service.test.ts`)
Testa operações do serviço com mocks:
- ✅ Criação de cliente
- ✅ Verificação de email duplicado
- ✅ Busca de dados do cliente
- ✅ Validações de segurança

### 3. Testes Utilitários (`utils.test.ts`)
Testa funções auxiliares:
- ✅ Manipulação de datas
- ✅ Formatação de strings
- ✅ Validação de CPF
- ✅ Validação de telefone
- ✅ Cálculo de idade
- ✅ Geração de códigos
- ✅ Máscaras de dados
- ✅ Operações com arrays e objetos

## 🔍 Exemplo de Uso

### Executar um teste específico
```bash
npm test -- client.validation
```

### Executar testes com padrão de nome
```bash
npm test -- --testNamePattern="email"
```

## 📊 Relatório de Cobertura

Após executar `npm run test:coverage`, você encontrará o relatório em:
- Terminal: Resumo de cobertura
- `coverage/lcov-report/index.html`: Relatório HTML detalhado

## ✍️ Como Escrever Novos Testes

### Estrutura básica de um teste

```typescript
import { describe, expect, test } from '@jest/globals';

describe('Nome do Módulo', () => {
  test('deve fazer algo específico', () => {
    // Arrange (Preparar)
    const input = 'valor de entrada';
    
    // Act (Agir)
    const result = functionToTest(input);
    
    // Assert (Verificar)
    expect(result).toBe('valor esperado');
  });
});
```

### Matchers úteis do Jest

```typescript
// Igualdade
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Verdadeiro/Falso
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Números
expect(value).toBeGreaterThan(number);
expect(value).toBeLessThan(number);

// Strings
expect(string).toMatch(/regex/);
expect(string).toContain(substring);

// Arrays/Objetos
expect(array).toContain(item);
expect(object).toHaveProperty(key);

// Exceções
expect(() => func()).toThrow();
```

## 🎯 Boas Práticas

1. **Nomes descritivos**: Use nomes claros que expliquem o que está sendo testado
2. **Um conceito por teste**: Cada teste deve verificar apenas uma coisa
3. **AAA Pattern**: Organize testes em Arrange, Act, Assert
4. **Independência**: Testes não devem depender uns dos outros
5. **Cobertura**: Busque cobrir casos normais, casos extremos e casos de erro

## 🐛 Debugging de Testes

### Ver saída detalhada
```bash
npm test -- --verbose
```

### Executar apenas um arquivo
```bash
npm test -- tests/client.validation.test.ts
```

### Modo de debug no VS Code
Adicione breakpoints e use F5 com a configuração de debug do Jest

## 📚 Recursos Adicionais

- [Documentação do Jest](https://jestjs.io/docs/getting-started)
- [Matchers do Jest](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://testingjavascript.com/)

## 🔄 Próximos Passos

Para expandir a suite de testes:

1. Adicionar testes para outros serviços (schedule, post, term, etc.)
2. Criar testes de integração com banco de dados real
3. Adicionar testes E2E (end-to-end)
4. Configurar CI/CD para executar testes automaticamente
5. Aumentar cobertura de código para >80%

---

**Dica**: Execute `npm run test:watch` durante o desenvolvimento para feedback instantâneo! 🚀
