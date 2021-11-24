import { useQuery } from 'react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { UserPrefferedUnit } from 'constants/units';

import { getFilterOptions } from '../service';

export const useWellFilterOptions = (unit: UserPrefferedUnit) => {
  return useQuery(WELL_QUERY_KEY.FILTER_OPTIONS, () => getFilterOptions(unit));
};
