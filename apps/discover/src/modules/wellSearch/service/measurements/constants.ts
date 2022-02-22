/**
 * Graph track names which are displayed in the well log viewer.
 */
export enum GraphTrackEnum {
  GAMMA_RAY_AND_CALIPER = 'Gamma Ray & Caliper',
  RESISTIVITY = 'Resistivity',
  DENSITY_AND_NEUTRON = 'Density & Neutron',
  GEOMECHANICS_AND_PPFG = 'Geomechanics & PPFG',
}

/**
 * Measurement types to fetch with regard to each graph track.
 */
export const WELL_LOGS_MEASUREMENT_TYPES = {
  [GraphTrackEnum.GAMMA_RAY_AND_CALIPER]: ['gamma ray', 'caliper'],
  [GraphTrackEnum.RESISTIVITY]: [
    'deep resistivity',
    'medium resistivity',
    'micro resistivity',
    'shallow resistivity',
  ],
  [GraphTrackEnum.DENSITY_AND_NEUTRON]: ['density', 'neutron porosity'],
  [GraphTrackEnum.GEOMECHANICS_AND_PPFG]: [
    'pore pressure',
    'fracture pressure',
    'geomechanics',
  ],
};
