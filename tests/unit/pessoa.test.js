import { describe, expect, it } from 'vitest';
import { validarPessoa } from '../../src/domain/pessoa.js';

const hoje = new Date('2026-10-23T12:00:00');
const valido = { nome: 'Maria da Silva', cpf: '529.982.247-25', dataNascimento: '1995-06-20' };

describe('validarPessoa', () => {
  it('retorna os dados normalizados quando o payload é válido', () => {
    const { dados, erros } = validarPessoa({ ...valido, nome: '  Maria   da Silva ' }, hoje);

    expect(erros).toEqual({});
    expect(dados).toEqual({
      nome: 'Maria da Silva',
      cpf: '52998224725',
      dataNascimento: '1995-06-20',
    });
  });

  it('exige nome com pelo menos 3 caracteres', () => {
    expect(validarPessoa({ ...valido, nome: 'Al' }, hoje).erros.nome).toBeDefined();
    expect(validarPessoa({ ...valido, nome: undefined }, hoje).erros.nome).toBeDefined();
  });

  it('rejeita CPF inválido', () => {
    expect(validarPessoa({ ...valido, cpf: '123.456.789-00' }, hoje).erros.cpf).toBe(
      'CPF inválido',
    );
  });

  it.each(['20/06/1995', '1995-02-30', '', 'abc'])('rejeita data mal formatada %s', (data) => {
    expect(
      validarPessoa({ ...valido, dataNascimento: data }, hoje).erros.dataNascimento,
    ).toBeDefined();
  });

  it('rejeita data de nascimento no futuro', () => {
    const { erros } = validarPessoa({ ...valido, dataNascimento: '2026-10-24' }, hoje);
    expect(erros.dataNascimento).toBe('Data de nascimento não pode estar no futuro');
  });

  it('acumula erros de todos os campos', () => {
    const { erros } = validarPessoa({}, hoje);
    expect(Object.keys(erros)).toEqual(['nome', 'cpf', 'dataNascimento']);
  });
});
