import React from 'react';

import { Tooltip as BaseTooltip } from 'components/Tooltip';

import type { Props } from './Tooltip';

export const Tooltip: React.FC<Props> = ({ title, children, placement }) => {
  return (
    <BaseTooltip title={title} placement={placement} enterDelay={1000}>
      {children}
    </BaseTooltip>
  );
};
