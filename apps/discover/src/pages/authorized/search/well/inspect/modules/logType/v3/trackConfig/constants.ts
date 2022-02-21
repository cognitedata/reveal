export enum TrackNameEnum {
  'GR' = 'GR',
  'RDEEP' = 'RDEEP',
  'DN' = 'D&N',
  'PPFG' = 'PPFG',
}

export const TRACK_POSSIBLE_MEASURMENT_TYPES: Record<TrackNameEnum, string[]> =
  {
    [TrackNameEnum.GR]: ['gamma ray', 'caliper'],
    [TrackNameEnum.RDEEP]: ['resistivity'],
    [TrackNameEnum.DN]: ['density', 'neutron'],
    [TrackNameEnum.PPFG]: [],
  };
