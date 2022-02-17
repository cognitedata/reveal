import { DN_COLUMNS_CONFIG } from './columnsConfig/dn';
import { MD_COLUMNS_CONFIG } from './columnsConfig/md';
import { PPFG_COLUMNS_CONFIG } from './columnsConfig/ppfg';
import { RDEEP_COLUMNS_CONFIG } from './columnsConfig/rdeep';
import { TrackNameEnum } from './constants';
import { TrackConfig, TrackName } from './types';

export const TRACK_CONFIG: (TrackConfig & TrackName)[] = [
  ...MD_COLUMNS_CONFIG.map((config) => ({
    ...config,
    trackName: TrackNameEnum.MD,
  })),
  ...RDEEP_COLUMNS_CONFIG.map((config) => ({
    ...config,
    trackName: TrackNameEnum.RDEEP,
  })),
  ...DN_COLUMNS_CONFIG.map((config) => ({
    ...config,
    trackName: TrackNameEnum.DN,
  })),
  ...PPFG_COLUMNS_CONFIG.map((config) => ({
    ...config,
    trackName: TrackNameEnum.PPFG,
  })),
];
