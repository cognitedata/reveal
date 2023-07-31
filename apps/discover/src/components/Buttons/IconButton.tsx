import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { IconWrapper } from './elements';
import { IconButtonProps } from './types';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  disabled,
  tooltip,
  onClick,
}) => {
  return (
    <Tooltip content={tooltip} disabled={disabled || isEmpty(tooltip)}>
      <IconWrapper $disabled={disabled} data-testid={tooltip}>
        <Icon type={icon} onClick={() => !disabled && onClick()} />
      </IconWrapper>
    </Tooltip>
  );
};
