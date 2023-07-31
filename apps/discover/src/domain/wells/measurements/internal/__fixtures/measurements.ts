import {
  DepthMeasurementDataColumnInternal,
  DepthMeasurementDataInternal,
  DepthMeasurementWithData,
} from 'domain/wells/measurements/internal/types';

import { v4 as uuid } from 'uuid';

import {
  DepthMeasurementData,
  DepthMeasurementRow,
  DepthMeasurementItems,
  DepthMeasurement,
  DepthIndexColumn,
  DepthIndexTypeEnum,
  DistanceUnitEnum,
} from '@cognite/sdk-wells';

import {
  MeasurementChartData,
  MeasurementType,
} from 'modules/wellSearch/types';

export const getMockMeasurement = (
  extra?: Partial<DepthMeasurementWithData>
): DepthMeasurementWithData => {
  return {
    wellboreAssetExternalId: 'pequin-wellbore-OMN2000002000',
    wellboreMatchingId: 'pequin-wellbore-OMN2000002000',
    datum: {
      value: 67.74,
      unit: 'm',
      reference: 'DF',
    },
    ...getMockDepthMeasurementData(),
    ...extra,
  };
};

export const getMockDepthMeasurementItems = (
  extras?: Partial<DepthMeasurementItems>
): DepthMeasurementItems => ({
  items: [
    getMockDepthMeasurementWellboreOne(),
    getMockDepthMeasurementWellboreTwo(),
  ],
  ...extras,
});

export const getMockDepthMeasurementItem = (
  matchingId: string
): DepthMeasurement => {
  const sequenceExternalId = uuid();
  return {
    ...getMockDepthMeasurementWellboreOne(),
    wellboreMatchingId: matchingId,
    source: {
      sequenceExternalId,
      sourceName: 'BP-Pequin',
    },
  };
};

export const getMockDepthMeasurementWellboreOne = (
  extras?: Partial<DepthMeasurement>
): DepthMeasurement => ({
  wellboreAssetExternalId: 'pequin-wellbore-OMN2000002000',
  wellboreMatchingId: 'pequin-wellbore-OMN2000002000',
  source: {
    sequenceExternalId:
      'PPFG-OMN2000002000-PREDRILL-051a4cd7-3b14-4c02-af38-48ff4a17e401',
    sourceName: 'BP-Pequin',
  },
  depthColumn: getMockDepthColumn({
    columnExternalId: 'TVD',
  }),
  columns: [
    {
      measurementType: 'fracture pressure pre drill mean',
      columnExternalId: 'FP_CARBONATE_ML',
      unit: 'psi',
    },
  ],
  datum: {
    value: 67.74,
    unit: 'meter',
    reference: 'DF',
  },
  ...extras,
});

export const getMockDepthMeasurementWellboreTwo = (
  extras?: Partial<DepthMeasurement>
): DepthMeasurement => ({
  wellboreAssetExternalId: 'pequin-wellbore-OMN2000002000',
  wellboreMatchingId: 'pequin-wellbore-OMN2000002000',
  source: {
    sequenceExternalId: 'edm-fitlot-0ntyWTj6fC-AsGtNoF0cP-hJt5E-IaWE0',
    sourceName: 'BP-Pequin',
  },
  depthColumn: getMockDepthColumn({
    columnExternalId: 'lot_md',
  }),
  columns: [
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'sequence_no',
      unit: '',
    },
    {
      measurementType: 'fit equivalent mud weight',
      columnExternalId: 'weight_lot_emw',
      unit: 'ppg',
    },
  ],
  datum: {
    value: 67.74,
    unit: 'meter',
    reference: 'DF',
  },
  ...extras,
});

export const getMockDepthColumn = (
  extras?: Partial<DepthIndexColumn>
): DepthIndexColumn => ({
  columnExternalId: 'mock_external_id',
  unit: {
    unit: DistanceUnitEnum.Foot,
    factor: 1,
  },
  type: DepthIndexTypeEnum.TrueVerticalDepth,
  ...extras,
});

export const getMockDepthMeasurementDataWellboreOne = (
  extras?: Partial<DepthMeasurementData>
): DepthMeasurementData => ({
  id: 3041381716600692,
  source: {
    sequenceExternalId:
      'PPFG-OMN2000002000-PREDRILL-051a4cd7-3b14-4c02-af38-48ff4a17e401',
    sourceName: 'BP-Pequin',
  },
  depthColumn: {
    columnExternalId: 'TVD',
    unit: {
      unit: 'meter',
      factor: 1,
    },
    type: 'true vertical depth',
  },
  depthUnit: {
    unit: 'meter',
    factor: 1,
  },
  columns: [
    {
      externalId: 'TVDSS',
      measurementType: 'subsea vertical depth',
      unit: 'm',
      valueType: 'double',
      name: 'TVDSS',
    },
    {
      externalId: 'MD',
      measurementType: 'measured depth',
      unit: 'm',
      valueType: 'double',
      name: 'MD',
    },
    {
      externalId: 'FP_CARBONATE_ML',
      measurementType: 'fracture pressure pre drill mean',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_CARBONATE_ML',
    },
  ],
  rows: [
    {
      rowNumber: 1,
      depth: 9,
      values: [-59, 9, 0],
    },
    {
      rowNumber: 2,
      depth: 19,
      values: [-49, 19, 24.13549403],
    },
    {
      rowNumber: 3,
      depth: 29,
      values: [-39, 29, 48.28684265],
    },
    {
      rowNumber: 4,
      depth: 39,
      values: [-29, 39, 72.45358239],
    },
    {
      rowNumber: 5,
      depth: 49,
      values: [-19, 49, 96.63526388],
    },
    {
      rowNumber: 6,
      depth: 59,
      values: [-9, 59, 120.8314452],
    },
    {
      rowNumber: 7,
      depth: 60.57641009,
      values: [-7.423589908, 60.57641009],
    },
    {
      rowNumber: 8,
      depth: 69,
      values: [1, 69, 145.0250784],
    },
  ],
  ...extras,
});

export const getMockDepthMeasurementDataWellboreTwo = (
  extras?: Partial<DepthMeasurementData>
): DepthMeasurementData => ({
  id: 8861661864542925,
  source: {
    sequenceExternalId: 'edm-fitlot-0ntyWTj6fC-AsGtNoF0cP-hJt5E-IaWE0',
    sourceName: 'BP-Pequin',
  },
  depthColumn: {
    columnExternalId: 'lot_md',
    unit: {
      unit: 'foot',
      factor: 1,
    },
    type: 'true vertical depth',
  },
  depthUnit: {
    unit: 'foot',
    factor: 1,
  },
  columns: [
    {
      externalId: 'sequence_no',
      measurementType: 'lot equivalent mud weight',
      unit: '',
      valueType: 'long',
      name: 'Sequence no.',
    },
    {
      externalId: 'weight_lot_emw',
      measurementType: 'fit equivalent mud weight',
      unit: 'ppg',
      valueType: 'double',
      name: 'weight_lot_emw',
    },
  ],
  rows: [],
  ...extras,
});

export const getMockDepthMeasurementData = (
  extras?: Partial<DepthMeasurementDataInternal>
): DepthMeasurementDataInternal => ({
  id: 5563689566986006,
  source: {
    sequenceExternalId:
      'GEO-OMN2000002000-PREDRILL-051a4cd7-3b14-4c02-af38-48ff4a17e401',
    sourceName: 'BP-Pequin',
  },
  depthColumn: {
    externalId: 'TVD',
    unit: 'm',
    type: 'true vertical depth',
  },
  depthUnit: 'm',
  columns: getMockDepthMeasurementDataColumns(),
  rows: getDepthMeasurementRows(),
  ...extras,
});

export const getMockDepthMeasurementDataColumns =
  (): DepthMeasurementDataColumnInternal[] => {
    return [
      {
        externalId: 'TVDSS',
        measurementType: 'subsea vertical depth',
        unit: 'm',
        valueType: 'double',
        name: 'TVDSS',
      },
      {
        externalId: 'MD',
        measurementType: 'measured depth',
        unit: 'm',
        valueType: 'double',
        name: 'MD',
      },
      {
        externalId: 'FP_CARBONATE_ML',
        measurementType: 'fracture pressure pre drill mean',
        unit: 'psi',
        valueType: 'double',
        name: 'FP_CARBONATE_ML_MEAN',
      },
      {
        externalId: 'SVERTICAL_PRE',
        measurementType: 'geomechanics pre drill',
        unit: 'psi',
        valueType: 'double',
        name: 'SVERTICAL_PRE',
      },
    ];
  };

export const getMockDepthMeasurementDataColumnsCurves =
  (): DepthMeasurementDataColumnInternal[] => {
    return [
      ...getMockGeomechanicsColumns(),
      ...getMockPpfgsColumns(),
      ...getMockLotColumns(),
      ...getMockFitColumns(),
    ];
  };

export const getMockGeomechanicsColumns =
  (): DepthMeasurementDataColumnInternal[] => {
    return [
      {
        measurementType: 'geomechanics pre drill',
        externalId: 'SVERTICAL_PRE',
        unit: 'psi',
        valueType: 'double',
      },
      {
        measurementType: 'geomechanics pre drill',
        externalId: 'SHMIN_SAND_ML_PRE',
        unit: 'psi',
        valueType: 'double',
      },
    ];
  };

export const getMockPpfgsColumns = (): DepthMeasurementDataColumnInternal[] => {
  return [
    {
      measurementType: 'fracture pressure pre drill mean',
      externalId: 'FP_CARBONATE_ML',
      unit: 'psi',
      valueType: 'double',
    },
    {
      measurementType: 'fracture pressure pre drill high',
      externalId: 'FP_SHALE_HIGH',
      unit: 'psi',
      valueType: 'double',
    },
    {
      measurementType: 'pore pressure pre drill mean',
      externalId: 'PP_COMPOSITE_ML',
      unit: 'psi',
      valueType: 'double',
    },
  ];
};

export const getMockLotColumns = (): DepthMeasurementDataColumnInternal[] => {
  return [
    {
      measurementType: 'lot equivalent mud weight',
      externalId: 'LOT_1',
      unit: 'ft',
      valueType: 'double',
    },
  ];
};

export const getMockFitColumns = (): DepthMeasurementDataColumnInternal[] => {
  return [
    {
      measurementType: 'fit equivalent mud weight',
      externalId: 'FIT_1',
      unit: 'psi',
      valueType: 'double',
    },
  ];
};

export const getMockDepthMeasurementColumn = (
  extras?: Partial<DepthMeasurementDataColumnInternal>
): DepthMeasurementDataColumnInternal => ({
  measurementType: 'fracture pressure pre drill mean',
  externalId: 'FP_CARBONATE_ML',
  unit: 'psi',
  valueType: 'double',
  ...extras,
});

export const getMockMeasurementChartData = (
  extras?: Partial<MeasurementChartData>
): MeasurementChartData => ({
  marker: {
    color: '#595959',
    size: 2,
    symbol: 'triangle-up',
    line: {
      width: 2,
    },
  },
  x: [0, 10],
  y: [9000, 8000],
  type: 'scatter',
  mode: 'lines',
  name: 'LOT',
  customdata: ['TEST Curve', 'Test wellbore 1'],
  measurementType: MeasurementType.GEOMECHANNICS,
  ...extras,
});

export const getDepthMeasurementRows = (): DepthMeasurementRow[] => {
  return [
    {
      rowNumber: 1,
      depth: 9,
      values: [-59, 9, 0, 0],
    },
    {
      rowNumber: 2,
      depth: 19,
      values: [-49, 19, 21.25499582, 29.4566444],
    },
    {
      rowNumber: 3,
      depth: 29,
      values: [-39, 29, 42.52510674, 50.5657666],
    },
    {
      rowNumber: 4,
      depth: 39,
      values: [-29, 32, 58.52510674, 75.6532006],
    },
  ];
};

export const getDepthMeasurementRowsWithBreakingValues =
  (): DepthMeasurementRow[] => {
    return [
      {
        rowNumber: 1,
        depth: 9,
        values: [-59, 9, 0, 0],
      },
      {
        rowNumber: 2,
        depth: 19,
        values: [-49, 19, 21.25499582, 25],
      },
      {
        rowNumber: 3,
        depth: 29,
        values: [-39, 29, 42.52510674, 44],
      },
      {
        rowNumber: 4,
        depth: 39,
        values: [-29, 32, 58.52510674, 51],
      },
      {
        rowNumber: 5,
        depth: 49,
        values: [-59, 9, -9999, null],
      },
      {
        rowNumber: 6,
        depth: 59,
        values: [-49, 42, 85.65425854, 80],
      },
      {
        rowNumber: 7,
        depth: 69,
        values: [-39, 58, 98.48645365, 96],
      },
      {
        rowNumber: 8,
        depth: 79,
        values: [-29, 69, 123.9842565, 130],
      },
      {
        rowNumber: 9,
        depth: 89,
        values: [-29, 75, null, -9999],
      },
      {
        rowNumber: 10,
        depth: 100,
        values: [-29, 82, 150.9842565, 154],
      },
      {
        rowNumber: 11,
        depth: 110,
        values: [-29, 82, 160.9842565, 168],
      },
      {
        rowNumber: 12,
        depth: 120,
        values: [-29, 82, 170.9842565, 178],
      },
    ];
  };

export const getDepthMeasurementRow = (): DepthMeasurementRow => {
  return {
    rowNumber: 2,
    depth: 19,
    values: [-49, 19, 21.25499582],
  };
};

export const constGetMockLineConfig = () => ({
  marker: {
    color: '#595959',
    size: 2,
    symbol: 'triangle-up-open',
    line: {
      width: 2,
    },
  },
});

export const getMockCurveOptions = () => [
  {
    value: {
      measurementType: 'geomechanics',
      externalId: 'GEO',
      unit: 'psi',
      description: 'geomechanics',
    },
    label: 'GEO',
  },
  {
    value: {
      measurementType: 'geomechanics pre drill',
      externalId: 'GEO_PRE_DRILL',
      unit: 'psi',
      description: 'geomechanics pre drill',
    },
    label: 'GEO_PRE_DRILL',
  },
  {
    value: {
      measurementType: 'geomechanics post drill',
      externalId: 'GEO_POST_DRILL',
      unit: 'psi',
      description: 'geomechanics post drill',
    },
    label: 'GEO_POST_DRILL',
  },
];
