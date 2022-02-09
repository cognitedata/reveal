import { Router } from 'express';
import { graphql } from 'graphql';
import { CdfApiConfig, CdfMockDatabase, ExtendedRouter } from '../../types';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  // Create router
  const schemaServiceRouter = Router() as ExtendedRouter;

  schemaServiceRouter.post('/schema/graphql', async (req, res) => {
    res.status(200).jsonp({ items: [] });
  });

  return schemaServiceRouter;
}
