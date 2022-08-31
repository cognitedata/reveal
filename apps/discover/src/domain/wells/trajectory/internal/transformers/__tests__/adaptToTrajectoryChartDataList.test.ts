import { getMockTrajectoryChartConfig } from 'domain/wells/trajectory/service/__mocks/getMockTrajectoryChartConfig';

import { getMockTrajectoryWithData } from '../../__mocks/getMockTrajectoryWithData';
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
