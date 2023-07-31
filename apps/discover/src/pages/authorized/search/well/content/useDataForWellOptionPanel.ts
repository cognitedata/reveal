import { sortArrayByOrder } from 'utils/sort/sortByOrder';

import { AvailableColumn } from 'pages/authorized/search/common/types';

import { useEnabledWellResultColumns } from '../useEnabledWellResultColumns';
import { useWellColumnsWithSelectionStatus } from '../useWellColumnsWithSelectionStatus';

export const useDataForWellOptionPanel = () => {
  const enabledWellColumns = useEnabledWellResultColumns();
  const visibleWellColumnsWithSelection =
    useWellColumnsWithSelectionStatus(enabledWellColumns);

  const columnsWithOptionPanelFields = Object.keys(
    visibleWellColumnsWithSelection
  ).map((columnName) => {
    const column = visibleWellColumnsWithSelection[columnName];
    return {
      ...column,
      name: column.Header,
      field: columnName,
    } as AvailableColumn;
  });

  const columns = sortArrayByOrder(columnsWithOptionPanelFields);

  return { columns };
};
