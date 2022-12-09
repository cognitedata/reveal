import { Router } from 'express';
import { graphql } from 'graphql';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';
import { buildSchemaServiceMetaApiMockServer } from './mixerAPi/metaApi/graphql-api-builder';

import {
  buildFromMockDb,
  buildMixerApiGraphQlServersFromMockDb,
} from './mixerAPi/applicationAPI/graphql-mock-server-builder';
import { createMockServerKey } from './utils/graphql-server-utils';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import dmsInstancesApiRouter from './dms/instances-middleware';

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
    graphQlServers = buildFromMockDb(schemaServiceDb);
    graphQlServers = Object.assign(
      graphQlServers,
      buildMixerApiGraphQlServersFromMockDb(schemaServiceDb)
    );

    metaApiGraphqlMockServer = buildSchemaServiceMetaApiMockServer({
      db: schemaServiceDb,
      graphQlServers,
    });
  };
  fdmServiceRouter.init();

  fdmServiceRouter.post('/datamodelstorage/nodes/delete', (req, res) => {
    if (!req.body.items || !req.body.items.length) {
      return res.status(400).jsonp({ errorMessage: 'items can not be empty' });
    }

    const schemaDb = CdfDatabaseService.from(schemaServiceDb, 'schema');
    const dataModel = schemaDb.find({ externalId: req.body.spaceExternalId });
    const dataModelDb = dataModel.db;

    req.body.items.forEach((item) => {
      if (item.externalId === undefined) {
        return res.status(400).jsonp({
          errorMessage: 'one or more items is missing externalId property',
        });
      }
      CdfDatabaseService.from(schemaServiceDb, 'nodes').deleteByKey({
        externalId: item.externalId,
      });

      Object.keys(dataModelDb).forEach((modelName) => {
        dataModelDb[modelName] = dataModelDb[modelName].filter(
          (dbItem) => item.externalId !== dbItem.externalId
        );
      });
    });

    return res.status(200).jsonp({});
  });

  fdmServiceRouter.post('/datamodelstorage/edges/delete', (req, res) => {
    if (!req.body.items || !req.body.items.length) {
      return res.status(400).jsonp({ errorMessage: 'items can not be empty' });
    }

    const schemaDb = CdfDatabaseService.from(schemaServiceDb, 'schema');
    const dataModel = schemaDb.find({ externalId: req.body.spaceExternalId });
    const dataModelDb = dataModel.db;

    req.body.items.forEach((item) => {
      // temporary hack, assume the externalId definition is always "platypus" generated
      // i.e. actor_startNode_endNode
      const field = item.externalId.split('_')[0];
      const startNode = item.externalId.split('_')[1];
      const endNode = item.externalId.split('_')[2];

      if (item.externalId === undefined) {
        return res.status(400).jsonp({
          errorMessage: 'one or more items is missing externalId property',
        });
      }
      CdfDatabaseService.from(schemaServiceDb, 'edges').deleteByKey({
        externalId: item.externalId,
      });

      Object.keys(dataModelDb).forEach((modelName) => {
        const nodeIndex = dataModelDb[modelName].findIndex(
          (el) => `${el.id}` === startNode
        );
        if (nodeIndex >= 0) {
          if (!(modelName in (dataModelDb as object))) {
            dataModelDb[modelName] = [];
          }
          if (!(dataModelDb[modelName] as object)[nodeIndex]) {
            dataModelDb[modelName][nodeIndex] = {};
          }
          if (!(dataModelDb[modelName] as object)[nodeIndex][field]) {
            dataModelDb[modelName][nodeIndex][field] = [];
          }
          dataModelDb[modelName][nodeIndex][field] = dataModelDb[modelName][
            nodeIndex
          ][field].filter((el) => {
            if ('externalId' in el && `${el['externalId']}` === endNode) {
              return false;
            }
            if ('id' in el && `${el['id']}` === endNode) {
              return false;
            }
            return true;
          });
        }
      });
    });

    return res.status(200).jsonp({});
  });

  fdmServiceRouter.post('/datamodelstorage/nodes', (req, res) => {
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

    const model = req.body.model[1];

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
      dataModelDb[model] = dataModelDb[model].filter(
        (dbItem) => item.externalId !== dbItem.externalId
      );
      dataModelDb[model].push(item);

      CdfDatabaseService.from(schemaServiceDb, 'nodes').deleteByKey({
        externalId: item.externalId,
      });
      // Temporary fix!
      CdfDatabaseService.from(schemaServiceDb, 'nodes').insert({
        ...item,
        id: item.externalId,
      });
    });

    res.status(201).jsonp({ items: req.body.items });
  });

  fdmServiceRouter.post('/datamodelstorage/edges', (req, res) => {
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

    const model = req.body.model[1];

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
      // temporary hack, assume the externalId definition is always "platypus" generated
      // i.e. actor_startNode_endNode
      const field = item.externalId.split('_')[0];
      const startNode = item.externalId.split('_')[1];
      const endNode = item.externalId.split('_')[2];
      Object.keys(dataModelDb).forEach((modelName) => {
        const nodeIndex = dataModelDb[modelName].findIndex(
          (el) => `${el.id}` === startNode
        );
        if (nodeIndex >= 0) {
          if (!(modelName in (dataModelDb as object))) {
            dataModelDb[modelName] = [];
          }
          if (!(dataModelDb[modelName] as object)[nodeIndex]) {
            dataModelDb[modelName][nodeIndex] = {};
          }
          if (!(dataModelDb[modelName] as object)[nodeIndex][field]) {
            dataModelDb[modelName][nodeIndex][field] = [];
          }
          dataModelDb[modelName][nodeIndex][field] = dataModelDb[modelName][
            nodeIndex
          ][field].concat([{ externalId: endNode }]);
        }
      });

      CdfDatabaseService.from(schemaServiceDb, 'edges').deleteByKey({
        externalId: item.externalId,
      });
      // Temporary fix!
      CdfDatabaseService.from(schemaServiceDb, 'edges').insert({
        ...item,
        id: item.externalId,
      });
    });

    res.status(201).jsonp({ items: req.body.items });
  });

  fdmServiceRouter.post('/schema/graphql', async (req, res) => {
    const query = req.body;

    const response = await graphql({
      schema: metaApiGraphqlMockServer,
      source: query.query,
      variableValues: query.variables,
    });

    res.jsonp(response);
  });

  fdmServiceRouter.post(
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
        console.log('server key not found', serverKey);
        res.jsonp([]);
        return;
      }

      const response = await graphql({
        schema: graphQlServers[serverKey],
        source: `
          ${graphQlQuery}
        `,
      });
      res.jsonp(response);
    }
  );

  fdmServiceRouter.post(
    '/schema/api/:space/:externalId/:version/graphql',
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
      });
      res.jsonp(response);
    }
  );

  fdmServiceRouter.use(dmsInstancesMiddleware);

  return fdmServiceRouter;
}
