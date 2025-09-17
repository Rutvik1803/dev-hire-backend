import dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: string | number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

const config: Config = {
  PORT: process.env.PORT || '4000',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_NAME: process.env.DB_NAME || 'database',
};

export default config;
