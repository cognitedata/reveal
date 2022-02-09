import React from 'react';
import { useDispatch } from 'react-redux';

import sortBy from 'lodash/sortBy';

import { UserPrefferedUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { AvailableColumn } from 'modules/documentSearch/types';
import { getAvailableColumns } from 'modules/documentSearch/utils/columns';
import { wellSearchActions } from 'modules/wellSearch/actions';

import OptionsPanel from '../../document/header/options/OptionsPanel';
import { generateWellColumns } from '../utils';

type Props = {
  userPreferredUnit: UserPrefferedUnit;
  selectedColumns: string[];
};

export const WellOptionPanel: React.FC<Props> = React.memo(
  ({ userPreferredUnit, selectedColumns }) => {
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

    const availableColumns = useDeepMemo(
      () => getAvailableColumns(generateWellColumns(userPreferredUnit)),
      [userPreferredUnit]
    );

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
  }
);
