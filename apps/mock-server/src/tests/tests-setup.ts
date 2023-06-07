import { CdfApiConfig, MockData } from '../app';
import cdfMiddleware from '../app/middlewares/cdf-middleware';
import { createMockServer } from '../app/mock-server';

export const createServer = (mockData: MockData, config?: CdfApiConfig) => {
  const server = createMockServer();
  const mockServerConfig = config ? config : null;

  server.use(cdfMiddleware(mockData, mockServerConfig, []));

  return server;
};
