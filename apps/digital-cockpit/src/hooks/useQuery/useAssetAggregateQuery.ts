import { useQuery } from 'react-query';
import { AssetAggregateQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useAssetAggregateQuery = (assetAggregateQuery?: AssetAggregateQuery) => {
  const { client } = useCDFExplorerContext();
  const query = useQuery<number>(
    ['assetAggregate', assetAggregateQuery],
    () =>
      client.assets
        .aggregate(assetAggregateQuery || {})
        .then((res) => res[0].count),
    {
      enabled: Boolean(assetAggregateQuery),
    }
  );
  return query;
};

export default useAssetAggregateQuery;
