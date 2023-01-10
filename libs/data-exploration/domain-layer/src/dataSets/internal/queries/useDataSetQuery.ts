import { useInfiniteList } from '@cognite/sdk-react-query-hooks';
import { mergeDataSetResponsePages } from '@data-exploration-lib/domain-layer';
import { DataSetInternal } from '@data-exploration-lib/domain-layer';
import { DATA_SET_LIMIT } from '../../service/constants';

export const useDataSetQuery = () => {
  const result = useInfiniteList<DataSetInternal>('datasets', DATA_SET_LIMIT);

  if (result.hasNextPage && !result.isFetching) {
    result.fetchNextPage();
  }

  const data = mergeDataSetResponsePages(result.data);

  return {
    ...result,
    data,
  };
};
