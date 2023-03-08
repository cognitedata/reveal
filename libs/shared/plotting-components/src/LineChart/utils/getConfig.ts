import { DEAULT_CONFIG } from '../constants';
import { Config } from '../types';

export const getConfig = (config: Partial<Config>): Config => {
  return {
    ...DEAULT_CONFIG,
    ...config,
  };
};
