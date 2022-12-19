import * as React from 'react';

import { Icon } from '@cognite/cogs.js';

import { DragHandleIconProps } from '../types';

const Horizontal: React.FC<DragHandleIconProps> = ({
  dragHandleProps,
  ...iconProps
}) => {
  return (
    <Icon
      type="DragHandleHorizontal"
      {...dragHandleProps}
      {...iconProps}
      style={{ flexShrink: 0 }}
    />
  );
};

const Vertical: React.FC<DragHandleIconProps> = ({
  dragHandleProps,
  ...iconProps
}) => {
  return (
    <Icon
      type="DragHandleVertical"
      {...dragHandleProps}
      {...iconProps}
      style={{ flexShrink: 0 }}
    />
  );
};

export const DragHandleIcon = {
  Horizontal,
  Vertical,
};
