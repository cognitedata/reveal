import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

type FiltersKey = 'logs' | 'logsFrmTops';

export const useTrajectoryQueriesFiltersByKey = (key: FiltersKey) => {
  const { data: wellConfig } = useWellConfig();

  const logQueries = wellConfig?.logs?.queries || [];
  const logTypes = wellConfig?.logs?.types || [];

  const indexOfLogsType = logTypes.indexOf(key);
  const filters = indexOfLogsType >= 0 ? logQueries[indexOfLogsType] : {};

  return filters;
};
