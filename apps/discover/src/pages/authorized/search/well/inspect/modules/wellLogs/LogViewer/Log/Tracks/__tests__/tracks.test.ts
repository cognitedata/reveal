import { GraphTrackEnum } from 'domain/wells/measurements/internal/constants';

import {
  commonLogDataMock,
  getLogDataWithMeasurementType,
  mdBasedLogData,
  tvdBasedLogData,
} from '__test-utils/fixtures/wellLogs';

import { WellLogPreviewData } from '../../types';
import { getLogViewerTracks } from '../tracks';

const MD_SCALE_TRACK = 'MD_SCALE_TRACK';
const TVD_SCALE_TRACK = 'TVD_SCALE_TRACK';
const NDS_SCALE_TRACK = 'NDS_SCALE_TRACK';

jest.mock('../ScaleTracks', () => ({
  getMDScaleTrack: () => MD_SCALE_TRACK,
  getTVDScaleTrack: () => TVD_SCALE_TRACK,
  getNDSScaleTrack: () => NDS_SCALE_TRACK,
}));

jest.mock('../GraphTrack', () => ({
  getGraphTrack: (
    _trackLogData: WellLogPreviewData,
    trackName: GraphTrackEnum
  ) => trackName,
}));

describe('getLogViewerTracks', () => {
  it('should contain all graph tracks despite of the log data', () => {
    const tracksForEmptyLogData = getLogViewerTracks({
      logData: {},
      eventsData: [],
      depthUnit: 'ft',
    });
    const tracksForNonEmptyLogData = getLogViewerTracks({
      logData: commonLogDataMock,
      eventsData: [],
      depthUnit: 'ft',
    });

    expect(tracksForEmptyLogData).toEqual(Object.values(GraphTrackEnum));
    expect(tracksForNonEmptyLogData).toEqual(Object.values(GraphTrackEnum));
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  // it('should contain MD scale track only if MD based log data is available', () => {
  //   const tracksWithoutMDData = getLogViewerTracks({
  //     logData: {},
  //     eventsData: [],
  //     depthUnit: 'ft',
  //   });

  //   const tracksWithMDData = getLogViewerTracks({
  //     logData: mdBasedLogData,
  //     eventsData: [],
  //     depthUnit: 'ft',
  //   });

  //   expect(tracksWithoutMDData).not.toContain(MD_SCALE_TRACK);
  //   expect(tracksWithMDData).toContain(MD_SCALE_TRACK);
  // });

  it('should not contain TVD scale track if log data has MD based data only', () => {
    const tracks = getLogViewerTracks({
      logData: mdBasedLogData,
      eventsData: [],
      depthUnit: 'ft',
    });
    expect(tracks).not.toContain(TVD_SCALE_TRACK);
  });

  it('should contain TVD scale track only when TVD based data is available in log data', () => {
    const tracksWithoutTVDData = getLogViewerTracks({
      logData: {},
      eventsData: [],
      depthUnit: 'ft',
    });
    const tracksWithResistivityData = getLogViewerTracks({
      logData: getLogDataWithMeasurementType('deep resistivity'),
      eventsData: [],
      depthUnit: 'ft',
    });
    const tracksWithDensityAndNeutronData = getLogViewerTracks({
      logData: getLogDataWithMeasurementType('density'),
      eventsData: [],
      depthUnit: 'ft',
    });
    const tracksWithGeomechanicsAndPPFGData = getLogViewerTracks({
      logData: getLogDataWithMeasurementType('pore pressure'),
      eventsData: [],
      depthUnit: 'ft',
    });

    expect(tracksWithoutTVDData).not.toContain(TVD_SCALE_TRACK);
    expect(tracksWithResistivityData).toContain(TVD_SCALE_TRACK);
    expect(tracksWithDensityAndNeutronData).toContain(TVD_SCALE_TRACK);
    expect(tracksWithGeomechanicsAndPPFGData).toContain(TVD_SCALE_TRACK);
  });

  it('should not contain NDS scale track when there is no TVD based log data', () => {
    const tracks = getLogViewerTracks({
      logData: mdBasedLogData,
      eventsData: [{ holeStartValue: 0, holeEndValue: 100 }],
      depthUnit: 'ft',
    });
    expect(tracks).not.toContain(NDS_SCALE_TRACK);
  });

  it('should not contain NDS scale track when events data not available', () => {
    const tracks = getLogViewerTracks({
      logData: tvdBasedLogData,
      eventsData: [],
      depthUnit: 'ft',
    });
    expect(tracks).not.toContain(NDS_SCALE_TRACK);
  });

  it('should contain NDS scale track when both events data and TVD based log data are available', () => {
    const tracks = getLogViewerTracks({
      logData: tvdBasedLogData,
      eventsData: [{ holeStartValue: 0, holeEndValue: 100 }],
      depthUnit: 'ft',
    });
    expect(tracks).toContain(NDS_SCALE_TRACK);
  });
});
