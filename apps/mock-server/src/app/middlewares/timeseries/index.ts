import { Router } from 'express';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import {
  CdfApiConfig,
  CdfMockDatabase,
  CdfResourceObject,
  ExtendedRouter,
} from '../../types';
import { filterCollection } from '../../utils';

export default function (db: CdfMockDatabase, config: CdfApiConfig) {
  // Create router
  const timeseriesApiRouter = Router() as ExtendedRouter;

  timeseriesApiRouter.post('/timeseries/data/list', async (req, res) => {
    const datapoints = CdfDatabaseService.from(db, 'datapoints').getState();
    const filters = req.body.items;

    const timeseriesDataPoints = filterCollection(datapoints, {
      externalId: {
        eq: filters.externalId,
      },
    }) as CdfResourceObject[];

    res.status(200).jsonp({ items: timeseriesDataPoints });
  });

  return timeseriesApiRouter;
}
