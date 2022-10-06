import { aggregate, SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { CogniteClient, DataSet } from '@cognite/sdk';
import { DataSetWithCount } from 'app/domain/dataSets/internal/types';

export const getAggregateByIds = (
  sdk: CogniteClient,
  type: SdkResourceType,
  dataSets: DataSet[]
) => {
  const makePromises = dataSets.map(async dataSet => {
    const filter = { dataSetIds: [{ id: dataSet.id }] };
    const { count } = await aggregate(sdk, type, filter);

    return {
      ...dataSet,
      count,
    };
  });

  return Promise.all<Promise<DataSetWithCount>>(makePromises);
};
