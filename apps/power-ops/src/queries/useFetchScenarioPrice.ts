import dayjs from 'dayjs';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from 'react-query';
import { DoubleDatapoint } from '@cognite/sdk';

export const useFetchScenarioPrice = (
  bidDate: dayjs.Dayjs | undefined,
  scenarioPriceTsExternalId: string | undefined
) => {
  const { client, project } = useAuthenticatedAuthContext();

  return useQuery({
    queryKey: [project, 'scenario-price', scenarioPriceTsExternalId],
    queryFn: () =>
      client.datapoints
        .retrieve({
          items: [{ externalId: scenarioPriceTsExternalId! }],
          start: bidDate!.startOf('day').valueOf(),
          end: bidDate!.endOf('day').valueOf(),
        })
        .then(([{ datapoints }]) => datapoints as DoubleDatapoint[]),
    enabled: Boolean(bidDate && scenarioPriceTsExternalId),
  });
};
