import { IdEither } from '@cognite/sdk';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DataSetModel } from 'model/DataSetModel';
import { mapDataSetResponse } from './dataSetUtils';

export const getDataSets = async (ids: IdEither[]): Promise<DataSetModel[]> => {
  const res = await sdkv3.datasets.retrieve(ids);
  return mapDataSetResponse(res);
};
export const getDataSetsList = async (limit: number = 100) => {
  const res = await sdkv3.datasets.list({ limit });
  const unarchivedDataSets = res.items.filter(
    (dataSet) => dataSet.metadata?.archived !== 'true'
  );
  return unarchivedDataSets;
};
