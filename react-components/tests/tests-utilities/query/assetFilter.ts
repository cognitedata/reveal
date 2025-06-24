import {
  type AssetAdvancedFilterProps,
  isAndFilter,
  isLeafFilter,
  isOrFilter
} from '../../../src/query/network/filters';

import { isEqual } from 'lodash';
import { assertNever } from '../../../src/utilities/assertNever';

export function filterIncludesFilterNode(
  advancedFilter: AssetAdvancedFilterProps,
  filterToFind: AssetAdvancedFilterProps
): boolean {
  if (isEqual(advancedFilter, filterToFind)) {
    return true;
  }

  if (isOrFilter(advancedFilter)) {
    return advancedFilter.or.every((innerFilter) =>
      filterIncludesFilterNode(innerFilter, filterToFind)
    );
  }

  if (isAndFilter(advancedFilter)) {
    return advancedFilter.and.some((innerFilter) =>
      filterIncludesFilterNode(innerFilter, filterToFind)
    );
  }

  if (isLeafFilter(advancedFilter)) {
    return false;
  }

  assertNever(advancedFilter);
}
