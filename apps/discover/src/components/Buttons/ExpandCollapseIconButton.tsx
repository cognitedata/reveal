import * as React from 'react';

import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export interface ExpandCollapseIconButtonProps
  extends Omit<ExtendedButtonProps, 'expanded' | 'onChange'> {
  expanded: boolean;
  onChange: (expanded: boolean) => void;
}

export const ExpandCollapseIconButton: React.FC<
  ExpandCollapseIconButtonProps
> = ({ expanded, onChange, ...props }) => {
  const icon = expanded ? 'Collapse' : 'Expand';

  return (
    <BaseButton
      icon={icon}
      tooltip={icon}
      aria-label={icon}
      data-testid={icon}
      type="secondary"
      size="small"
      onClick={() => onChange(!expanded)}
      {...props}
    />
  );
};
