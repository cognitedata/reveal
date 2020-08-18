import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipProps, Colors } from '@cognite/cogs.js';

interface PopoverProps {
  children: TooltipProps['children'];
  content: React.ReactNode;
  placement?: TooltipProps['placement'];
  trigger?: string;
  mouseEnterDelay?: number;
}

const StyledTooltip = styled(Tooltip)`
  background: #fff;
  color: #000;
  box-shadow: 0px 0px 8px ${Colors['greyscale-grey3'].hex()};
  padding: 8px;
  .tippy-arrow {
    color: #fff;
  }
`;

export const Popover = (props: PopoverProps) => {
  const {
    content,
    children,
    placement,
    trigger = 'hover',
    mouseEnterDelay = 0.1,
  } = props;

  return (
    <StyledTooltip
      placement={placement || 'right'}
      delay={mouseEnterDelay}
      trigger={trigger}
      maxWidth="auto"
      interactive
      hideOnClick={false}
      onClickOutside={instance => instance.hide()}
      content={
        <div style={{ background: '#fff', width: 'auto' }}>{content}</div>
      }
    >
      {children}
    </StyledTooltip>
  );
};
