import { useSDK } from '@cognite/sdk-provider';
import { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { TableSortBy } from '../../../../components/ReactTable/V2';
import { queryKeys } from '../../../queryKeys';
import { InternalAssetTreeData, InternalAssetFilters } from '../../internal';
import { useAssetsSearchResultQuery } from '../../internal';
import keyBy from 'lodash/keyBy';
import { buildTree } from '../utils/buildTree';
import { concatParents } from '../utils/concatParents';

export const useSearchAssetTree = ({
  query,
  assetFilter,
  sortBy,
}: {
  query?: string;
  assetFilter: InternalAssetFilters;
  sortBy: TableSortBy[];
}) => {
  const sdkClient = useSDK();

  const { data, ...rest } = useAssetsSearchResultQuery({
    query,
    assetFilter,
    sortBy: sortBy,
  });

  // get all parent ids from path aggregates
  const parentIds = useMemo(() => {
    return data.reduce((previousValue, currentValue) => {
      const pathIds =
        currentValue.aggregates?.path?.reduce((ids, path) => {
          if ('id' in path && currentValue.id !== path.id) {
            return [...ids, path.id];
          }

          return ids;
        }, [] as number[]) || [];

      return Array.from(new Set([...previousValue, ...pathIds]));
    }, [] as number[]);
  }, [data]);

  const { data: parentAssets, refetch } = useQuery<
    Record<string, InternalAssetTreeData>
  >([queryKeys.assets(), 'parent-assets'], () => {
    return sdkClient.assets
      .retrieve(parentIds.map(id => ({ id })))
      .then(response => {
        return keyBy(response, 'id');
      });
  });

  useEffect(() => {
    // We use the 'refetch' function to get the data when new parentIds arrive instead of updating the query key
    // this way the table doesn't jump
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentIds]);

  return useMemo(() => {
    if (parentAssets !== undefined) {
      const tree = data.reduce((previousValue, currentValue) => {
        return [...previousValue, buildTree(currentValue, parentAssets)];
      }, [] as InternalAssetTreeData[]);

      return { data: concatParents(tree), ...rest };
    }

    return { data: [], ...rest };
  }, [parentAssets, data, rest]);
};
