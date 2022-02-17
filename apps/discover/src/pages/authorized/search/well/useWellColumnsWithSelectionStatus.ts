import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { useWells } from 'modules/wellSearch/selectors';
import { Well } from 'modules/wellSearch/types';

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
