import React from 'react';

import { Tooltip, TooltipProps } from '@cognite/cogs.js';

interface PopoverProps {
  children: TooltipProps['children'];
  content: React.ReactNode;
  placement?: TooltipProps['placement'];
  mouseEnterDelay?: number;
}

export const Popover = ({
  content,
  children,
  placement,
  mouseEnterDelay = 0.1,
}: PopoverProps) => (
  <Tooltip
    placement={placement || 'right'}
    delay={mouseEnterDelay}
    maxWidth="auto"
    interactive={false}
    hideOnClick
    onClickOutside={(instance) => instance.hide()}
    content={<div style={{ background: '#fff', width: 'auto' }}>{content}</div>}
  >
    {children}
  </Tooltip>
);
