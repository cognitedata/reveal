import { useDispatch } from 'react-redux';

import sortBy from 'lodash/sortBy';

import { AvailableColumn } from 'modules/documentSearch/types';
import { getAvailableColumns } from 'modules/documentSearch/utils/columns';
import { wellSearchActions } from 'modules/wellSearch/actions';
import { useWells } from 'modules/wellSearch/selectors';
import { wellColumns } from 'pages/authorized/constant';

import OptionsPanel from '../../document/header/options/OptionsPanel';

const availableColumns = getAvailableColumns(wellColumns);

export const WellOptionPanel: React.FC = () => {
  const { selectedColumns } = useWells();
  const dispatch = useDispatch();

  const handleColumnSelection = (column: AvailableColumn) => {
    const toggledColumn = {
      ...column,
      selected: !column.selected,
    };

    if (toggledColumn.selected) {
      dispatch(wellSearchActions.addSelectedColumn(column));
    } else {
      dispatch(wellSearchActions.removeSelectedColumn(column));
    }
  };

  const mergedColumns = availableColumns.map((availableColumn) => {
    return {
      ...availableColumn,
      selected: selectedColumns.includes(availableColumn.field),
    };
  });

  const sortedColumns = sortBy(mergedColumns, 'order');

  return (
    <OptionsPanel
      handleColumnSelection={handleColumnSelection}
      columns={sortedColumns}
    />
  );
};
