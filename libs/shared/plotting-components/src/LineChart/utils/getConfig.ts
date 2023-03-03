import { DEAULT_CONFIG } from '../constants';
import { Config } from '../types';

export const getConfig = (config: Config = {}): Required<Config> => {
  return {
    ...DEAULT_CONFIG,
    ...config,
  };
};
