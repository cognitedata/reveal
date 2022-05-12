import {
  ColumnLogData,
  LogData,
} from 'pages/authorized/search/well/inspect/modules/wellLogs/LogViewer/Log/interfaces';

export const commonColumnLogDataMock: ColumnLogData = {
  measurementType: 'measurementType',
  values: [0, 20, 40, 60, 80, 100],
  domain: [0, 100],
  unit: 'unit',
};

export const commonLogDataMock: LogData = {
  COMMON_COLUMN_EXTERNAL_ID: commonColumnLogDataMock,
};

/**
 * The default return values are based on depth measurement data returned by `getMockDepthMeasurementData`
 */

export const getMockLogDataForMDColumn = (
  extras?: Partial<ColumnLogData>
): LogData => ({
  MD: {
    measurementType: 'measured depth',
    values: [
      [29.52756, 29.52756],
      [62.33596, 62.33596],
      [95.14436, 95.14436],
      [127.95276, 104.98688],
    ],
    unit: 'ft',
    domain: [29, 105],
    ...extras,
  },
});

export const getMockLogDataForTVDColumn = (
  extras?: Partial<ColumnLogData>
): LogData => ({
  TVD: {
    measurementType: 'true vertical depth',
    values: [29.52756, 62.33596, 95.14436, 127.95276],
    unit: 'ft',
    domain: [29, 128],
    ...extras,
  },
});

export const getMockLogData = (extras?: LogData): LogData => ({
  ...getMockLogDataForMDColumn(),
  ...getMockLogDataForTVDColumn(),
  TVDSS: {
    measurementType: 'subsea vertical depth',
    values: [
      [29.52756, -193.56956],
      [62.33596, -160.76116],
      [95.14436, -127.95276],
      [127.95276, -95.14436],
    ],
    unit: 'ft',
    domain: [-194, -95],
  },
  FP_CARBONATE_ML: {
    measurementType: 'fracture pressure pre drill mean',
    values: [
      [29.52756, 0],
      [62.33596, 21.25499582],
      [95.14436, 42.52510674],
      [127.95276, 58.52510674],
    ],
    unit: 'psi',
    domain: [21, 59],
  },
  ...extras,
});

export const getLogDataWithMeasurementType = (
  measurementType: string
): LogData => {
  return {
    [measurementType]: {
      ...commonColumnLogDataMock,
      measurementType,
    },
  };
};

export const mdBasedLogData: LogData = {
  ...getLogDataWithMeasurementType('gamma ray'),
  ...getLogDataWithMeasurementType('caliper'),
};

export const tvdBasedLogData: LogData = {
  ...getLogDataWithMeasurementType('deep resistivity'),
  ...getLogDataWithMeasurementType('medium resistivity'),
  ...getLogDataWithMeasurementType('micro resistivity'),
  ...getLogDataWithMeasurementType('shallow resistivity'),
  ...getLogDataWithMeasurementType('density'),
  ...getLogDataWithMeasurementType('neutron porosity'),
  ...getLogDataWithMeasurementType('pore pressure'),
  ...getLogDataWithMeasurementType('fracture pressure'),
  ...getLogDataWithMeasurementType('geomechanics'),
};
