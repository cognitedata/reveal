import { getMockTrajectoryChartConfig } from 'domain/wells/trajectory/service/__mocks/getMockTrajectoryChartConfig';

import { getMockTrajectoryWithData } from '__test-utils/fixtures/well/trajectory';

import { adaptToTrajectoryChartDataList } from '../adaptToTrajectoryChartDataList';

describe('adaptToTrajectoryChartDataList', () => {
  it('should not throw an error', () => {
    expect(() =>
      adaptToTrajectoryChartDataList(
        [getMockTrajectoryWithData('test-id'), undefined as any],
        getMockTrajectoryChartConfig(),
        () => ({
          name: '',
          line: {
            color: 'curveColor',
          },
        })
      )
    ).not.toThrowError();
  });
});
