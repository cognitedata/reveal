import { useQuery } from '@tanstack/react-query';

import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { useAclPermissions } from '../../../chart/service/queries/useAclPermissions';
import { fetchScheduledCalculationTasks } from '../network/fetchScheduledCalculationTasks';
import { ScheduledCalculationTask } from '../types';

export const useScheduledCalculationTasks = (externalIds: ExternalId[]) => {
  const sdk = useSDK();
  const { data: hasSCRead, isFetching } = useAclPermissions(
    'scheduledCalculationsAcl',
    'READ'
  );
  const shouldFetchTasks =
    Boolean(externalIds?.length) && !isFetching && hasSCRead;

  return useQuery<ScheduledCalculationTask[]>(
    ['scheduled-calculations', externalIds, shouldFetchTasks],
    () => {
      return fetchScheduledCalculationTasks(externalIds, sdk).then(
        ({ data }) => data.items
      );
    },
    { enabled: shouldFetchTasks }
  );
};
