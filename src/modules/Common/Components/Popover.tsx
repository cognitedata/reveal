import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipProps } from '@cognite/cogs.js';
import { lightGrey } from 'src/utils/Colors';

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
  <StyledTooltip
    placement={placement || 'right'}
    delay={mouseEnterDelay}
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
  box-shadow: 0 0 8px ${lightGrey};
  padding: 8px;
  .tippy-arrow {
    color: #fff;
  }
`;
