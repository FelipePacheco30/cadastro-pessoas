import { formatarCpf } from '../domain/cpf.js';
import { calcularIdade } from '../domain/idade.js';
import { validarPessoa } from '../domain/pessoa.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors.js';

export function createPessoaService({ repository, clock = () => new Date() }) {
  const toResponse = (pessoa) => ({
    id: pessoa.id,
    nome: pessoa.nome,
    cpf: formatarCpf(pessoa.cpf),
    dataNascimento: pessoa.dataNascimento,
    idade: calcularIdade(pessoa.dataNascimento, clock()),
  });

  const validar = (payload) => {
    const { dados, erros } = validarPessoa(payload, clock());
    if (Object.keys(erros).length > 0) throw new ValidationError(erros);
    return dados;
  };

  const buscarExistente = (id) => {
    const pessoa = repository.findById(id);
    if (!pessoa) throw new NotFoundError();
    return pessoa;
  };

  const garantirCpfDisponivel = (cpf, idAtual) => {
    const dono = repository.findByCpf(cpf);
    if (dono && dono.id !== idAtual) throw new ConflictError();
  };

  return {
    listar(busca) {
      return repository.findAll(busca).map(toResponse);
    },

    buscarPorId(id) {
      return toResponse(buscarExistente(id));
    },

    criar(payload) {
      const dados = validar(payload);
      garantirCpfDisponivel(dados.cpf);
      return toResponse(repository.create(dados));
    },

    atualizar(id, payload) {
      buscarExistente(id);
      const dados = validar(payload);
      garantirCpfDisponivel(dados.cpf, id);
      return toResponse(repository.update(id, dados));
    },

    remover(id) {
      buscarExistente(id);
      repository.delete(id);
    },
  };
}
