import { DoglegSeverityUnitInternal } from 'domain/wells/trajectory/internal/types';

import pick from 'lodash/pick';
import { sortByOrder } from 'utils/sort/sortByOrder';

import { useWells } from 'modules/wellSearch/selectors';

import { useEnabledWellResultColumns } from '../../useEnabledWellResultColumns';

export const useColumns = (doglegUnit?: DoglegSeverityUnitInternal) => {
  const { selectedColumns } = useWells();
  const enabledWellColumns = useEnabledWellResultColumns(doglegUnit);

  const selectedVisibleColumns = pick(enabledWellColumns, selectedColumns);

  return sortByOrder(selectedVisibleColumns);
};

export const useDataForTable = (unit?: DoglegSeverityUnitInternal) => {
  const columns = useColumns(unit);

  return { columns };
};
