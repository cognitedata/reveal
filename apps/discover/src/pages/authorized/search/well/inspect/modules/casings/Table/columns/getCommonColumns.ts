import { CASING_ASSEMBLY_DIAMETER_UNIT } from 'domain/wells/casings/internal/constants';

import { ColumnType } from 'components/Tablev3';
import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicView } from '../../types';

export const getCommonColumns = (
  unit: UserPreferredUnit
): ColumnType<CasingSchematicView>[] => {
  return [
    {
      Header: 'Casing Type',
      accessor: 'type',
      width: '180px',
      maxWidth: '300px',
    },
    {
      Header: `Top MD (${unit})`,
      accessor: 'measuredDepthTop.value',
      width: '140px',
    },
    {
      Header: `Bottom MD (${unit})`,
      accessor: 'measuredDepthBase.value',
      width: '165px',
    },
    {
      Header: `OD Min (${CASING_ASSEMBLY_DIAMETER_UNIT})`,
      accessor: 'minOutsideDiameter.value',
      width: '140px',
    },
    {
      Header: `ID Min (${CASING_ASSEMBLY_DIAMETER_UNIT})`,
      accessor: 'minInsideDiameter.value',
      width: '140px',
    },
  ];
};
