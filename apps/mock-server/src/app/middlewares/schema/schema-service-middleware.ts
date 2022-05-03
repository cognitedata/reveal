import { Router } from 'express';
import { graphql } from 'graphql';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';
import { buildSchemaServiceMetaApiMockServer } from './schemaservice/metaApi/graphql-api-builder';
// import { buildAppsApiMockServer } from './schemaservice/applicationAPI/graphql-api-builder';
import {
  buildFromMockDb,
  createMockServerKey,
} from './schemaservice/applicationAPI/graphql-mock-server-builder';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  // Create router
  const schemaServiceRouter = Router() as ExtendedRouter;
  const metaApiGraphqlMockServer = buildSchemaServiceMetaApiMockServer({ db });

  const graphQlServers = buildFromMockDb(db);
  // const graphQlServers = {};

  schemaServiceRouter.post('/schema/graphql', async (req, res) => {
    const query = req.body;

    const response = await graphql({
      schema: metaApiGraphqlMockServer,
      source: query.query,
      variableValues: query.variables,
    });

    res.jsonp(response);
  });

  schemaServiceRouter.post(
    '/schema/api/:externalId/:version/graphql',
    async (req, res) => {
      const externalId = req.params.externalId.toString();
      const version = req.params.version.toString();

      const query = req.body;

      const graphQlQuery = `
    ${query.query}
    `;

      const serverKey = createMockServerKey(externalId, version);
      if (!graphQlServers[serverKey]) {
        // res.status(404).jsonp({});
        // return;
        console.log('server key not found', serverKey);
        res.jsonp([]);
        return;
      }

      const response = await graphql(
        graphQlServers[serverKey],
        `
          ${graphQlQuery}
        `
      );
      res.jsonp(response);
      // res.jsonp([]);
    }
  );

  return schemaServiceRouter;
}
