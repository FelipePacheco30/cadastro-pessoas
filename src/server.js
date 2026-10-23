import { createApp } from './http/app.js';

const port = Number(process.env.PORT ?? 3000);
const databaseFile = process.env.DATABASE_FILE ?? 'data/pessoas.db';

const app = createApp({ databaseFile });
const server = app.listen(port, () => {
  console.info(`Servidor disponível em http://localhost:${port}`);
});

function encerrar(sinal) {
  console.info(`${sinal} recebido, encerrando servidor...`);
  server.close(() => {
    app.locals.database.close();
    process.exit(0);
  });
}

process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
