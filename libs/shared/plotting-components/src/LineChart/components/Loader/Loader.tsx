import * as React from 'react';
import { CSSProperties } from 'react';

import { Icon } from '@cognite/cogs.js';

import { LoaderWrapper } from './elements';
import { Variant } from '../../types';

export interface LoaderProps {
  variant?: Variant;
  style?: CSSProperties;
}

export const Loader: React.FC<LoaderProps> = ({ variant, style }) => {
  const size = variant === 'small' ? 16 : 36;

  return (
    <LoaderWrapper style={style}>
      <Icon type="Loader" size={size} />
    </LoaderWrapper>
  );
};
