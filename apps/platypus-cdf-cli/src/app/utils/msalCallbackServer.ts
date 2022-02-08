import express, { Express } from 'express';
import { Server } from 'http';
import { DEBUG } from './logger';

export const openServerAtPort = async () => {
  return new Promise<{ app: Express; server: Server }>((resolve) => {
    const app = express();

    const server = app.listen(0, '0.0.0.0', () => {
      resolve({ app, server });
    });
  });
};

export const listenForAuthCode = async (app: Express) => {
  return new Promise<string>((resolve, reject) => {
    app.get('/redirect', (req, res) => {
      if (req.query.error) {
        res.end(
          `Something went wrong: ${req.query.error}, description: ${req.query.error_description}`
        );
        return reject(req.query.error);
      }
      const authCode = req.query.code;
      if (authCode) {
        res.end(
          'You have authenticated successfully! Feel free to close this window.'
        );
        return resolve(<string>authCode);
      }
      DEBUG('HTTP_RESPONSE %o', req.query);
      res.end(
        `Well thats embarrassing, neither we got an auth code or any error ${JSON.stringify(
          req.query
        )}`
      );
      reject('No auth code or error');
    });
  });
};
