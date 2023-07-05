import 'dotenv/config';
import pg from 'pg';

const DbClient = async () => {
  const client = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  await client.connect();

  return client;
};

export default await DbClient();
