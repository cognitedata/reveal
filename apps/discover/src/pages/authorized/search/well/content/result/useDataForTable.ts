import pick from 'lodash/pick';
import { sortByOrder } from 'utils/sort/sortByOrder';

import { useWells } from 'modules/wellSearch/selectors';

import { useEnabledWellResultColumns } from '../../useEnabledWellResultColumns';

export const useColumns = () => {
  const { selectedColumns } = useWells();
  const enabledWellColumns = useEnabledWellResultColumns();

  const selectedVisibleColumns = pick(enabledWellColumns, selectedColumns);

  return sortByOrder(selectedVisibleColumns);
};

export const useDataForTable = () => {
  const columns = useColumns();

  return { columns };
};
