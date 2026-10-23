# Cadastro de Pessoas

CRUD de pessoas com **CPF**, **nome** e **data de nascimento**, com cálculo automático da **idade**.
Projeto desenvolvido com TDD como atividade da disciplina de Estruturação do Workflow (Fatec Jacareí — DSM).

## Stack

- Node.js 24 + Express
- SQLite nativo (`node:sqlite`)
- HTML, CSS e JavaScript puro no frontend
- Vitest + Supertest (testes unitários e de integração)
- ESLint (análise estática) + Prettier (formatação)
- Docker + GitHub Actions

## Como executar

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

## Scripts

| Script                     | Descrição                              |
| -------------------------- | -------------------------------------- |
| `npm run dev`              | Servidor com recarga automática        |
| `npm start`                | Servidor em modo produção              |
| `npm run lint`             | Análise estática com ESLint            |
| `npm run format:check`     | Verifica formatação com Prettier       |
| `npm run format`           | Aplica formatação                      |
| `npm test`                 | Executa todos os testes                |
| `npm run test:unit`        | Executa apenas os testes unitários     |
| `npm run test:integration` | Executa apenas os testes de integração |
| `npm run test:coverage`    | Testes com relatório de cobertura      |

## Fluxo de versionamento

- `main`: código estável, publicado.
- `develop`: integração das funcionalidades.
- `feature/*`: criadas a partir da `main`, integradas na `develop` via Pull Request.
- Promoção `develop` → `main` via Pull Request de release.

Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).
