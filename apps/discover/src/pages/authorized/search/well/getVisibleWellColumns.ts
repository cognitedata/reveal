import { Well } from 'domain/wells/well/internal/types';
import { DogLegSeverityUnit } from 'domain/wells/wellbore/internal/types';

import pickBy from 'lodash/pickBy';

import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';

import { getWellColumns } from './getWellColumns';

export type Field = {
  enabled: boolean;
};

// this takes a list of all the columns that are enabled and returns the full form of the objects
export const getVisibleWellColumns = ({
  unit,
  enabled,
  doglegUnit,
}: {
  unit: string;
  enabled: string[];
  doglegUnit?: DogLegSeverityUnit;
}): ColumnMap<Well> => {
  const columns = getWellColumns(unit, doglegUnit);

  const visibleColumns = pickBy(columns, (_column, key) =>
    enabled.includes(key)
  );

  return visibleColumns;
};
