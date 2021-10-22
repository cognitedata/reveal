import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getFilterOptions } from '../service';

export const useWellFilterOptions = (unit: string) => {
  return useQuery(WELL_QUERY_KEY.FILTER_OPTIONS, () => getFilterOptions(unit));
};
