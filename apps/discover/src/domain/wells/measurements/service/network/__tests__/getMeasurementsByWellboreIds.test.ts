import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockDepthMeasurementDataRejectAll } from 'domain/wells/measurements/service/__mocks/getMockDepthMeasurementDataRejectAll';

import flatten from 'lodash/flatten';
import { setupServer } from 'msw/node';

import { getMockDepthMeasurementData } from '../../__mocks/getMockDepthMeasurementData';
import { getMockDepthMeasurements } from '../../__mocks/getMockDepthMeasurements';
import { getMeasurementsByWellboreIds } from '../getMeasurementsByWellboreIds';

const mockServer = setupServer(
  getMockDepthMeasurements(),
  getMockDepthMeasurementData()
);

const mockServerWithErrorApiCalls = setupServer(
  getMockDepthMeasurements(),
  getMockDepthMeasurementDataRejectAll()
);

describe('Measurement service', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('fetch measurments', async () => {
    const matchingIds = ['pequin-wellbore-OMN2000002000'];
    const result = await getMeasurementsByWellboreIds(matchingIds, {
      measurements: { enabled: true },
    });
    expect(result).not.toBeUndefined();
    const wellMeasurements = result[matchingIds[0]];
    expect(wellMeasurements.length).toBe(1);
    expect(wellMeasurements[0].data?.rows).not.toBe([]);
  });
});

describe('Measurement service with error codes', () => {
  beforeAll(() => mockServerWithErrorApiCalls.listen());
  afterAll(() => mockServerWithErrorApiCalls.close());

  test('fetch measurments while 50% of row data calls failing', async () => {
    const matchingIds = ['pequin-wellbore-OMN2000002000'];
    const result = await getMeasurementsByWellboreIds(matchingIds, {
      measurements: { enabled: true },
    });
    expect(result).not.toBeUndefined();
    const wellMeasurements = result[matchingIds[0]];
    expect(wellMeasurements.length).toBe(1);

    const errors = flatten(Object.values(result))
      .filter((measurement) => measurement.errors)
      .map((result) => result.errors);
    expect(errors).not.toEqual([]);
  });
});
