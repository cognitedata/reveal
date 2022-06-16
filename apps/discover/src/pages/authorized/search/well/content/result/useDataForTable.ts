import { DogLegSeverityUnit } from 'domain/wells/wellbore/internal/types';

import pick from 'lodash/pick';
import { sortByOrder } from 'utils/sort/sortByOrder';

import { useWells } from 'modules/wellSearch/selectors';

import { useEnabledWellResultColumns } from '../../useEnabledWellResultColumns';

export const useColumns = (doglegUnit?: DogLegSeverityUnit) => {
  const { selectedColumns } = useWells();
  const enabledWellColumns = useEnabledWellResultColumns(doglegUnit);

  const selectedVisibleColumns = pick(enabledWellColumns, selectedColumns);

  return sortByOrder(selectedVisibleColumns);
};

export const useDataForTable = (unit?: DogLegSeverityUnit) => {
  const columns = useColumns(unit);

  return { columns };
};
