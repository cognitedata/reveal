import { UserPreferredUnit } from 'constants/units';

export const getUnitConverterItemForDistance = <T>(
  accessor: keyof T,
  toUnit: UserPreferredUnit
) => ({
  id: accessor,
  accessor: `${String(accessor)}.value`,
  fromAccessor: `${String(accessor)}.unit`,
  to: toUnit,
});
