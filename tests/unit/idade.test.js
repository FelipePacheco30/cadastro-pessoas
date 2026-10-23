import { describe, expect, it } from 'vitest';
import { calcularIdade } from '../../src/domain/idade.js';

describe('calcularIdade', () => {
  const hoje = new Date('2026-10-23T12:00:00');

  it('calcula a idade quando o aniversário já ocorreu no ano', () => {
    expect(calcularIdade('2000-03-15', hoje)).toBe(26);
  });

  it('retorna zero para quem nasceu no próprio ano', () => {
    expect(calcularIdade('2026-01-10', hoje)).toBe(0);
  });

  it('desconta um ano quando o aniversário ainda não ocorreu', () => {
    expect(calcularIdade('2000-12-01', hoje)).toBe(25);
  });

  it('considera o dia do aniversário como ano completo', () => {
    expect(calcularIdade('2000-10-23', hoje)).toBe(26);
  });

  it('desconta um ano no mês do aniversário antes do dia', () => {
    expect(calcularIdade('2000-10-24', hoje)).toBe(25);
  });
});
