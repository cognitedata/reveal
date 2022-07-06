import { GraphTrackEnum } from 'domain/wells/measurements/internal/constants';

import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import set from 'lodash/set';

import { BlockScaleTrack, GraphTrack } from '@cognite/videx-wellog';

import { MEASUREMENT_TYPE_MAPPING } from '../../../measurementTypeMapping';
import { TRACK_CONFIG } from '../../../trackConfig';
import { WellLogNdsEventsData, WellLogPreviewData } from '../types';

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

export const getCategorizedLogData = (logData: WellLogPreviewData) => {
  const gammaRayAndCaliperData: WellLogPreviewData = {};
  const resistivityData: WellLogPreviewData = {};
  const densityAndNeutronData: WellLogPreviewData = {};
  const geomechanicsAndPPFGData: WellLogPreviewData = {};

  const gammaRayAndCaliperTypes =
    MEASUREMENT_TYPE_MAPPING[GraphTrackEnum.GAMMA_RAY_AND_CALIPER];
  const resistivityTypes = MEASUREMENT_TYPE_MAPPING[GraphTrackEnum.RESISTIVITY];
  const densityAndNeutronTypes =
    MEASUREMENT_TYPE_MAPPING[GraphTrackEnum.DENSITY_AND_NEUTRON];
  const geomechanicsAndPPFGTypes =
    MEASUREMENT_TYPE_MAPPING[GraphTrackEnum.GEOMECHANICS_AND_PPFG];

  Object.keys(logData).forEach((columnExternalId) => {
    const data = logData[columnExternalId];
    const { measurementType } = data;

    if (gammaRayAndCaliperTypes.includes(measurementType)) {
      set(gammaRayAndCaliperData, columnExternalId, data);
    } else if (resistivityTypes.includes(measurementType)) {
      set(resistivityData, columnExternalId, data);
    } else if (densityAndNeutronTypes.includes(measurementType)) {
      set(densityAndNeutronData, columnExternalId, data);
    } else if (geomechanicsAndPPFGTypes.includes(measurementType)) {
      set(geomechanicsAndPPFGData, columnExternalId, data);
    }
  });

  return {
    gammaRayAndCaliperData,
    resistivityData,
    densityAndNeutronData,
    geomechanicsAndPPFGData,
  };
};

export const convertEventsDataToArray = (data: WellLogNdsEventsData[]) => {
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
  const track = graphTrack.elm.parentElement;
  const trackTitle = track?.getElementsByClassName('track-title')[0];
  const trackLegend = track?.getElementsByClassName('track-legend')[0];

  trackContainer.style.opacity = DISABLED_OPACITY;
  trackTitle?.setAttribute(
    'style',
    `pointer-events: none;opacity: ${DISABLED_OPACITY};`
  );
  (trackLegend as HTMLElement).style.opacity = DISABLED_OPACITY;
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
