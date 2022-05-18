import { UserPreferredUnit } from 'constants/units';

export const getUnitConverterItemForDistance = <T>(
  accessor: keyof T,
  toUnit: UserPreferredUnit
) => ({
  id: accessor,
  accessor: `${accessor}.value`,
  fromAccessor: `${accessor}.unit`,
  to: toUnit,
});
