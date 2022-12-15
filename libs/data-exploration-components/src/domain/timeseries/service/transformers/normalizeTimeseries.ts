import { Timeseries } from '@cognite/sdk';
import { InternalTimeseriesData } from 'domain/timeseries';

export const normalizeTimeseries = (
  items: Timeseries[]
): InternalTimeseriesData[] => {
  return items.map(item => ({
    id: item.id,
    lastUpdatedTime: item.lastUpdatedTime,
    createdTime: item.createdTime,
    isString: item.isString,
    isStep: item.isStep,
    description: item.description,
    name: item.name,
    unit: item.unit,
    externalId: item.externalId,
    metadata: item.metadata,
    assetId: item.assetId,
    dataSetId: item.dataSetId,
    securityCategories: item.securityCategories,
  }));
};
