import { Well } from 'domain/wells/well/internal/types';

import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { useWells } from 'modules/wellSearch/selectors';

export const useWellColumnsWithSelectionStatus = (
  wellColumns: ColumnMap<Well>
) => {
  const { selectedColumns } = useWells();

  return Object.keys(wellColumns).reduce((results, column) => {
    return {
      ...results,
      [column]: {
        ...wellColumns[column],
        selected: selectedColumns.includes(column),
      },
    };
  }, {} as typeof wellColumns);
};
