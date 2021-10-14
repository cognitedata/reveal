import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { Sequence } from '@cognite/sdk';

import { UnitConverterItem } from '_helpers/units/interfaces';
import { FEET } from 'constants/units';
import { convertObject } from 'modules/wellSearch/utils';

import { COMMON_COLUMN_WIDTHS } from '../../constants';

import { CasingData, FormattedCasings } from './interfaces';
/**
 * This returns string depth in proper number format
 */
const getDepth = (depth: string | undefined) =>
  depth && Number(depth) > 0 ? Number(depth) : 0;

/**
 *
 * This returns casing data in a pattern required by CasingView component
 */
export const getFortmattedCasingData = (
  casingData: CasingData[],
  prefferedUnit = FEET
) => {
  const formattedCasings: FormattedCasings[] = [];

  casingData.forEach((row: CasingData) => {
    const validCasings = row.casings;
    if (isEmpty(validCasings)) {
      return;
    }
    formattedCasings.push({
      key: row.id,
      name: get(head(validCasings), 'metadata.wellboreName', row.wellboreName),
      casings: validCasings
        .map((casing: Sequence) => {
          return {
            id: casing.id,
            name: casing.metadata ? casing.metadata.assy_name : '',
            outerDiameter: casing.metadata ? casing.metadata.assy_size : '',
            startDepth: getDepth(
              casing.metadata ? casing.metadata.assy_original_md_top : '0'
            ),
            startDepthUnit: casing.metadata
              ? casing.metadata.assy_original_md_top_unit
              : FEET,
            endDepth: getDepth(
              casing.metadata ? casing.metadata.assy_original_md_base : '0'
            ),
            endDepthUnit: casing.metadata
              ? casing.metadata.assy_original_md_base_unit
              : FEET,
            depthUnit: prefferedUnit,
          };
        })
        .map((casing) =>
          convertObject(casing)
            .changeUnits(getCasingListUnitChangeAccessors(prefferedUnit))
            .toClosestInteger(casingAccessorsToFixedDecimal)
            .get()
        ),
    });
  });
  return formattedCasings;
};

export const casingAccessorsToFixedDecimal = ['startDepth', 'endDepth'];

export const getCasingListUnitChangeAccessors = (
  toUnit: string
): UnitConverterItem[] => [
  {
    id: 'id',
    accessor: 'startDepth',
    fromAccessor: 'startDepthUnit',
    to: toUnit,
  },
  {
    id: 'id',
    accessor: 'endDepth',
    fromAccessor: 'endDepthUnit',
    to: toUnit,
  },
];

export const getCasingColumnsWithPrefferedUnit = (unit: string) => {
  return [
    {
      Header: 'Well',
      accessor: 'wellName',
      width: COMMON_COLUMN_WIDTHS.WELL_NAME,
    },
    {
      Header: 'Wellbore',
      accessor: 'wellboreName',
      width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
    },
    {
      Header: 'Casing Type',
      accessor: 'casingNames',
    },
    {
      Header: `Top MD (${unit})`,
      accessor: 'topMD',
    },
    {
      Header: `Bottom MD (${unit})`,
      accessor: 'bottomMD',
    },
    {
      Header: 'OD Min',
      accessor: 'odMin',
    },
    {
      Header: 'OD Max',
      accessor: 'odMax',
    },
    {
      Header: 'ID Min',
      accessor: 'idMin',
    },
  ];
};
