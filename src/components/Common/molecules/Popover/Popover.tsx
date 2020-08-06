import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipProps } from '@cognite/cogs.js';

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
      interactive
      hideOnClick={false}
      onClickOutside={instance => instance.hide()}
      content={
        <div style={{ background: '#fff', maxWidth: '400px' }}>{content}</div>
      }
    >
      {children}
    </StyledTooltip>
  );
};
