import { Router } from 'express';
import { AppError } from '../../errors.js';

function parseId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador inválido', 400);
  return id;
}

export function pessoasRouter(service) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(service.listar(req.query.busca));
  });

  router.get('/:id', (req, res) => {
    res.json(service.buscarPorId(parseId(req.params.id)));
  });

  router.post('/', (req, res) => {
    const pessoa = service.criar(req.body);
    res.status(201).location(`/api/pessoas/${pessoa.id}`).json(pessoa);
  });

  router.put('/:id', (req, res) => {
    res.json(service.atualizar(parseId(req.params.id), req.body));
  });

  router.delete('/:id', (req, res) => {
    service.remover(parseId(req.params.id));
    res.status(204).end();
  });

  return router;
}
