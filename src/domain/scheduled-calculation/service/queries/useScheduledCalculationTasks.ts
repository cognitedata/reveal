import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { fetchScheduledCalculationTasks } from '../network/fetchScheduledCalculationTasks';
import { ScheduledCalculationTask } from '../types';

export const useScheduledCalculationTasks = (externalIds: ExternalId[]) => {
  const sdk = useSDK();

  return useQuery<ScheduledCalculationTask[]>(
    ['scheduled-calculations', externalIds],
    () => {
      return fetchScheduledCalculationTasks(externalIds, sdk).then(
        ({ data }) => data.items
      );
    },
    { enabled: Boolean(externalIds?.length) }
  );
};
