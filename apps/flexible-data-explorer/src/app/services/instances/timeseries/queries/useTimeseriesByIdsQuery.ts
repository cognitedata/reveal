import { IdEither, Timeseries } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

export const useTimeseriesByIdsQuery = (ids?: (IdEither | null)[]) => {
  const idsNotNull = ids?.filter((id): id is IdEither => id !== null);

  return useCdfItems<Timeseries>('timeseries', idsNotNull || [], false, {
    enabled: idsNotNull !== undefined,
  });
};
