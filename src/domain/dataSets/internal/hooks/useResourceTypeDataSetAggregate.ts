import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { useDataSetAggregateByIdsQuery } from 'domain/dataSets/internal/queries/useDataSetAggregateByIdsQuery';
import { useDataSetQuery } from 'domain/dataSets/internal/queries/useDataSetQuery';

export const useResourceTypeDataSetAggregate = (type: SdkResourceType) => {
  const { data: datasets } = useDataSetQuery();

  return useDataSetAggregateByIdsQuery(type, datasets);
};
