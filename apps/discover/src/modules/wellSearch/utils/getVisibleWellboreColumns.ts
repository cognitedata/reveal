import intersection from 'lodash/intersection';

import { ColumnType } from 'components/tablev3/types';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { Well, Wellbore } from 'modules/wellSearch/types';

export const getVisibleWellboreColumns = (
  selectedColumns: string[],
  wellColumns: ColumnMap<Well>,
  wellboreColumns: ColumnMap<Wellbore>
) => {
  const wellColumnNames = Object.keys(wellColumns);
  const wellboreColumnsNames = Object.keys(wellboreColumns);

  // getting common columns in well and wellbore table
  const commonColumnsNames = intersection(
    wellColumnNames,
    wellboreColumnsNames
  );

  return Object.keys(wellboreColumns).reduce(
    (resultColumns: ColumnType<Wellbore>[], currentColumnName) => {
      // if a key includes in intersection array and not include in selected columns.
      if (
        commonColumnsNames.includes(currentColumnName) &&
        !selectedColumns.includes(currentColumnName)
      )
        return resultColumns;

      return [...resultColumns, wellboreColumns[currentColumnName]];
    },
    []
  );
};
