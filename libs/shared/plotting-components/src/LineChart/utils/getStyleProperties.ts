import { CSSProperties } from 'react';

import isUndefined from 'lodash/isUndefined';

import {
  DEFAULT_PADDING,
  DEFAULT_STYLE_PROPERTIES,
  SMALL_VARIANT_PADDING,
} from '../constants';
import { Style, Variant } from '../types';

export const getStyleProperties = (
  style: Style,
  variant?: Variant
): CSSProperties => {
  const padding = variant === 'small' ? SMALL_VARIANT_PADDING : DEFAULT_PADDING;

  return {
    ...DEFAULT_STYLE_PROPERTIES,
    padding,
    ...style,
    height: 'fit-content',
    width: isUndefined(style.width) ? '100%' : 'fit-content',
  };
};
