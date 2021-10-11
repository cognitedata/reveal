import { filterConfigs } from 'modules/wellSearch/constants';

export function getFilterOptions(): Promise<any> {
  const filterFetchers = filterConfigs.filter(
    (filterConfig) => filterConfig.fetcher
  );
  return Promise.all(
    filterFetchers.map(
      (filterConfig) =>
        filterConfig.fetcher && filterConfig.fetcher()?.catch(() => [])
    )
  ).then(
    (responses) =>
      filterFetchers.reduce(
        (prev, current, index) => ({
          ...prev,
          [current.id]: (responses[index] as string[]).map((value) => ({
            value,
          })),
        }),
        {}
      ),
    () => ({})
  );
}
