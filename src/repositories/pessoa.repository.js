const COLUNAS = 'id, nome, cpf, data_nascimento AS dataNascimento';

export function createPessoaRepository(db) {
  const statements = {
    findAll: db.prepare(`SELECT ${COLUNAS} FROM pessoas ORDER BY nome COLLATE NOCASE`),
    search: db.prepare(
      `SELECT ${COLUNAS} FROM pessoas
       WHERE nome LIKE :termo OR cpf LIKE :digitos
       ORDER BY nome COLLATE NOCASE`,
    ),
    findById: db.prepare(`SELECT ${COLUNAS} FROM pessoas WHERE id = ?`),
    findByCpf: db.prepare(`SELECT ${COLUNAS} FROM pessoas WHERE cpf = ?`),
    insert: db.prepare(
      'INSERT INTO pessoas (nome, cpf, data_nascimento) VALUES (:nome, :cpf, :dataNascimento)',
    ),
    update: db.prepare(
      `UPDATE pessoas
       SET nome = :nome, cpf = :cpf, data_nascimento = :dataNascimento, atualizado_em = datetime('now')
       WHERE id = :id`,
    ),
    delete: db.prepare('DELETE FROM pessoas WHERE id = ?'),
  };

  const plain = (row) => (row ? { ...row } : null);

  return {
    findAll(busca) {
      const termo = String(busca ?? '').trim();
      if (!termo) return statements.findAll.all().map(plain);
      const digitos = termo.replace(/\D/g, '');
      return statements.search
        .all({ termo: `%${termo}%`, digitos: digitos ? `%${digitos}%` : '' })
        .map(plain);
    },

    findById(id) {
      return plain(statements.findById.get(id));
    },

    findByCpf(cpf) {
      return plain(statements.findByCpf.get(cpf));
    },

    create(dados) {
      const { lastInsertRowid } = statements.insert.run(dados);
      return this.findById(Number(lastInsertRowid));
    },

    update(id, dados) {
      statements.update.run({ ...dados, id });
      return this.findById(id);
    },

    delete(id) {
      return statements.delete.run(id).changes > 0;
    },
  };
}
