import cloneDeep from 'lodash/cloneDeep';
import { sortByCaseInsensitive } from 'utils/sort';

import { useFavoritesQuery } from '../queries/useFavoritesQuery';

export function useFavoritesSortedByName() {
  const result = useFavoritesQuery();

  return {
    ...result,
    data: result.data
      ? cloneDeep(result.data).sort((a, b) =>
          sortByCaseInsensitive(a.name, b.name)
        )
      : result.data,
  };
}
