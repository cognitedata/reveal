import { CollapsePanelProps, Icon } from '@cognite/cogs.js';
import React from 'react';

export const ExpandIconComponent = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownCompact"
      style={{
        marginRight: 8,
        transition: 'transform .2s',
        transform: `rotate(${isActive ? 0 : -180}deg)`,
      }}
    />
  );
};
