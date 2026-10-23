import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/http/app.js';

const maria = { nome: 'Maria da Silva', cpf: '529.982.247-25', dataNascimento: '1995-06-20' };
const joao = { nome: 'João Pereira', cpf: '111.444.777-35', dataNascimento: '1988-01-05' };

describe('API /api/pessoas', () => {
  let app;

  beforeEach(() => {
    app = createApp({ databaseFile: ':memory:', clock: () => new Date('2026-10-23T12:00:00') });
  });

  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST cria uma pessoa e devolve idade calculada', async () => {
    const res = await request(app).post('/api/pessoas').send(maria);

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/api/pessoas/${res.body.id}`);
    expect(res.body).toMatchObject({ nome: 'Maria da Silva', cpf: '529.982.247-25', idade: 31 });
  });

  it('POST retorna 400 com os erros de validação', async () => {
    const res = await request(app)
      .post('/api/pessoas')
      .send({ nome: 'Ze', cpf: '123', dataNascimento: '2030-01-01' });

    expect(res.status).toBe(400);
    expect(Object.keys(res.body.detalhes)).toEqual(['nome', 'cpf', 'dataNascimento']);
  });

  it('POST retorna 409 quando o CPF já está cadastrado', async () => {
    await request(app).post('/api/pessoas').send(maria);
    const res = await request(app)
      .post('/api/pessoas')
      .send({ ...maria, nome: 'Outra Maria' });

    expect(res.status).toBe(409);
  });

  it('GET lista em ordem alfabética e filtra por nome ou CPF', async () => {
    await request(app).post('/api/pessoas').send(maria);
    await request(app).post('/api/pessoas').send(joao);

    const todos = await request(app).get('/api/pessoas');
    expect(todos.body.map((p) => p.nome)).toEqual(['João Pereira', 'Maria da Silva']);

    const porNome = await request(app).get('/api/pessoas').query({ busca: 'maria' });
    expect(porNome.body).toHaveLength(1);

    const porCpf = await request(app).get('/api/pessoas').query({ busca: '111.444' });
    expect(porCpf.body[0].nome).toBe('João Pereira');
  });

  it('GET /:id retorna a pessoa ou 404', async () => {
    const { body } = await request(app).post('/api/pessoas').send(maria);

    expect((await request(app).get(`/api/pessoas/${body.id}`)).body.nome).toBe('Maria da Silva');
    expect((await request(app).get('/api/pessoas/999')).status).toBe(404);
  });

  it('PUT atualiza os dados e recalcula a idade', async () => {
    const { body } = await request(app).post('/api/pessoas').send(maria);
    const res = await request(app)
      .put(`/api/pessoas/${body.id}`)
      .send({ ...maria, dataNascimento: '2000-12-01' });

    expect(res.status).toBe(200);
    expect(res.body.idade).toBe(25);
  });

  it('DELETE remove a pessoa e responde 204', async () => {
    const { body } = await request(app).post('/api/pessoas').send(maria);

    expect((await request(app).delete(`/api/pessoas/${body.id}`)).status).toBe(204);
    expect((await request(app).get(`/api/pessoas/${body.id}`)).status).toBe(404);
  });

  it('retorna 400 para id não numérico', async () => {
    expect((await request(app).get('/api/pessoas/abc')).status).toBe(400);
  });

  it('retorna 400 quando o corpo não é um JSON válido', async () => {
    const res = await request(app)
      .post('/api/pessoas')
      .set('Content-Type', 'application/json')
      .send('{"nome": ');

    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('JSON inválido no corpo da requisição');
  });

  it('não expõe o header X-Powered-By', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
