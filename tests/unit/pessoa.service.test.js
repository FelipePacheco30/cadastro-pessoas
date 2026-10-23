import { beforeEach, describe, expect, it } from 'vitest';
import { createPessoaService } from '../../src/services/pessoa.service.js';
import { ConflictError, NotFoundError, ValidationError } from '../../src/errors.js';

function createFakeRepository() {
  const registros = new Map();
  let sequencia = 0;
  return {
    findAll: () => [...registros.values()],
    findById: (id) => registros.get(id) ?? null,
    findByCpf: (cpf) => [...registros.values()].find((p) => p.cpf === cpf) ?? null,
    create: (dados) => {
      const pessoa = { id: ++sequencia, ...dados };
      registros.set(pessoa.id, pessoa);
      return pessoa;
    },
    update: (id, dados) => {
      const pessoa = { id, ...dados };
      registros.set(id, pessoa);
      return pessoa;
    },
    delete: (id) => registros.delete(id),
  };
}

const payload = { nome: 'João Pereira', cpf: '529.982.247-25', dataNascimento: '1990-11-30' };

describe('PessoaService', () => {
  let service;

  beforeEach(() => {
    service = createPessoaService({
      repository: createFakeRepository(),
      clock: () => new Date('2026-10-23T12:00:00'),
    });
  });

  it('cria uma pessoa e devolve CPF formatado e idade calculada', () => {
    expect(service.criar(payload)).toEqual({
      id: 1,
      nome: 'João Pereira',
      cpf: '529.982.247-25',
      dataNascimento: '1990-11-30',
      idade: 35,
    });
  });

  it('lança ValidationError com os detalhes quando o payload é inválido', () => {
    expect(() => service.criar({ ...payload, cpf: '000' })).toThrowError(ValidationError);
    try {
      service.criar({ ...payload, cpf: '000' });
    } catch (error) {
      expect(error.detalhes).toEqual({ cpf: 'CPF inválido' });
    }
  });

  it('impede cadastrar CPF duplicado', () => {
    service.criar(payload);
    expect(() => service.criar({ ...payload, nome: 'Outro Nome' })).toThrowError(ConflictError);
  });

  it('lista as pessoas cadastradas', () => {
    service.criar(payload);
    expect(service.listar()).toHaveLength(1);
  });

  it('busca por id e lança NotFoundError quando não existe', () => {
    const { id } = service.criar(payload);
    expect(service.buscarPorId(id).nome).toBe('João Pereira');
    expect(() => service.buscarPorId(999)).toThrowError(NotFoundError);
  });

  it('atualiza mantendo o mesmo CPF', () => {
    const { id } = service.criar(payload);
    const atualizada = service.atualizar(id, { ...payload, nome: 'João P. Souza' });
    expect(atualizada.nome).toBe('João P. Souza');
  });

  it('impede atualizar para um CPF que pertence a outra pessoa', () => {
    service.criar(payload);
    const { id } = service.criar({ ...payload, cpf: '111.444.777-35' });
    expect(() => service.atualizar(id, payload)).toThrowError(ConflictError);
  });

  it('remove uma pessoa e lança NotFoundError ao remover inexistente', () => {
    const { id } = service.criar(payload);
    service.remover(id);
    expect(service.listar()).toHaveLength(0);
    expect(() => service.remover(id)).toThrowError(NotFoundError);
  });
});
