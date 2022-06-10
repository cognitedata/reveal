import { Well } from 'domain/wells/well/internal/types';

import { changeUnits } from 'utils/units';

import { UserPreferredUnit } from 'constants/units';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';

export const waterDepthAdapter = (well: Well, userPreferredUnit?: string) => {
  const unitChangeAccessors = [
    {
      accessor: 'waterDepth.value',
      fromAccessor: 'waterDepth.unit',
      to: userPreferredUnit || UserPreferredUnit.FEET,
    },
  ];
  return convertToFixedDecimal(changeUnits(well, unitChangeAccessors), [
    'waterDepth.value',
  ]);
};
