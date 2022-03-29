import { changeUnits } from 'utils/units';

import { UserPreferredUnit } from 'constants/units';
import { Wellbore } from 'modules/wellSearch/types';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';

export const getKbElevation = <T extends Wellbore>(
  wellbore: T,
  userPreferredUnit?: string
) => {
  const kbElevationAccessor = 'datum.value';
  const unitChangeAccessors = [
    {
      accessor: kbElevationAccessor,
      fromAccessor: 'datum.unit',
      to: userPreferredUnit || UserPreferredUnit.FEET,
    },
  ];
  const processedWellbore = convertToFixedDecimal(
    changeUnits(wellbore, unitChangeAccessors),
    [kbElevationAccessor]
  );
  return String(processedWellbore.datum?.value);
};
