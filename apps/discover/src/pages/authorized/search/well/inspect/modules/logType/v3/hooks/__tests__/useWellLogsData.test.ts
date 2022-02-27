import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { getMockDepthMeasurementData } from '__test-utils/fixtures/measurements';
import { getMockLogData } from '__test-utils/fixtures/wellLogs';
import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import { EMPTY_OBJECT } from 'constants/empty';

import { useWellLogsData } from '../useWellLogsData';

const mockServer = setupServer(getMockUserMe());

/**
 * Skipping temporary until Ravinda's PR gets merged.
 */
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('useWellLogsData', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const getHookResult = (wellLogRowData: DepthMeasurementData) => {
    const { result, waitForNextUpdate } = renderHook(
      () => useWellLogsData(wellLogRowData),
      {
        wrapper: QueryClientWrapper,
      }
    );
    waitForNextUpdate();
    return result.current;
  };

  it(`should return empty object if rows data is empty`, () => {
    const wellLogRowData = getMockDepthMeasurementData({ rows: [] });
    const wellLogsData = getHookResult(wellLogRowData);

    expect(wellLogsData).toEqual(EMPTY_OBJECT);
  });

  it(`should return log data correctly`, () => {
    const wellLogRowData = getMockDepthMeasurementData({
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
          name: 'FP_CARBONATE_ML_MEAN',
        },
      ],
    });
    const wellLogsData = getHookResult(wellLogRowData);
    const expectedWellLogsData = getMockLogData();

    expect(wellLogsData).toEqual(expectedWellLogsData);
  });

  it(`should break the curve for invalid values`, () => {
    const wellLogRowData = getMockDepthMeasurementData({
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
          name: 'FP_CARBONATE_ML_MEAN',
        },
      ],
      rows: [
        {
          rowNumber: 1,
          depth: 9,
          values: [-59, 9, -9999],
        },
        {
          rowNumber: 2,
          depth: 19,
          values: [-49, 19, 0],
        },
        {
          rowNumber: 3,
          depth: 29,
          values: [-39, 29, -9999],
        },
        {
          rowNumber: 4,
          depth: 39,
          values: [-29, 32, 58.52510674],
        },
      ],
    });
    const wellLogsData = getHookResult(wellLogRowData);
    const defaultData = getMockLogData();

    expect(wellLogsData).toEqual({
      ...defaultData,
      FP_CARBONATE_ML: {
        ...defaultData.FP_CARBONATE_ML,
        values: [
          [0, null],
          [0, null],
          [0, null],
          [127.95276, 58.52510674],
        ],
        domain: [58, 59],
      },
    });
  });
});
