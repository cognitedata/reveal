import {
  getMockProjectConfigWellsTrajectoryCharts,
  getMockLineGraphProjectConfigWellsTrajectoryChart,
} from '__test-utils/fixtures/projectConfig';
import {
  getMockedTrajectoryData,
  getMockedTrajectoryDataItem,
  getMockSequence,
  mockedNormalizedColumns,
  mockCoordinates,
} from '__test-utils/fixtures/trajectory';
import { UserPreferredUnit } from 'constants/units';

import { generateChartData, extractNthCoordinates } from '../generateChartData';

describe('generateChartData test', () => {
  test('Should generate maps', () => {
    const chartConfigs = getMockProjectConfigWellsTrajectoryCharts();
    const trajectoryData = [
      getMockedTrajectoryDataItem({
        columns: [
          {
            externalId: 'x_offset',
            valueType: 'DOUBLE',
            name: 'x_offset',
          },
          {
            externalId: 'y_offset',
            valueType: 'DOUBLE',
            name: 'y_offset',
          },
        ],
      }),
    ];
    const result = generateChartData(
      trajectoryData,
      getMockSequence(),
      chartConfigs,
      UserPreferredUnit.FEET,
      mockedNormalizedColumns()
    );
    const chartData = result.data;
    expect(chartData).toBeTruthy();
    expect(result.errors[trajectoryData[0].wellboreId]).toEqual(
      expect.arrayContaining([
        {
          message: 'Error acquiring data for tvd',
        },
      ])
    );
    expect(chartData.length).toBe(chartConfigs.length);
    expect(chartData.length).toEqual(chartConfigs.length);
    const firstChartOfFirstWellbore = chartData[0][0];
    expect(firstChartOfFirstWellbore.x).toStrictEqual([0]);
  });

  test('Should generate errors since wrong field config is passed', () => {
    const chartConfigs = [
      getMockLineGraphProjectConfigWellsTrajectoryChart({
        chartData: {
          x: 'wrong_x',
          y: 'wrong_y',
        },
      }),
    ];
    const result = generateChartData(
      getMockedTrajectoryData(),
      getMockSequence(),
      chartConfigs,
      UserPreferredUnit.FEET,
      mockedNormalizedColumns()
    );
    expect(result.errors).not.toBe([]);
  });
});

describe('extractNthCoordinates test', () => {
  it('Should return x,y coordinates of index 1', () => {
    const coordiantes = mockCoordinates();
    const result = extractNthCoordinates(coordiantes, 1);
    expect(result.data.x).toEqual(expect.arrayContaining([5, 5]));
    expect(result.data.y).toEqual(expect.arrayContaining([10, 15]));
    expect(result.data.z).toEqual(expect.arrayContaining([]));
  });

  it('Should return x,y,z coordinates of index 3', () => {
    const coordiantes = mockCoordinates();
    const result = extractNthCoordinates(coordiantes, 3);
    expect(result.data.x).toEqual(expect.arrayContaining([10, 10]));
    expect(result.data.y).toEqual(expect.arrayContaining([12, 16]));
    expect(result.data.z).toEqual(expect.arrayContaining([5, 7]));
  });

  it('Should return coordinates skipped error tuple and error for index 2', () => {
    const coordiantes = mockCoordinates();
    const result = extractNthCoordinates(coordiantes, 2);
    expect(result.data.x).toEqual(expect.arrayContaining([6]));
    expect(result.data.y).toEqual(expect.arrayContaining([12]));
    expect(result.data.z).toEqual(expect.arrayContaining([5]));
    expect(result.errors).toStrictEqual([{ message: 'Error message' }]);
  });
});
