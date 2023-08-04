import { Router } from 'express';
import { graphql } from 'graphql';

import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';

import dmsInstancesApiRouter from './dms/instances-middleware';
import { buildMixerApiGraphQlServersFromMockDb } from './mixerAPi/applicationAPI/graphql-mock-server-builder';
import { buildSchemaServiceMetaApiMockServer } from './mixerAPi/metaApi/graphql-api-builder';
import { createMockServerKey } from './utils/graphql-server-utils';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  let schemaServiceDb = db;
  // Create router
  const fdmServiceRouter = Router() as ExtendedRouter;
  const dmsInstancesMiddleware = dmsInstancesApiRouter(db, config);

  let graphQlServers;
  let metaApiGraphqlMockServer;
  fdmServiceRouter.init = (mockData: CdfMockDatabase) => {
    schemaServiceDb = mockData || db;

    graphQlServers = null;
    metaApiGraphqlMockServer = null;
    graphQlServers = buildMixerApiGraphQlServersFromMockDb(schemaServiceDb);

    metaApiGraphqlMockServer = buildSchemaServiceMetaApiMockServer({
      db: schemaServiceDb,
      graphQlServers,
    });
  };
  fdmServiceRouter.init();

  fdmServiceRouter.post('/dml/graphql', async (req, res) => {
    const query = req.body;

    const response = await graphql({
      schema: metaApiGraphqlMockServer,
      source: query.query,
      variableValues: query.variables,
    });

    res.jsonp(response);
  });

  fdmServiceRouter.post(
    '/userapis/spaces/:space/datamodels/:externalId/versions/:version/graphql',
    async (req, res) => {
      const space = req.params.space.toString();
      const externalId = req.params.externalId.toString();
      const version = req.params.version.toString();

      const query = req.body;

      const graphQlQuery = `
    ${query.query}
    `;

      const serverKey = createMockServerKey(`${space}_${externalId}`, version);
      if (!graphQlServers[serverKey]) {
        console.log('server key not found', serverKey);
        res.jsonp([]);
        return;
      }

      const response = await graphql({
        schema: graphQlServers[serverKey],
        source: `
          ${graphQlQuery}
        `,
        variableValues: query.variables || {},
      });
      res.jsonp(response);
    }
  );

  fdmServiceRouter.use(dmsInstancesMiddleware);

  return fdmServiceRouter;
}
