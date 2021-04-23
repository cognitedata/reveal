import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipProps, Colors } from '@cognite/cogs.js';

const lightGrey = Colors['greyscale-grey3'].hex();

interface PopoverProps {
  children: TooltipProps['children'];
  content: React.ReactNode;
  placement?: TooltipProps['placement'];
  trigger?: string;
  mouseEnterDelay?: number;
}

export const Popover = ({
  content,
  children,
  placement,
  trigger = 'hover',
  mouseEnterDelay = 0.1,
}: PopoverProps) => (
  <StyledTooltip
    placement={placement || 'right'}
    delay={mouseEnterDelay}
    trigger={trigger}
    maxWidth="auto"
    interactive={false}
    hideOnClick
    onClickOutside={(instance) => instance.hide()}
    content={<div style={{ background: '#fff', width: 'auto' }}>{content}</div>}
  >
    {children}
  </StyledTooltip>
);

const StyledTooltip = styled(Tooltip)`
  background: #fff;
  color: #000;
  box-shadow: 0px 0px 8px ${lightGrey};
  padding: 8px;
  .tippy-arrow {
    color: #fff;
  }
`;
