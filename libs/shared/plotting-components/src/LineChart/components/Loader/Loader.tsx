import * as React from 'react';

import { Icon } from '@cognite/cogs.js';

import { DEFAULT_HEIGHT } from '../../constants';
import { Variant } from '../../types';

import { LoaderWrapper } from './elements';

export interface LoaderProps {
  variant?: Variant;
  height?: React.CSSProperties['height'];
}

export const Loader: React.FC<LoaderProps> = ({ variant, height }) => {
  const loaderHeight = height === DEFAULT_HEIGHT ? 450 : height;
  const size = variant === 'small' ? 16 : 36;

  return (
    <LoaderWrapper style={{ height: loaderHeight }}>
      <Icon type="Loader" size={size} />
    </LoaderWrapper>
  );
};
