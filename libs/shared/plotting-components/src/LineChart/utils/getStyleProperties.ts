import { CSSProperties } from 'react';

import isUndefined from 'lodash/isUndefined';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_HEIGHT,
  DEFAULT_PADDING,
  DEFAULT_STYLE_PROPERTIES,
  DEFAULT_WIDTH,
  SMALL_VARIANT_PADDING,
} from '../constants';
import { Style, Variant } from '../types';

export const getStyleProperties = (
  style: Style,
  variant?: Variant
): CSSProperties => {
  const padding = variant === 'small' ? SMALL_VARIANT_PADDING : DEFAULT_PADDING;
  const backgroundColor = style.backgroundColor || DEFAULT_BACKGROUND_COLOR;

  return {
    ...DEFAULT_STYLE_PROPERTIES,
    padding,
    ...style,
    backgroundColor,
    height: isUndefined(style.height) ? DEFAULT_HEIGHT : style.height,
    width: isUndefined(style.width) ? DEFAULT_WIDTH : style.width,
  };
};
