import { CSSProperties } from 'react';

import { DEFAULT_STYLE_PROPERTIES } from '../constants';

export const getStyleProperties = (
  style: CSSProperties = {}
): CSSProperties => {
  return {
    ...DEFAULT_STYLE_PROPERTIES,
    ...style,
  };
};
