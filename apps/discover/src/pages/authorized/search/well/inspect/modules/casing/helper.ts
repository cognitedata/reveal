import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { UnitConverterItem } from 'utils/units';

import { Sequence } from '@cognite/sdk';

import { FEET, UserPreferredUnit } from 'constants/units';
import { convertObject } from 'modules/wellSearch/utils';

import { COMMON_COLUMN_WIDTHS } from '../../constants';

import { CasingType } from './CasingView/interfaces';
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
  prefferedUnit: UserPreferredUnit
) => {
  return casingData.reduce((formattedCasings, casingData) => {
    const validCasings = casingData.casings;
    if (isEmpty(validCasings)) {
      return formattedCasings;
    }

    const tvdValuesModifier: Partial<CasingType> = {};
    if (isUndefined(casingData.topTVD)) {
      tvdValuesModifier.startDepthTVD = undefined;
    }
    if (isUndefined(casingData.bottomTVD)) {
      tvdValuesModifier.endDepthTVD = undefined;
    }

    return [
      ...formattedCasings,
      {
        key: casingData.id,
        wellName: casingData.wellName,
        wellboreName: casingData.wellboreName,
        casings: validCasings
          .map((casing: Sequence) =>
            mapSequenceToCasingType(casing, prefferedUnit)
          )
          .map((casing) => ({
            ...convertObject(casing)
              .changeUnits(getCasingListUnitChangeAccessors(prefferedUnit))
              .toClosestInteger(casingAccessorsToFixedDecimal)
              .get(),
            ...tvdValuesModifier,
          })),
      },
    ];
  }, [] as FormattedCasings[]);
};

export const mapSequenceToCasingType = (
  casing: Sequence,
  prefferedUnit: UserPreferredUnit
) => {
  return {
    id: casing.id,
    name: casing.metadata ? casing.metadata.assy_name : '',
    outerDiameter: casing.metadata
      ? Number(casing.metadata.assy_size).toFixed(3)
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
    startDepthTVD: getDepth(
      casing.metadata ? casing.metadata.assy_tvd_top : '0'
    ),
    startDepthTVDUnit: casing.metadata?.assy_tvd_top_unit,
    endDepthTVD: getDepth(
      casing.metadata ? casing.metadata.assy_tvd_base : '0'
    ),
    endDepthTVDUnit: casing.metadata?.assy_tvd_base_unit,
    depthUnit: prefferedUnit,
  };
};

export const casingAccessorsToFixedDecimal = [
  'startDepth',
  'endDepth',
  'startDepthTVD',
  'endDepthTVD',
];

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
  {
    id: 'id',
    accessor: 'startDepthTVD',
    fromAccessor: 'startDepthTVDUnit',
    to: toUnit,
  },
  {
    id: 'id',
    accessor: 'endDepthTVD',
    fromAccessor: 'endDepthTVDUnit',
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
