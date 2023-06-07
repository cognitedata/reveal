import { CONFIG_BY_VARIANT, DEAULT_CONFIG } from '../config';
import { Config, Variant } from '../types';

export const getConfig = (
  config: Partial<Config>,
  variant?: Variant
): Config => {
  const configByVariant = variant ? CONFIG_BY_VARIANT[variant] : DEAULT_CONFIG;

  return {
    ...configByVariant,
    ...config,
  };
};
