import { isCpfValido, normalizarCpf } from './cpf.js';

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function isDataValida(valor) {
  if (!FORMATO_DATA.test(valor)) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function validarPessoa(payload = {}, hoje = new Date()) {
  const nome = String(payload.nome ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  const cpf = normalizarCpf(payload.cpf);
  const dataNascimento = String(payload.dataNascimento ?? '').trim();
  const erros = {};

  if (nome.length < 3) erros.nome = 'Nome deve ter pelo menos 3 caracteres';

  if (!isCpfValido(payload.cpf)) erros.cpf = 'CPF inválido';

  if (!isDataValida(dataNascimento)) {
    erros.dataNascimento = 'Data de nascimento inválida (use AAAA-MM-DD)';
  } else if (new Date(`${dataNascimento}T00:00:00`) > inicioDoDia(hoje)) {
    erros.dataNascimento = 'Data de nascimento não pode estar no futuro';
  }

  return { dados: { nome, cpf, dataNascimento }, erros };
}
