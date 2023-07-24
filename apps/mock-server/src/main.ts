#!/usr/bin/env node
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import * as cors from 'cors';

import cdfMiddleware from './app/middlewares/cdf-middleware';
import { createMockServer } from './app/mock-server';
import { getArgs } from './cli/cli-args';
// hardcoded for now, should be loaded from file
import { loadConfig, loadMockData } from './cli/loader';
import { loginInfoMockData } from './login-info-mock-data';
import { userTokenData } from './user-token-data';

const TENANT = process.env.NODE_ENV || 'mock';
const server = createMockServer();

const args = getArgs();

const PORT = args.port || 4002;
const dbPath = (args._[0] || args.db) as string;

let mockTokenData = userTokenData;

const mockData = loadMockData(dbPath);
const mockDataInitalState = JSON.parse(JSON.stringify(mockData));
const mockServerConfig = args.config ? loadConfig(args.config) : null;

const secure = !!args.secure;

const baseUrl =
  TENANT === 'testcafe'
    ? 'http://localhost:11111'
    : `${secure ? 'https' : 'http'}://localhost:` + PORT;

server.use(cors());
const cdfMiddlewares = cdfMiddleware(
  mockData,
  mockServerConfig,
  args.middlewares as string[]
);

server.get('/reset', (req, res) => {
  // we must be sure that we are going to make deep copy
  // otherwise we will end up with prev state being modified
  cdfMiddlewares.reset(JSON.parse(JSON.stringify(mockDataInitalState)));
  console.log('Application state was reseted to its initial state');
  mockTokenData = userTokenData;
  res.jsonp({ items: [] });
});

server.get('/login/status', (req, res) => {
  res.set({
    'content-type': 'application/json',
    'access-control-allow-credentials': true,
    'access-control-allow-origin': baseUrl,
  });
  res.json({
    data: {
      user: 'testcafe@cognite.com',
      loggedIn: true,
      project: 'platypus',
      projectId: 123456789,
    },
  });
});

server.get('/api/v1/token/inspect', (req, res) => {
  res.set({
    'content-type': 'application/json',
    'access-control-allow-credentials': true,
    'access-control-allow-origin': baseUrl,
  });
  res.jsonp(mockTokenData);
});
server.get('/_api/login_info', (req, res) => {
  res.set({
    'content-type': 'application/json',
    'access-control-allow-credentials': true,
    'access-control-allow-origin': baseUrl,
  });
  res.jsonp(loginInfoMockData);
});

// updates the JSON token at runtime
server.post('/api/v1/token/inspect', (req, res) => {
  mockTokenData = req.body;
  res.jsonp({ updated: mockTokenData });
});

server.use(cdfMiddlewares);

const spdyServer = secure
  ? https.createServer(
      {
        // eslint-disable-next-line
        // @ts-ignore
        key: fs.readFileSync(__dirname + '/cert/server.key') as any,
        cert: fs.readFileSync(__dirname + '/cert/server.crt'),
      },
      server
    )
  : http.createServer(server);

spdyServer.listen(PORT, () => {
  console.log(
    `JSON Server is running for tenant - ${TENANT} on baseURL: ${baseUrl}`
  );
});
