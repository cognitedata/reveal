import { CdfMockDatabase } from '../../../types';
import { findAssetParent, findAssetRoot } from './assets-utils';
import { filterTimeseriesDatapoints } from './timeseries-utils';

export const assetFieldsResolver = (db: CdfMockDatabase) => {
  return {
    root: (ref) => {
      return findAssetRoot(ref.parentExternalId, db);
    },
    parent: (ref) => {
      return findAssetParent(ref.parentExternalId, db);
    },
    metadata: (ref) => {
      return Object.keys(ref.metadata).map((key) => ({
        key,
        value: ref.metadata[key],
      }));
    },
  };
};

export const timeSeriesFieldsResolver = (db: CdfMockDatabase) => {
  return {
    metadata: (ref) => {
      return Object.keys(ref.metadata).map((key) => ({
        key,
        value: ref.metadata[key],
      }));
    },
    datapoints: (ref, prms) => {
      return filterTimeseriesDatapoints(ref.externalId, db, ref.isString, prms);
    },
  };
};

export const synteticTimeSeriesFieldsResolver = (db: CdfMockDatabase) => {
  return {
    ...timeSeriesFieldsResolver(db),
    datapointsWithGranularity: (ref, prms) => {
      return filterTimeseriesDatapoints(ref.externalId, db, ref.isString, prms);
    },
  };
};
