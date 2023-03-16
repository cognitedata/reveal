import { AxisDirectionConfig, Config, Variant } from './types';

export const DEFAULT_AXIS_DIRECTION_CONFIG: AxisDirectionConfig = 'x+y';

export const DEAULT_CONFIG: Config = {
  responsive: true,
  scrollZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  selectionZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  buttonZoom: DEFAULT_AXIS_DIRECTION_CONFIG,
  pan: DEFAULT_AXIS_DIRECTION_CONFIG,
  hoverMode: 'x',
};

export const CONFIG_BY_VARIANT: Record<Variant, Config> = {
  small: {
    ...DEAULT_CONFIG,
    scrollZoom: false,
    selectionZoom: false,
    buttonZoom: false,
    pan: false,
  },
  medium: {
    ...DEAULT_CONFIG,
  },
  large: {
    ...DEAULT_CONFIG,
  },
};
