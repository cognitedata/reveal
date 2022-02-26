import { v4 as uuid } from 'uuid';

import {
  DepthMeasurementColumn,
  DepthMeasurementData,
  DepthMeasurementRow,
  DepthMeasurementItems,
  DepthMeasurement,
  DepthIndexColumn,
  DepthIndexTypeEnum,
  DistanceUnitEnum,
  DepthMeasurementDataColumn,
} from '@cognite/sdk-wells-v3';

import {
  WellboreMeasurementsMapV3 as WellboreMeasurementsMap,
  MeasurementV3 as Measurement,
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3,
} from 'modules/wellSearch/types';

export const getMockMeasurement = (extra?: Measurement): Measurement => {
  return {
    wellboreAssetExternalId: 'pequin-wellbore-OMN2000002000',
    wellboreMatchingId: 'pequin-wellbore-OMN2000002000',
    source: {
      sequenceExternalId:
        'GEO-OMN2000002000-PREDRILL-051a4cd7-3b14-4c02-af38-48ff4a17e401',
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
    columns: getMockDepthMeasurementColumns(),
    datum: {
      value: 67.74,
      unit: 'meter',
      reference: 'DF',
    },
    data: getMockDepthMeasurementData(),
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
  nextCursor: 'AAAAAAAAAGU=',
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
  extras?: Partial<DepthMeasurementData>
): DepthMeasurementData => ({
  id: 5563689566986006,
  source: {
    sequenceExternalId:
      'GEO-OMN2000002000-PREDRILL-051a4cd7-3b14-4c02-af38-48ff4a17e401',
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
  columns: getMockDepthMeasurementDataColumns(),
  rows: getDepthMeasurementRows(),
  nextCursor: 'AAAAAAAAAGU=',
  ...extras,
});

export const getMockDepthMeasurementDataColumns =
  (): DepthMeasurementDataColumn[] => {
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

export const getMockWellboreMeasurementsMap = (
  extras?: Partial<WellboreMeasurementsMap>
): WellboreMeasurementsMap => {
  return {
    'pequin-wellbore-OMN2000002000': [getMockMeasurement()],
    ...extras,
  };
};

export const getMockDepthMeasurementColumns = (): DepthMeasurementColumn[] => {
  return [
    ...getMockGeomechanicsColumns(),
    ...getMockPpfgsColumns(),
    ...getMockLotColumns(),
    ...getMockFitColumns(),
  ];
};

export const getMockGeomechanicsColumns = (): DepthMeasurementColumn[] => {
  return [
    {
      measurementType: 'geomechanics pre drill',
      columnExternalId: 'SVERTICAL_PRE',
      unit: 'psi',
    },
    {
      measurementType: 'geomechanics pre drill',
      columnExternalId: 'SHMIN_SAND_ML_PRE',
      unit: 'psi',
    },
  ];
};

export const getMockPpfgsColumns = (): DepthMeasurementColumn[] => {
  return [
    {
      measurementType: 'fracture pressure pre drill mean',
      columnExternalId: 'FP_CARBONATE_ML',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill high',
      columnExternalId: 'FP_SHALE_HIGH',
      unit: 'psi',
    },
    {
      measurementType: 'pore pressure pre drill mean',
      columnExternalId: 'PP_COMPOSITE_ML',
      unit: 'psi',
    },
  ];
};

export const getMockLotColumns = (): DepthMeasurementColumn[] => {
  return [
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'LOT_1',
      unit: 'ft',
    },
  ];
};

export const getMockFitColumns = (): DepthMeasurementColumn[] => {
  return [
    {
      measurementType: 'fit equivalent mud weight',
      columnExternalId: 'FIT_1',
      unit: 'psi',
    },
  ];
};

export const getMockDepthMeasurementColumn = (
  extras?: Partial<DepthMeasurementColumn>
): DepthMeasurementColumn => ({
  measurementType: 'fracture pressure pre drill mean',
  columnExternalId: 'FP_CARBONATE_ML',
  unit: 'psi',
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
  customdata: ['TEST Curve'],
  measurementType: MeasurementTypeV3.GEOMECHANNICS,
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
        values: [-59, 9, 0],
      },
      {
        rowNumber: 2,
        depth: 19,
        values: [-49, 19, 21.25499582],
      },
      {
        rowNumber: 3,
        depth: 29,
        values: [-39, 29, 42.52510674],
      },
      {
        rowNumber: 4,
        depth: 39,
        values: [-29, 32, 58.52510674],
      },
      {
        rowNumber: 5,
        depth: 49,
        values: [-59, 9, -9999],
      },
      {
        rowNumber: 6,
        depth: 59,
        values: [-49, 19, 85.65425854],
      },
      {
        rowNumber: 7,
        depth: 69,
        values: [-39, 29, 98.48645365],
      },
      {
        rowNumber: 8,
        depth: 79,
        values: [-29, 32, 123.9842565],
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
