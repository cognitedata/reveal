import { Router } from 'express';
import { graphql } from 'graphql';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';
import { buildSchemaServiceMetaApiMockServer } from './schemaservice/metaApi/graphql-api-builder';
// import { buildAppsApiMockServer } from './schemaservice/applicationAPI/graphql-api-builder';
import { buildFromMockDb } from './schemaservice/applicationAPI/graphql-mock-server-builder';
import { createMockServerKey } from './utils/graphql-server-utils';
import { CdfDatabaseService } from '../../common/cdf-database.service';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  let schemaServiceDb = db;
  // Create router
  const schemaServiceRouter = Router() as ExtendedRouter;

  let graphQlServers;
  let metaApiGraphqlMockServer;
  schemaServiceRouter.init = (mockData: CdfMockDatabase) => {
    schemaServiceDb = mockData || db;

    graphQlServers = null;
    metaApiGraphqlMockServer = null;
    graphQlServers = buildFromMockDb(schemaServiceDb);
    metaApiGraphqlMockServer = buildSchemaServiceMetaApiMockServer({
      db: schemaServiceDb,
      graphQlServers,
    });
  };
  schemaServiceRouter.init();

  schemaServiceRouter.post('/datamodelstorage/nodes', (req, res) => {
    if (!req.body.spaceExternalId) {
      return res
        .status(400)
        .jsonp({ errorMessage: 'spaceExternalId can not be empty' });
    }

    if (!req.body.model) {
      return res.status(400).jsonp({ errorMessage: 'model can not be empty' });
    }

    if (!req.body.items || !req.body.items.length) {
      return res.status(400).jsonp({ errorMessage: 'items can not be empty' });
    }

    const model = req.body.model[0];

    const schemaDb = CdfDatabaseService.from(schemaServiceDb, 'schema');
    const dataModel = schemaDb.find({ externalId: req.body.spaceExternalId });
    const dataModelDb = dataModel.db;

    // eslint-disable-next-line
    if (!dataModelDb.hasOwnProperty(model)) {
      dataModelDb[model] = [];
    }

    // temporary hack, I wanted to just reuse everything what json-server is doing
    // so I don't have to reimplement all apis
    // for ingest, we need to insert in nodes and as well in the schema db
    // because the graphql apis will use schema.db field
    req.body.items.forEach((item) => {
      dataModelDb[model].filter(
        (dbItem) => item.externalId !== dbItem.externalId
      );
      dataModelDb[model].push(item);

      CdfDatabaseService.from(schemaServiceDb, 'nodes').deleteByKey({
        externalId: item.externalId,
      });
      CdfDatabaseService.from(schemaServiceDb, 'nodes').insert(item);
    });

    // console.log(JSON.stringify(dataModelDb, null, 2));
    // console.log(CdfDatabaseService.from(db, 'nodes').getState());

    res.status(201).jsonp({ items: req.body.items });
  });

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
