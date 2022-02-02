import { useContext } from 'react';
import { useQuery } from 'react-query';
import { IdEither, Timeseries } from '@cognite/sdk';
import { AuthContext } from 'providers/AuthProvider';

const useSingleTimeSeriesQuery = (reference?: IdEither) => {
  const { client } = useContext(AuthContext);

  const query = useQuery<Timeseries>(
    ['timeSeries', reference],
    () => {
      if (!reference) {
        throw new Error('Unreachable code');
      }
      return client.timeseries.retrieve([reference]).then((res) => res[0]);
    },
    {
      enabled: Boolean(reference),
    }
  );
  return query;
};

export default useSingleTimeSeriesQuery;
