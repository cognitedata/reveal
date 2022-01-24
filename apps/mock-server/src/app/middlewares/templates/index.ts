import { Router } from 'express';
import { graphql } from 'graphql';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';
import { buildFromMockDb, buildMockServer, createMockServerKey } from './utils';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  // Create router
  const templatesRouter = Router() as ExtendedRouter;
  const graphQlServers = buildFromMockDb(db);

  /**
   * The endpoints for template groups are handled by the generic
   * cdf endpoint handler. That includes following:
   * templategroups/ - create template group
   * templategroups/list - list template groups
   * /templategroups/:templategroups_id/versions/list- list template group versions
   */

  templatesRouter.post('/templategroups/upsert', (req, res) => {
    const response = CdfDatabaseService.from(db, 'templategroups').insert(
      req.body
    );
    res.jsonp({ items: [response] });
  });

  templatesRouter.post(
    '/templategroups/:externalId/versions/upsert',
    (req, res) => {
      const { schema, conflictMode } = req.body;
      const externalId = req.params.externalId.toString();
      const version = req.body.version || 1;

      const executableSchema = buildMockServer({
        db,
        version,
        templategroups_id: externalId,
        schema,
        incrementVersion: conflictMode && conflictMode === 'Update',
      });

      // Initialize your mocked server.
      graphQlServers[`${externalId}_${version}`] = executableSchema;

      res.jsonp({
        externalId,
        schema,
        version,
        lastUpdatedTime: Date.now(),
      });
    }
  );

  templatesRouter.post(
    '/templategroups/:externalId/versions/:version/graphql',
    async (req, res) => {
      const name = req.params.externalId.toString();
      const version = req.params.version.toString();

      const query = req.body;

      const graphQlQuery = `
    ${query.query}
    `;

      const serverKey = createMockServerKey(name, version);
      if (!graphQlServers[serverKey]) {
        res.status(404).jsonp({});
        return;
      }

      const response = await graphql(
        graphQlServers[serverKey],
        `
          ${graphQlQuery}
        `
      );
      res.jsonp(response);
    }
  );

  return templatesRouter;
}
