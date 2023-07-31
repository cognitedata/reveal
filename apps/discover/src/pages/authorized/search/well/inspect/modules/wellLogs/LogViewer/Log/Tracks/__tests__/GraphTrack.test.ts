import { getMockLogData } from '__test-utils/fixtures/wellLogs';

import { GraphTrackEnum } from '../../../../constants';
import { getGraphTrack } from '../GraphTrack';
import * as utils from '../utils';

describe('GraphTrack', () => {
  const setupElementsAppenderOnTrack = jest.spyOn(
    utils,
    'setupElementsAppenderOnTrack'
  );

  it('should return graph track and not disable when log data is available', () => {
    const logData = getMockLogData();
    const graphTrack = getGraphTrack(
      logData,
      GraphTrackEnum.GAMMA_RAY_AND_CALIPER
    );

    expect(graphTrack).toBeTruthy();
    expect(setupElementsAppenderOnTrack).not.toHaveBeenCalled();
  });

  it('should return disabled graph track when log data is empty', () => {
    const graphTrack = getGraphTrack({}, GraphTrackEnum.GAMMA_RAY_AND_CALIPER);

    expect(graphTrack).toBeTruthy();
    expect(setupElementsAppenderOnTrack).toBeCalledTimes(1);
  });
});
