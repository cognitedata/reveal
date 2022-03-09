import { useQuery } from 'react-query';
import { FileAggregateQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useFileAggregateQuery = (fileAggregateQuery?: FileAggregateQuery) => {
  const { client } = useCDFExplorerContext();

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
