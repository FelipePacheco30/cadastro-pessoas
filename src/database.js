import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS pessoas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL,
    cpf             TEXT    NOT NULL UNIQUE,
    data_nascimento TEXT    NOT NULL,
    criado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`;

export function openDatabase(filename = ':memory:') {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}
