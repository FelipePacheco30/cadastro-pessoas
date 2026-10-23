const TAMANHO_CPF = 11;

export function normalizarCpf(cpf) {
  return String(cpf ?? '').replace(/\D/g, '');
}

function calcularDigito(base) {
  const pesoInicial = base.length + 1;
  const soma = [...base].reduce((total, digito, i) => total + Number(digito) * (pesoInicial - i), 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isCpfValido(cpf) {
  const raw = String(cpf ?? '');
  if (/[^\d.\-\s]/.test(raw)) return false;

  const digitos = normalizarCpf(raw);
  if (digitos.length !== TAMANHO_CPF || /^(\d)\1+$/.test(digitos)) return false;

  const primeiro = calcularDigito(digitos.slice(0, 9));
  const segundo = calcularDigito(digitos.slice(0, 9) + primeiro);
  return digitos.endsWith(`${primeiro}${segundo}`);
}

export function formatarCpf(cpf) {
  return normalizarCpf(cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
