import { GraphTrackEnum } from 'domain/wells/measurements0/constants';

import { DENSITY_AND_NEUTRON } from './densityAndNeutron';
import { GAMMA_RAY_AND_CALIPER } from './gammaRayAndCaliper';
import { GEOMECHANICS_AND_PPFG } from './geomechanicsAndPPFG';
import { RESISTIVITY } from './resistivity';

/**
 * This is to be taken from the WDL in near future.
 * After that, no need to have this hard coded mapping.
 * Ref: WDL-515
 */
export const MEASUREMENT_TYPE_MAPPING = {
  [GraphTrackEnum.GAMMA_RAY_AND_CALIPER]: GAMMA_RAY_AND_CALIPER,
  [GraphTrackEnum.RESISTIVITY]: RESISTIVITY,
  [GraphTrackEnum.DENSITY_AND_NEUTRON]: DENSITY_AND_NEUTRON,
  [GraphTrackEnum.GEOMECHANICS_AND_PPFG]: GEOMECHANICS_AND_PPFG,
};
