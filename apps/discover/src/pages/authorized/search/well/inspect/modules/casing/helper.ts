import isEmpty from 'lodash/isEmpty';
import { UnitConverterItem } from 'utils/units';

import { Sequence } from '@cognite/sdk';

import { FEET } from 'constants/units';
import { convertObject } from 'modules/wellSearch/utils';

import { COMMON_COLUMN_WIDTHS } from '../../constants';

import { CasingData, FormattedCasings } from './interfaces';

const SCALE_BLOCK_HEIGHT = 40;
const SCALE_PADDING = 16;
const SCALE_BOTTOM_PADDING = 24;

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
      wellName: row.wellName,
      wellboreName: row.wellboreName,
      casings: validCasings
        .map((casing: Sequence) => {
          return {
            id: casing.id,
            name: casing.metadata ? casing.metadata.assy_name : '',
            outerDiameter: casing.metadata
              ? Number(casing.metadata.assy_size).toFixed(2)
              : '',
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
      Header: 'Well / Wellbore',
      accessor: 'wellName',
      width: COMMON_COLUMN_WIDTHS.WELL_NAME,
      maxWidth: '0.6fr',
    },
    {
      Header: 'Wellbore',
      accessor: 'wellboreName',
      width: COMMON_COLUMN_WIDTHS.WELLBORE_NAME,
      maxWidth: '0.4fr',
    },
    {
      Header: 'Casing Type',
      accessor: 'casingNames',
      width: '140px',
    },
    {
      Header: `Top MD (${unit})`,
      accessor: 'topMD',
      width: '150px',
    },
    {
      Header: `Bottom MD (${unit})`,
      accessor: 'bottomMD',
      width: '150px',
    },
    {
      Header: 'OD Min',
      accessor: 'odMin',
      width: '150px',
    },
    {
      Header: 'OD Max',
      accessor: 'odMax',
      width: '150px',
    },
    {
      Header: 'ID Min',
      accessor: 'idMin',
      width: '150px',
    },
  ];
};

export const getScaleBlocks = (
  height: number,
  minDepth: number,
  maxDepth: number
) => {
  const count = Math.floor((height - SCALE_PADDING) / SCALE_BLOCK_HEIGHT);
  const distance = maxDepth - minDepth;
  const pixelDepth = distance / (height - SCALE_PADDING - SCALE_BOTTOM_PADDING);
  return [...Array(count).keys()]
    .map((row) =>
      Number(
        (
          minDepth +
          ((row + 1) * SCALE_BLOCK_HEIGHT - SCALE_PADDING) * pixelDepth
        ).toFixed(2)
      )
    )
    .filter((row) => !Number.isNaN(row));
};
