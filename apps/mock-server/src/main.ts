#!/usr/bin/env node
import { getArgs } from './cli/cli-args';

import { createMockServer } from './app/mock-server';
import cdfMiddleware from './app/middlewares/cdf-middleware';

// hardcoded for now, should be loaded from file
import { loadConfig, loadMockData } from './cli/loader';
const TENANT = process.env.NODE_ENV || 'mock';
const server = createMockServer();

const args = getArgs();

const PORT = args.port || 4002;
const dbPath = (args._[0] || args.db) as string;

const mockData = loadMockData(dbPath);
const mockServerConfig = args.config ? loadConfig(args.config) : null;

const baseUrl =
  TENANT === 'testcafe' ? 'http://localhost:11111' : 'http://localhost:' + PORT;

server.use(cdfMiddleware(mockData, mockServerConfig, args.middlewares));

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

server.listen(PORT, () => {
  console.log(
    `JSON Server is running for tenant - ${TENANT} on baseURL: ${baseUrl}`
  );
});
