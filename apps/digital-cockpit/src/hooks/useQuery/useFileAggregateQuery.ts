import { useContext } from 'react';
import { useQuery } from 'react-query';
import { FileAggregateQuery } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useFileAggregateQuery = (fileAggregateQuery?: FileAggregateQuery) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<number>(
    ['fileAggregate', fileAggregateQuery],
    () =>
      client.files
        .aggregate(fileAggregateQuery || {})
        .then((res) => res[0].count),
    {
      enabled: Boolean(fileAggregateQuery),
    }
  );
  return query;
};

export default useFileAggregateQuery;
