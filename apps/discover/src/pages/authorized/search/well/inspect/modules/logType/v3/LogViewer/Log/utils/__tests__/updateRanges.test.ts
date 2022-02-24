import { getMockLogData } from '__test-utils/fixtures/wellLogs';

import { getMDScaleTrack } from '../../Tracks/ScaleTracks';
import { updateRanges } from '../updateRanges';

describe('LogViewer -> updateRanges', () => {
  it('should update Ranges', () => {
    const logData = getMockLogData();
    const mdTrack: any = getMDScaleTrack('ft');

    mdTrack.plots = [{ id: 'MD', options: { domain: [123123] } }];
    mdTrack.setPlotOption = jest.fn();
    mdTrack.legendUpdate = jest.fn();

    updateRanges(logData, [mdTrack]);

    expect(mdTrack.setPlotOption).toBeCalledTimes(1);
    expect(mdTrack.legendUpdate).toBeCalledTimes(1);
  });
});
