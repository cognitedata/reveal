import { GraphTrackEnum } from 'domain/wells/measurements/constants';

import { DENSITY_AND_NEUTRON_PLOTS } from './plotConfig/densityAndNeutron';
import { GAMMA_RAY_AND_CALIPER_PLOTS } from './plotConfig/gammaRayAndCaliper';
import { GEOMECHANICS_AND_PPFG_PLOTS } from './plotConfig/geomechanicsAndPPFG';
import { RESISTIVITY_PLOTS } from './plotConfig/resistivity';
import { TrackConfig } from './types';

export const TRACK_CONFIG: TrackConfig[] = [
  ...GAMMA_RAY_AND_CALIPER_PLOTS.map((config) => ({
    ...config,
    trackName: GraphTrackEnum.GAMMA_RAY_AND_CALIPER,
  })),
  ...RESISTIVITY_PLOTS.map((config) => ({
    ...config,
    trackName: GraphTrackEnum.RESISTIVITY,
  })),
  ...DENSITY_AND_NEUTRON_PLOTS.map((config) => ({
    ...config,
    trackName: GraphTrackEnum.DENSITY_AND_NEUTRON,
  })),
  ...GEOMECHANICS_AND_PPFG_PLOTS.map((config) => ({
    ...config,
    trackName: GraphTrackEnum.GEOMECHANICS_AND_PPFG,
  })),
];
