export function calcularIdade(dataNascimento, hoje = new Date()) {
  const nascimento = new Date(`${dataNascimento}T00:00:00`);
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();
  const aniversarioPendente =
    mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate());

  if (aniversarioPendente) idade -= 1;
  return idade;
}
