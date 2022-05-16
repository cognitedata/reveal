import React, { ReactNode } from 'react';

import { Tooltip as DefaultTooltip } from '@cognite/cogs.js';

import { TooltipPlacement } from './types';

export interface Props {
  title: string;
  placement?: TooltipPlacement;
  enterDelay?: number;
  enabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const Tooltip: React.FC<Props> = ({
  title,
  placement,
  children,
  enterDelay,
  className,
  enabled = true,
}) => {
  return (
    <DefaultTooltip
      placement={placement || 'bottom'}
      content={title}
      delay={enterDelay}
      disabled={!enabled}
      className={className}
    >
      {children as React.ReactElement}
    </DefaultTooltip>
  );
};

export default Tooltip;
