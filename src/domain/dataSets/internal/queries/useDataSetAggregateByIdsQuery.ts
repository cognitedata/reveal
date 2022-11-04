import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { DataSetInternal } from 'domain/dataSets/internal/types';
import { useQuery } from 'react-query';
import { ONE_HOUR_IN_MS } from '../../service/constants';
import { getAggregateByIds } from '../../service/network/getAggregateById';

export const useDataSetAggregateByIdsQuery = (
  type: SdkResourceType | undefined,
  dataSets: DataSetInternal[]
) => {
  const sdk = useSDK();

  return useQuery(
    ['dataset-counts', type, dataSets],
    () => {
      if (type) {
        return getAggregateByIds(sdk, type, dataSets);
      }

      return dataSets;
    },
    {
      enabled: dataSets?.length > 0,
      staleTime: ONE_HOUR_IN_MS,
    }
  );
};
