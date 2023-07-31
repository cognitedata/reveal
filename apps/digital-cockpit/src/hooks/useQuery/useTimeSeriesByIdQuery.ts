import { useQuery } from '@tanstack/react-query';
import { IdEither, Timeseries } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useTimeSeriesByIdQuery = (ids?: IdEither[]) => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<Timeseries[]>(
    ['timeSeriesByIdQuery', ids],
    () => client.timeseries.retrieve(ids as IdEither[]),
    {
      enabled: Boolean(ids),
    }
  );
  return query;
};

export default useTimeSeriesByIdQuery;
