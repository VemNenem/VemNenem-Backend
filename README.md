# VemNenem Backend

Backend da aplicação VemNenem, construído com Strapi CMS para gerenciamento de conteúdo e API RESTful.

## Sobre o Projeto

Este é o backend do projeto VemNenem, desenvolvido utilizando Strapi v5, um headless CMS open-source baseado em Node.js. O Strapi fornece uma interface administrativa intuitiva e APIs automáticas para gerenciamento de conteúdo.

## Arquitetura

O projeto segue a arquitetura padrão do Strapi, organizada em camadas:

### Estrutura de Diretórios

- **config/** - Configurações gerais da aplicação (banco de dados, servidor, middlewares)
- **src/api/** - Definição de content-types, controllers, services e routes customizados
- **src/extensions/** - Extensões de plugins e funcionalidades do Strapi
- **database/** - Arquivos relacionados ao banco de dados
- **public/** - Arquivos públicos estáticos
- **build/** - Build do painel administrativo

### Camadas da Aplicação

**Content-Types**: Define os modelos de dados e seus relacionamentos. Cada content-type representa uma entidade do sistema com seus campos e validações.

**Controllers**: Responsáveis por receber requisições HTTP e retornar respostas. Podem ser customizados para adicionar lógica de negócio específica.

**Services**: Camada de lógica de negócio reutilizável. Contém funções que podem ser chamadas pelos controllers ou outras partes da aplicação.

**Routes**: Define os endpoints da API e mapeia para os controllers correspondentes.

**Policies**: Middlewares para controle de acesso e validação de requisições.

### Banco de Dados

O Strapi suporta diversos bancos de dados relacionais (PostgreSQL, MySQL, SQLite, MariaDB). A configuração é feita através do arquivo `config/database.js`.

### Autenticação e Autorização

O Strapi fornece sistema integrado de autenticação JWT e controle de permissões baseado em roles (RBAC - Role-Based Access Control).

## Requisitos

- Node.js (versão 20.x ou superior)
- NPM ou Yarn
- Banco de dados compatível (PostgreSQL, MySQL, SQLite ou MariaDB)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/VemNenem/VemNenem-Backend.git
cd VemNenem-Backend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações de banco de dados e outras variáveis necessárias.

## Executando o Projeto

### Modo Desenvolvimento

Inicia o servidor com hot-reload ativado, ideal para desenvolvimento:

```bash
npm run develop
# ou
yarn develop
```

O painel administrativo estará disponível em `http://localhost:1337/admin`

### Modo Produção

Para executar em produção, primeiro faça o build:

```bash
npm run build
# ou
yarn build
```

Depois inicie o servidor:

```bash
npm run start
# ou
yarn start
```

## Comandos Disponíveis

- `npm run develop` - Inicia o servidor em modo desenvolvimento com auto-reload
- `npm run start` - Inicia o servidor em modo produção
- `npm run build` - Gera o build do painel administrativo
- `npm run strapi` - Acessa a CLI do Strapi para comandos avançados

## API

Após iniciar o projeto, a API REST estará disponível em `http://localhost:1337/api/`

### Documentação da API

O Strapi gera automaticamente documentação da API. Para acessá-la, instale o plugin de documentação:

```bash
npm run strapi install documentation
```

## Painel Administrativo

Acesse o painel em `http://localhost:1337/admin` para:

- Gerenciar content-types
- Criar e editar conteúdo
- Configurar permissões e roles
- Gerenciar usuários
- Configurar plugins

## Deploy

O Strapi pode ser deployed em diversas plataformas:

- Strapi Cloud
- Heroku
- AWS
- DigitalOcean
- Vercel
- E outros provedores de cloud

Consulte a [documentação oficial de deploy](https://docs.strapi.io/dev-docs/deployment) para instruções específicas de cada plataforma.

## Recursos

- [Documentação oficial do Strapi](https://docs.strapi.io)
- [Strapi Tutorials](https://strapi.io/tutorials)
- [Strapi Blog](https://strapi.io/blog)
- [Repositório GitHub do Strapi](https://github.com/strapi/strapi)

## Suporte

Para dúvidas e suporte:
- [Discord do Strapi](https://discord.strapi.io)
- [Fórum da comunidade](https://forum.strapi.io/)
