import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { useDataSetAggregateByIdsQuery } from '../queries/useDataSetAggregateByIdsQuery';
import { useDataSetQuery } from '../queries/useDataSetQuery';

export const useResourceTypeDataSetAggregate = (type: SdkResourceType) => {
  const { data: datasets } = useDataSetQuery();

  return useDataSetAggregateByIdsQuery(type, datasets);
};
