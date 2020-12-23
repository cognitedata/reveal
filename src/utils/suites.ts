import { Suite } from 'store/suites/types';

export function sortByLastUpdated(
  suites: Suite[],
  order: 'asc' | 'desc' = 'asc'
): Suite[] {
  return suites?.sort((x: Suite, y: Suite) =>
    order === 'asc'
      ? new Date(x?.lastUpdatedTime as Date).getTime() -
        new Date(y?.lastUpdatedTime as Date).getTime()
      : new Date(y?.lastUpdatedTime as Date).getTime() -
        new Date(x?.lastUpdatedTime as Date).getTime()
  );
}
