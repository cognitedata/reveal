import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import pickBy from 'lodash/pickBy';

import { BlockScaleTrack, GraphTrack } from '@cognite/videx-wellog';

import { TRACK_CONFIG } from '../../../trackConfig';
import {
  TrackNameEnum,
  TRACK_POSSIBLE_MEASURMENT_TYPES,
} from '../../../trackConfig/constants';
import { EventData, LogData } from '../interfaces';

import {
  DISABLED_OPACITY,
  ELEMENT_CHECK_INTERVAL,
  ELEMENT_MAX_WAIT,
  SVG_NS,
} from './constants';

const keyedTrackConfig = keyBy(TRACK_CONFIG, 'measurementType');
const trackConfigMeasurementTypes = Object.keys(keyedTrackConfig);

export const getTrackConfig = (requiredMeasurementType: string) => {
  const trackConfig = keyedTrackConfig[requiredMeasurementType];

  if (trackConfig) {
    return trackConfig;
  }

  const matchingMeasurementType = trackConfigMeasurementTypes.find(
    (measurementType) => requiredMeasurementType.includes(measurementType)
  );
  return matchingMeasurementType
    ? keyedTrackConfig[matchingMeasurementType]
    : undefined;
};

export const getTrackLogData = (logData: LogData, trackName: TrackNameEnum) => {
  return pickBy(logData, (data) => {
    const matchers = TRACK_POSSIBLE_MEASURMENT_TYPES[trackName];
    return new RegExp(matchers.join('|')).test(data.measurementType);
  });
};

export const convertEventsDataToArray = (data: EventData[]) => {
  return data
    .filter((eventData) => !isEmpty(eventData.riskType))
    .map(({ holeStartValue, holeEndValue, riskType }) => [
      holeStartValue,
      riskType,
      holeEndValue,
    ]);
};

// This is used to hide null events and append title for event blocks
export const setNdsEventsBlocksTitle = (ndsTrack: BlockScaleTrack) => {
  const majorTicks = ndsTrack.elm.getElementsByClassName('major-tick');

  if (isEmpty(majorTicks)) return;

  for (let i = 0; i < majorTicks.length; i++) {
    if (ndsTrack.labels[i] === null || ndsTrack.labels[i] === undefined) {
      majorTicks[i].setAttribute('display', 'none');
      return;
    }

    const titleNode = document.createElementNS(SVG_NS, 'title');
    titleNode.innerHTML = ndsTrack.labels[i];
    majorTicks[i].setAttribute(
      'style',
      'pointer-events: auto;cursor: pointer;'
    );
    majorTicks[i].prepend(titleNode);
  }
};

// This greys out the column when there is no data (curves) to display.
export const disableGraphTrack = (graphTrack: GraphTrack) => {
  if (!graphTrack.elm) return;

  const trackContainer = graphTrack.elm;
  const trackTitle =
    graphTrack.elm.parentElement?.getElementsByClassName('track-title')[0];

  trackContainer.style.opacity = `${DISABLED_OPACITY}`;
  trackTitle?.setAttribute(
    'style',
    `pointer-events: none;opacity: ${DISABLED_OPACITY};`
  );
};

export const setupElementsAppenderOnTrack = (
  track: any,
  elementsAppenderCallback: (track: any) => void
) => {
  let checkCount = 0;
  const setBlocksTitle = setInterval(() => {
    if (checkCount >= ELEMENT_MAX_WAIT / ELEMENT_CHECK_INTERVAL) {
      // clear interval if its reached maximum wait time
      clearInterval(setBlocksTitle);
    } else if (track.elm) {
      elementsAppenderCallback(track);
      clearInterval(setBlocksTitle);
    }
    checkCount += 1;
  }, ELEMENT_CHECK_INTERVAL);
};
