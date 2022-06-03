import {
  CdfApiConfig,
  CdfMockDatabase,
  CdfServerRouter,
  MockData,
} from '../types';
import createCdfRestRouter from './cdf-rest-middleware';
import templatesMiddleware from './templates';
import timeseriesMiddleware from './timeseries';
import schemaServiceMiddleware from './schema/schema-service-middleware';
import filesMiddleware from './files';
import { router as jsonServerRouter, rewriter } from 'json-server';
import { createConfigDefaults, createDefaultMockApiEndpoints } from '../utils';
import path = require('path');
import { loadMiddlewares } from '../../cli/loader';

export default function (
  mockData: MockData,
  config: CdfApiConfig,
  middlewares: string[]
): CdfServerRouter {
  let customMiddlewares;
  try {
    customMiddlewares = middlewares ? loadMiddlewares(middlewares) : [];
  } catch (err) {
    console.error('Not able to load middlewares', err);
  }

  const db = createDefaultMockApiEndpoints(mockData);
  // Create JSON server REST API endpoints and db
  const jsonServerApiRouter = jsonServerRouter(db);
  const jsonServerDb = jsonServerApiRouter.db as any as CdfMockDatabase;
  // set json server id to be externalId because that is how cdf works
  (jsonServerDb._ as any).id = 'externalId';

  const serverConfig = createConfigDefaults(config || ({} as CdfApiConfig));

  const templatesApiRouter = templatesMiddleware(jsonServerDb, serverConfig);

  const timeseriesApiRouter = timeseriesMiddleware(jsonServerDb, serverConfig);

  const schemaServiceApiRouter = schemaServiceMiddleware(
    jsonServerDb,
    serverConfig
  );

  const filesApiRouter = filesMiddleware(jsonServerDb, serverConfig);

  const cdfDb = jsonServerDb;

  const cdfRouter = createCdfRestRouter(cdfDb, serverConfig);

  // Rewrite the endpoints to use the CDF convention
  cdfRouter.use(rewriter(serverConfig.urlRewrites));

  cdfRouter.get('/playground', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/playground.html'));
  });

  if (customMiddlewares.length) {
    cdfRouter.use(customMiddlewares);
  }

  cdfRouter.use(templatesApiRouter);
  cdfRouter.use(timeseriesApiRouter);
  cdfRouter.use(schemaServiceApiRouter);
  cdfRouter.use(filesApiRouter);
  cdfRouter.use(jsonServerApiRouter);

  cdfRouter.db = cdfDb;

  return cdfRouter;
}
