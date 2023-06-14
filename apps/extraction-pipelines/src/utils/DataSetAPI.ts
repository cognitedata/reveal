import { CogniteClient, IdEither } from '@cognite/sdk';
import { DataSetModel } from 'model/DataSetModel';
import { mapDataSetResponse } from './dataSetUtils';

export const getDataSets = async (
  sdk: CogniteClient,
  ids: IdEither[]
): Promise<DataSetModel[]> => {
  const res = await sdk.datasets.retrieve(ids);
  return mapDataSetResponse(res);
};
export const getDataSetsList = async (
  sdk: CogniteClient,
  limit: number = 100
) => {
  const res = await sdk.datasets.list({ limit });
  const unarchivedDataSets = res.items.filter(
    (dataSet) => dataSet.metadata?.archived !== 'true'
  );
  return unarchivedDataSets;
};
