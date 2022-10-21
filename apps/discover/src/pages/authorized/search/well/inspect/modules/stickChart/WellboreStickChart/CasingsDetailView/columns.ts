import { CASING_ASSEMBLY_DIAMETER_UNIT } from 'domain/wells/casings/internal/constants';

import { ColumnType } from 'components/Tablev3';
import { UserPreferredUnit } from 'constants/units';

import { CasingAssemblyView } from '../../types';

export const getCasingsDetailViewColumns = (
  unit: UserPreferredUnit
): ColumnType<CasingAssemblyView>[] => {
  return [
    {
      Header: 'Casing Type',
      accessor: 'type',
      width: 'auto',
      maxWidth: '300px',
    },
    {
      Header: `Top MD (${unit})`,
      accessor: 'measuredDepthTop.value',
      width: 'auto',
    },
    {
      Header: `Bottom MD (${unit})`,
      accessor: 'measuredDepthBase.value',
      width: 'auto',
    },
    {
      Header: `Top TVD (${unit})`,
      accessor: 'trueVerticalDepthTop.value',
      width: 'auto',
    },
    {
      Header: `Bottom TVD (${unit})`,
      accessor: 'trueVerticalDepthBase.value',
      width: 'auto',
    },
    {
      Header: `OD (${CASING_ASSEMBLY_DIAMETER_UNIT})`,
      accessor: 'outsideDiameterFormatted',
      width: 'auto',
    },
    {
      Header: `ID (${CASING_ASSEMBLY_DIAMETER_UNIT})`,
      accessor: 'insideDiameterFormatted',
      width: 'auto',
    },
  ];
};
