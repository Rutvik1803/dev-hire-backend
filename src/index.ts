import express, { Express, Request, Response } from 'express';
import config from './config';

const app: Express = express();
const PORT: number = Number(config.PORT);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello! Backend with TypeScript is running.');
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log('Server started on port', PORT);
  /* eslint-enable no-console */
});
