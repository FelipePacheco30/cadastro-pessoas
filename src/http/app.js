import express from 'express';
import { fileURLToPath } from 'node:url';
import { openDatabase } from '../database.js';
import { AppError } from '../errors.js';
import { createPessoaRepository } from '../repositories/pessoa.repository.js';
import { createPessoaService } from '../services/pessoa.service.js';
import { pessoasRouter } from './routes/pessoas.routes.js';

const PUBLIC_DIR = fileURLToPath(new URL('../../public', import.meta.url));

export function createApp({ databaseFile = ':memory:', clock } = {}) {
  const database = openDatabase(databaseFile);
  const repository = createPessoaRepository(database);
  const service = createPessoaService({ repository, clock });

  const app = express();
  app.disable('x-powered-by');
  app.locals.database = database;
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(PUBLIC_DIR));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/pessoas', pessoasRouter(service));

  app.use('/api', (_req, res) => res.status(404).json({ erro: 'Recurso não encontrado' }));

  app.use((error, _req, res, _next) => {
    if (error instanceof AppError) {
      return res.status(error.status).json({ erro: error.message, detalhes: error.detalhes });
    }
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ erro: 'Corpo da requisição muito grande' });
    }
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}
