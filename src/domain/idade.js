export function calcularIdade(dataNascimento, hoje = new Date()) {
  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  return hoje.getFullYear() - nascimento.getFullYear();
}
