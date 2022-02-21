import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import { isMeasurementUnit } from 'utils/units/isMeasurementUnit';

import { Track } from '@cognite/videx-wellog';

import { TrackNameEnum } from '../../../trackConfig/constants';
import { EventData, LogData } from '../interfaces';

import { getGraphTrack } from './GraphTrack';
import {
  getMDScaleTrack,
  getNDSScaleTrack,
  getTVDScaleTrack,
} from './ScaleTracks';
import { getTrackLogData } from './utils';

export const getLogViewerTracks = ({
  logData,
  eventsData,
  depthUnit,
}: {
  logData: LogData;
  eventsData: EventData[];
  depthUnit: string;
}): Track[] => {
  const grTrackLogData = getTrackLogData(logData, TrackNameEnum.GR);
  const rdeepTrackLogData = getTrackLogData(logData, TrackNameEnum.RDEEP);
  const dnTrackLogData = getTrackLogData(logData, TrackNameEnum.DN);

  const ppfgIgnoreColumnExternalIds = Object.keys({
    ...grTrackLogData,
    ...rdeepTrackLogData,
    ...dnTrackLogData,
  });

  const ppfgLogData = pickBy(
    logData,
    (data, columnExternalId) =>
      !isMeasurementUnit(data.unit) &&
      !ppfgIgnoreColumnExternalIds.includes(columnExternalId)
  );

  const hasMdData = !isEmpty(grTrackLogData);
  const hasTvdData =
    !isEmpty(rdeepTrackLogData) ||
    !isEmpty(dnTrackLogData) ||
    !isEmpty(ppfgLogData);
  const hasNdsData = hasTvdData && !isEmpty(eventsData);

  const tracks = [
    getGraphTrack(grTrackLogData, TrackNameEnum.GR),

    hasMdData && getMDScaleTrack(depthUnit),
    hasTvdData && getTVDScaleTrack(depthUnit),
    hasNdsData && getNDSScaleTrack(eventsData, depthUnit),

    getGraphTrack(rdeepTrackLogData, TrackNameEnum.RDEEP),
    getGraphTrack(dnTrackLogData, TrackNameEnum.DN),
    getGraphTrack(ppfgLogData, TrackNameEnum.PPFG),
  ];

  return compact(tracks);
};
