import express from 'express';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../database.js';
import { AppError } from '../errors.js';
import { createPessoaRepository } from '../repositories/pessoa.repository.js';
import { createPessoaService } from '../services/pessoa.service.js';
import { pessoasRouter } from './routes/pessoas.routes.js';

const PUBLIC_DIR = fileURLToPath(new URL('../../public', import.meta.url));

export function createApp({ databaseFile = ':memory:', clock } = {}) {
  const repository = createPessoaRepository(openDatabase(databaseFile));
  const service = createPessoaService({ repository, clock });

  const app = express();
  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/pessoas', pessoasRouter(service));

  app.use('/api', (_req, res) => res.status(404).json({ erro: 'Recurso não encontrado' }));

  app.use((error, _req, res, _next) => {
    if (error instanceof AppError) {
      return res.status(error.status).json({ erro: error.message, detalhes: error.detalhes });
    }
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}
