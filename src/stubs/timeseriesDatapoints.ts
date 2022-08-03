import { DatapointAggregate } from '@cognite/sdk';

const datapointsGenerator = (i: number) => {
  const randomNumber = Math.random() * 100;
  return {
    min: randomNumber,
    max: randomNumber,
    average: randomNumber,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
    count: 1,
  };
};

const mockDatapointGenerator = (numberOfPoints: number) => {
  const datapoints: DatapointAggregate[] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    datapoints.push(datapointsGenerator(i));
  }
  return datapoints;
};

export const datapoints = [
  {
    id: 18846745253145,
    externalId: 'LOR_ARENDAL_WELL_21_Well_WC_RATIO',
    isString: false,
    isStep: true,
    unit: '%',
    datapoints: mockDatapointGenerator(80),
  },
  {
    id: 20453894433139,
    externalId: 'LOR_ARENDAL_WELL_01_Well_H2O_PRODUCTION',
    isString: false,
    isStep: true,
    unit: 'M3',
    datapoints: mockDatapointGenerator(60),
  },
  {
    id: 32612285182013,
    externalId: 'LOR_BERGEN_WELL_03_Well_ASSOC_GAS_PRODUCTION',
    isString: false,
    isStep: true,
    unit: 'NM3',
    datapoints: mockDatapointGenerator(100),
  },
  {
    id: 68660243622344,
    externalId: 'LOR_ARENDAL_WELL_10_Well_PRESSURE_MOTOR_RUN_FLAG',
    isString: false,
    isStep: false,
    datapoints: mockDatapointGenerator(120),
  },
];
