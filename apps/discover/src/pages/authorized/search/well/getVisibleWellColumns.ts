import { Well } from 'domain/wells/well/internal/types';

import pickBy from 'lodash/pickBy';

import { ColumnMap } from 'modules/documentSearch/utils/columns';

import { getWellColumns } from './getWellColumns';

export type Field = {
  enabled: boolean;
};

// this takes a list of all the columns that are enabled and returns the full form of the objects
export const getVisibleWellColumns = ({
  unit,
  enabled,
}: {
  unit: string;
  enabled: string[];
}): ColumnMap<Well> => {
  const columns = getWellColumns(unit);

  const visibleColumns = pickBy(columns, (_column, key) =>
    enabled.includes(key)
  );

  return visibleColumns;
};
