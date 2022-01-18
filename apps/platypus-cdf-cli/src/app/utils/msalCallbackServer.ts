import express, { Express } from 'express';
import { Server } from 'http';

export const openServerAtPort = async () => {
  return new Promise<{ app: Express; server: Server }>((resolve) => {
    const app = express();

    const server = app.listen(0, '0.0.0.0', () => {
      resolve({ app, server });
    });
  });
};

export const listenForAuthCode = async (app: Express) => {
  return new Promise<string>((resolve) => {
    app.get('/redirect', (req, res) => {
      res.send(
        '🚀 You have authenticated successfully! Feel free to close this window.'
      );
      const authCode = req.query.code as string;
      if (authCode) {
        resolve(authCode);
      }
    });
  });
};
