# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-10-23

### Adicionado

- CRUD de pessoas (CPF, nome e data de nascimento) com cálculo automático da idade.
- Validação de CPF com dígitos verificadores e bloqueio de CPF duplicado.
- API REST (`/api/pessoas`) e endpoint de saúde (`/health`).
- Interface web responsiva com busca, cadastro, edição e exclusão.
- Testes unitários e de integração (Vitest + Supertest).
- Análise estática com ESLint e formatação com Prettier.
- Imagem Docker multi-stage com healthcheck e usuário sem privilégios.
- Pipeline de integração contínua no GitHub Actions.
