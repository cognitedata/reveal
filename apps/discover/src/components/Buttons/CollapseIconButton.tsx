import * as React from 'react';

import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const CollapseIconButton: React.FC<ExtendedButtonProps> = ({
  ...props
}) => {
  return (
    <BaseButton
      icon="Collapse"
      tooltip="Collapse"
      aria-label="Collapse"
      type="secondary"
      size="small"
      {...props}
    />
  );
};
