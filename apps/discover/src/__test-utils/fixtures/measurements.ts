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
    {
      measurementType: 'geomechanics pre drill',
      columnExternalId: 'SVERTICAL_PRE',
      unit: 'psi',
    },
    {
      measurementType: 'pore pressure pre drill low',
      columnExternalId: 'PP_COMPOSITE_LOW',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill low',
      columnExternalId: 'FP_SHALE_LOW',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill mean',
      columnExternalId: 'FP_SHALE_ML',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill high',
      columnExternalId: 'FP_CARBONATE_HIGH',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill mean',
      columnExternalId: 'FP_SAND_ML',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill low',
      columnExternalId: 'FP_SAND_LOW',
      unit: 'psi',
    },
    {
      measurementType: 'pore pressure pre drill high',
      columnExternalId: 'PP_COMPOSITE_HIGH',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill low',
      columnExternalId: 'FP_CARBONATE_LOW',
      unit: 'psi',
    },
    {
      measurementType: 'fracture pressure pre drill high',
      columnExternalId: 'FP_SAND_HIGH',
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
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'pressure',
      unit: 'psi',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'hole_sect_group_id',
      unit: '',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'hole_sect_group_id',
      unit: '',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'hole_sect_group_id',
      unit: '',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'hole_sect_group_id',
      unit: '',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'lot_tvd',
      unit: 'ft',
    },
    {
      measurementType: 'lot equivalent mud weight',
      columnExternalId: 'lot_tvd',
      unit: 'ft',
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
    {
      externalId: 'FP_SHALE_HIGH',
      measurementType: 'fracture pressure pre drill high',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SHALE_HIGH',
    },
    {
      externalId: 'PP_COMPOSITE_ML',
      measurementType: 'pore pressure pre drill mean',
      unit: 'psi',
      valueType: 'double',
      name: 'PP_COMPOSITE_ML',
    },
    {
      externalId: 'SVERTICAL_PRE',
      measurementType: 'geomechanics pre drill',
      unit: 'psi',
      valueType: 'double',
      name: 'SVERTICAL_PRE',
    },
    {
      externalId: 'PP_COMPOSITE_LOW',
      measurementType: 'pore pressure pre drill low',
      unit: 'psi',
      valueType: 'double',
      name: 'PP_COMPOSITE_LOW',
    },
    {
      externalId: 'FP_SHALE_LOW',
      measurementType: 'fracture pressure pre drill low',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SHALE_LOW',
    },
    {
      externalId: 'FP_SHALE_ML',
      measurementType: 'fracture pressure pre drill mean',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SHALE_ML',
    },
    {
      externalId: 'FP_CARBONATE_HIGH',
      measurementType: 'fracture pressure pre drill high',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_CARBONATE_HIGH',
    },
    {
      externalId: 'FP_SAND_ML',
      measurementType: 'fracture pressure pre drill mean',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SAND_ML',
    },
    {
      externalId: 'PP_VIRGIN_SAND_PRE',
      measurementType: 'property',
      unit: 'psi',
      valueType: 'double',
      name: 'PP_VIRGIN_SAND_PRE',
    },
    {
      externalId: 'FP_SAND_LOW',
      measurementType: 'fracture pressure pre drill low',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SAND_LOW',
    },
    {
      externalId: 'PP_COMPOSITE_HIGH',
      measurementType: 'pore pressure pre drill high',
      unit: 'psi',
      valueType: 'double',
      name: 'PP_COMPOSITE_HIGH',
    },
    {
      externalId: 'FP_CARBONATE_LOW',
      measurementType: 'fracture pressure pre drill low',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_CARBONATE_LOW',
    },
    {
      externalId: 'FP_SAND_HIGH',
      measurementType: 'fracture pressure pre drill high',
      unit: 'psi',
      valueType: 'double',
      name: 'FP_SAND_HIGH',
    },
  ],
  rows: [
    {
      rowNumber: 1,
      depth: 9,
      values: [-59, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      rowNumber: 2,
      depth: 19,
      values: [
        -49, 19, 24.13549403, 25.43051759, 16.17294672, 29.90821457, 0,
        20.15813736, 25.43051759, 28.53468778, 22.76587529, 16.17294672,
        14.35594299, 16.17294672, 15.55227158, 22.76587529,
      ],
    },
    {
      rowNumber: 3,
      depth: 29,
      values: [
        -39, 29, 48.28684265, 50.88856916, 32.34589344, 59.85728073, 0,
        40.3438087, 50.88856916, 57.106142, 45.55135934, 32.34589344,
        28.73149475, 32.34589345, 31.12578598, 45.55135934,
      ],
    },
    {
      rowNumber: 4,
      depth: 39,
      values: [
        -29, 39, 72.45358239, 76.3736559, 48.51884016, 89.84645844, 15.35999983,
        65.56387478, 76.3736559, 85.71369661, 68.35609693, 48.51884016,
        51.11349996, 48.51884017, 54.0929583, 68.35609694,
      ],
    },
    {
      rowNumber: 5,
      depth: 49,
      values: [
        -19, 49, 96.63526388, 101.8852945, 64.69178687, 119.8750305,
        30.71999966, 90.81049267, 101.8852945, 114.3567062, 91.17974382,
        64.69178687, 73.51441447, 64.69178689, 77.0806157, 91.17974383,
      ],
    },
    {
      rowNumber: 6,
      depth: 59,
      values: [
        -9, 59, 120.8314452, 127.4230092, 80.86473359, 149.9422913, 46.07999948,
        116.0831867, 127.4230092, 143.0345355, 114.0219613, 80.86473359,
        95.93389954, 80.86473361, 100.0883912, 114.0219613,
      ],
    },
    {
      rowNumber: 7,
      depth: 60.57641009,
      values: [
        -7.423589908, 60.57641009, 124.6470584, 131.4511585, 83.41425356,
        154.6856232, 48.50136536, 120.0710363, 131.4511584, 147.5584862,
        117.624511, 83.41425356, 99.47086208, 83.41425361, 103.7183201,
        117.624511,
      ],
    },
    {
      rowNumber: 8,
      depth: 69,
      values: [
        1, 69, 145.0250784, 152.9734926, 96.9982639, 180.0475616, 61.43999928,
        141.381489, 152.9734926, 171.7426319, 136.8619268, 96.9982639,
        118.3716219, 96.9982639, 123.1159238, 136.8619268,
      ],
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
      externalId: 'pressure',
      measurementType: 'lot equivalent mud weight',
      unit: 'psi',
      valueType: 'double',
      name: 'pressure',
    },
    {
      externalId: 'hole_sect_group_id',
      measurementType: 'lot equivalent mud weight',
      unit: '',
      valueType: 'string',
      name: 'hole_sect_group_id',
    },
    {
      externalId: 'hole_sect_group_id',
      measurementType: 'lot equivalent mud weight',
      unit: '',
      valueType: 'string',
      name: 'hole_sect_group_id',
    },
    {
      externalId: 'hole_sect_group_id',
      measurementType: 'lot equivalent mud weight',
      unit: '',
      valueType: 'string',
      name: 'hole_sect_group_id',
    },
    {
      externalId: 'hole_sect_group_id',
      measurementType: 'lot equivalent mud weight',
      unit: '',
      valueType: 'string',
      name: 'hole_sect_group_id',
    },
    {
      externalId: 'lot_tvd',
      measurementType: 'lot equivalent mud weight',
      unit: 'ft',
      valueType: 'double',
      name: 'lot_tvd',
    },
    {
      externalId: 'lot_tvd',
      measurementType: 'lot equivalent mud weight',
      unit: 'ft',
      valueType: 'double',
      name: 'lot_tvd',
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

export const getMockMeasurementChartData = (): MeasurementChartData => {
  return {
    measurementType: MeasurementTypeV3.GEOMECHANNICS,
  };
};

export const getDepthMeasurementRows = (): DepthMeasurementRow[] => {
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
