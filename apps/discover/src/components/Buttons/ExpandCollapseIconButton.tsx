import * as React from 'react';

import { IconButton } from './IconButton';

export interface ExpandCollapseIconButtonProps {
  expanded: boolean;
  disabled?: boolean;
  onChange: (expanded: boolean) => void;
}

export const ExpandCollapseIconButton: React.FC<
  ExpandCollapseIconButtonProps
> = ({ expanded, disabled, onChange }) => {
  return (
    <IconButton
      icon={expanded ? 'Collapse' : 'Expand'}
      disabled={disabled}
      tooltip={expanded ? 'Collapse' : 'Expand'}
      onClick={() => !disabled && onChange(!expanded)}
    />
  );
};
