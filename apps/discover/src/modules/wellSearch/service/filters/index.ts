import { UserPreferredUnit } from 'constants/units';
import { filterConfigs } from 'pages/authorized/search/search/SideBar/filters/well/filters';

export function getFilterOptions(
  prefferedUnit: UserPreferredUnit | undefined
): Promise<any> {
  const filterFetchers = filterConfigs(prefferedUnit).filter(
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
          [current.id]: (responses[index] as string[])?.map((value) => ({
            value,
          })),
        }),
        {}
      ),
    () => ({})
  );
}
