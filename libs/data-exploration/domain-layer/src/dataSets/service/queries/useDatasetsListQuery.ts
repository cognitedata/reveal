import { useSDK } from '@cognite/sdk-provider';
import { DataSet, DataSetFilter } from '@cognite/sdk';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '../../../queryKeys';
import { getDatasetsList } from '../network';

export const useDatasetsListQuery = (
  {
    filter,
    limit,
    filterArchivedItems,
  }: {
    filter?: DataSetFilter;
    limit?: number;
    filterArchivedItems?: boolean;
  },
  options?: Omit<UseQueryOptions<DataSet[], any, DataSet[]>, 'queryFn'>
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.listDatasets(filter, limit),
    () =>
      getDatasetsList(sdk, {
        filter,
        limit,
      }),
    {
      select: (datasets) =>
        filterArchivedItems
          ? datasets.filter((item) => {
              if (item?.metadata && item.metadata['archived'] === 'true')
                return false;
              return true;
            })
          : datasets,
      ...(options as any),
    }
  );
};
