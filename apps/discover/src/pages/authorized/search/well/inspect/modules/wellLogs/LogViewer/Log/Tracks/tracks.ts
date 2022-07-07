import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { Track } from '@cognite/videx-wellog';

import { GraphTrackEnum } from '../../../constants';
import { WellLogNdsEventsData, WellLogPreviewData } from '../types';

import { getGraphTrack } from './GraphTrack';
import {
  // getMDScaleTrack,
  getNDSScaleTrack,
  getTVDScaleTrack,
} from './ScaleTracks';
import { getCategorizedLogData } from './utils';

export const getLogViewerTracks = ({
  logData,
  eventsData,
  depthUnit,
}: {
  logData: WellLogPreviewData;
  eventsData: WellLogNdsEventsData[];
  depthUnit: string;
}): Track[] => {
  const {
    gammaRayAndCaliperData,
    resistivityData,
    densityAndNeutronData,
    geomechanicsAndPPFGData,
  } = getCategorizedLogData(logData);

  // const hasMdData = !isEmpty(gammaRayAndCaliperData);
  const hasTvdData =
    !isEmpty(resistivityData) ||
    !isEmpty(densityAndNeutronData) ||
    !isEmpty(geomechanicsAndPPFGData);
  const hasNdsData = hasTvdData && !isEmpty(eventsData);

  const tracks = [
    getGraphTrack(gammaRayAndCaliperData, GraphTrackEnum.GAMMA_RAY_AND_CALIPER),

    /**
     * PP-2769
     * Disabling the MD scale track since WDL doesnt allow TVD to MD transformation for now.
     */
    // hasMdData && getMDScaleTrack(depthUnit),

    hasTvdData && getTVDScaleTrack(depthUnit),
    hasNdsData && getNDSScaleTrack(eventsData, depthUnit),

    getGraphTrack(resistivityData, GraphTrackEnum.RESISTIVITY),
    getGraphTrack(densityAndNeutronData, GraphTrackEnum.DENSITY_AND_NEUTRON),
    getGraphTrack(
      geomechanicsAndPPFGData,
      GraphTrackEnum.GEOMECHANICS_AND_PPFG
    ),
  ];

  return compact(tracks);
};
