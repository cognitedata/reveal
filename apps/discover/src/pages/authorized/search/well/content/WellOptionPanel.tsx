import React from 'react';
import { useDispatch } from 'react-redux';

import { wellSearchActions } from 'modules/wellSearch/actions';
import { AvailableColumn } from 'pages/authorized/search/common/types';

import OptionsPanel from '../../document/header/options/OptionsPanel';

import { useDataForWellOptionPanel } from './useDataForWellOptionPanel';

export const WellOptionPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { columns } = useDataForWellOptionPanel();

  const handleColumnSelection = (column: AvailableColumn) => {
    const toggledColumn = {
      ...column,
      selected: !column.selected,
    };

    if (toggledColumn.selected) {
      dispatch<any>(wellSearchActions.addSelectedColumn(column));
    } else {
      dispatch<any>(wellSearchActions.removeSelectedColumn(column));
    }
  };

  return (
    <OptionsPanel
      handleColumnSelection={handleColumnSelection}
      columns={columns}
    />
  );
};
