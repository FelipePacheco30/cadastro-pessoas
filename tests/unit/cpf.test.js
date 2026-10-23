import { describe, expect, it } from 'vitest';
import { formatarCpf, isCpfValido, normalizarCpf } from '../../src/domain/cpf.js';

describe('normalizarCpf', () => {
  it('remove pontos, traço e espaços', () => {
    expect(normalizarCpf(' 529.982.247-25 ')).toBe('52998224725');
  });

  it('retorna string vazia para valores nulos', () => {
    expect(normalizarCpf(undefined)).toBe('');
    expect(normalizarCpf(null)).toBe('');
  });
});

describe('isCpfValido', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])('aceita CPF válido %s', (cpf) => {
    expect(isCpfValido(cpf)).toBe(true);
  });

  it.each([
    ['dígito verificador incorreto', '529.982.247-24'],
    ['menos de 11 dígitos', '5299822472'],
    ['mais de 11 dígitos', '529982247251'],
    ['todos os dígitos iguais', '111.111.111-11'],
    ['caracteres inválidos', 'abc.def.ghi-jk'],
    ['vazio', ''],
  ])('rejeita CPF com %s', (_motivo, cpf) => {
    expect(isCpfValido(cpf)).toBe(false);
  });
});

describe('formatarCpf', () => {
  it('aplica a máscara 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
  });
});
