import { useMutation, useQueryClient } from 'react-query';
import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { deleteTimeseries } from '../network/deleteTimeseries';

export const useTimeseriesDeleteMutate = () => {
  const sdk = useSDK();
  const client = useQueryClient();

  return useMutation(
    (timeseries: ExternalId[]) => deleteTimeseries(timeseries, sdk),
    {
      onSettled: () => {
        client.invalidateQueries(['timeseries']);
      },
    }
  );
};
