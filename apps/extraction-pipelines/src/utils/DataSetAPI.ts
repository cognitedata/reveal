import { DataSet, IdEither, ListResponse } from '@cognite/sdk';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DataSetModel } from '../model/DataSetModel';
import { mapDataSetResponse } from './dataSetUtils';

export const getDataSets = async (ids: IdEither[]): Promise<DataSetModel[]> => {
  const res = await sdkv3.datasets.retrieve(ids);
  return mapDataSetResponse(res);
};
export const getDataSetsList = async (
  limit: number = 100
): Promise<ListResponse<DataSet[]>> => {
  const res = await sdkv3.datasets.list({ limit });
  return res;
};
