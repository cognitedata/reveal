import { CdfDatabaseService } from '../../../common/cdf-database.service';
import { CdfMockDatabase, CdfResourceObject } from '../../../types';
import { filterCollection } from '../../../utils';

export const findDatapoints = (
  externalId: string,
  db: CdfMockDatabase
): CdfResourceObject[] => {
  const linkedData = CdfDatabaseService.from(db, 'datapoints').find({
    externalId,
  });
  return linkedData.datapoints as CdfResourceObject[];
};

export const filterTimeseriesDatapoints = (
  externalId: string,
  db: CdfMockDatabase,
  isString: boolean,
  prms: any
): CdfResourceObject[] => {
  let datapoints = findDatapoints(externalId, db);

  if (prms.start || prms.end) {
    const filters = {
      timestamp: {},
    };

    if (prms.start) {
      filters.timestamp['gte'] = prms.start;
    }
    if (prms.end) {
      filters.timestamp['lte'] = prms.end;
    }

    datapoints = filterCollection(datapoints, filters) as CdfResourceObject[];
  }

  if (prms.limit) {
    datapoints = datapoints.slice(0, prms.limit);
  }

  return datapoints.map((dp) => {
    return isString
      ? {
          ...dp,
          value: null,
          stringValue: dp.value,
          __typename: 'DatapointString',
        }
      : { ...dp, __typename: 'DatapointFloat' };
  });
};
