import { createApp } from './http/app.js';

const port = Number(process.env.PORT ?? 3000);
const databaseFile = process.env.DATABASE_FILE ?? 'data/pessoas.db';

createApp({ databaseFile }).listen(port, () => {
  console.info(`Servidor disponível em http://localhost:${port}`);
});
