import { useWells } from 'modules/wellSearch/selectors';
import { getVisibleWellboreColumns } from 'modules/wellSearch/utils/getVisibleWellboreColumns';
import { getWellboreColumns } from 'pages/authorized/constant';
import { getWellColumns } from 'pages/authorized/search/well/getWellColumns';

import { useUserPreferencesMeasurement } from './useUserPreferences';

export const useVisibleWellboreColumns = () => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { selectedColumns } = useWells();
  const wellColumns = getWellColumns(userPreferredUnit);
  const wellboreColumns = getWellboreColumns(userPreferredUnit);

  return getVisibleWellboreColumns(
    selectedColumns,
    wellColumns,
    wellboreColumns
  );
};
