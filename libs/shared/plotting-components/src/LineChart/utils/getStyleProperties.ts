import { CSSProperties } from 'react';

import {
  DEFAULT_PADDING,
  DEFAULT_STYLE_PROPERTIES,
  SMALL_VARIANT_PADDING,
} from '../constants';
import { Variant } from '../types';

export const getStyleProperties = (
  style: CSSProperties,
  variant?: Variant
): CSSProperties => {
  const padding = variant === 'small' ? SMALL_VARIANT_PADDING : DEFAULT_PADDING;

  return {
    ...DEFAULT_STYLE_PROPERTIES,
    padding,
    ...style,
  };
};
