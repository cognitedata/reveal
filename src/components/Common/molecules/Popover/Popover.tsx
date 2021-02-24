import React from 'react';
import styled from 'styled-components';
import { Popover as AntDPopover } from 'antd';
import { TooltipPlacement, TooltipTrigger } from 'antd/lib/tooltip';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  style?: React.CSSProperties;
  trigger?: TooltipTrigger;
  mouseEnterDelay?: number;
  onVisibleChange?: (visible: boolean) => void;
}

const Wrapper = styled.div`
  .ant-popover-inner-content {
    padding: 0;
  }

  .ant-popover-arrow {
    display: none;
  }
`;

export const Popover = (props: PopoverProps) => {
  const {
    content,
    children,
    placement,
    trigger = 'hover',
    style,
    mouseEnterDelay = 0.1,
    onVisibleChange,
  } = props;

  return (
    <Wrapper style={style}>
      <AntDPopover
        placement={placement || 'right'}
        onVisibleChange={onVisibleChange}
        mouseEnterDelay={mouseEnterDelay}
        trigger={trigger}
        style={{ display: 'inline-block' }}
        overlayClassName="popover__no-padding popover__no-arrow"
        overlayStyle={{ zIndex: 1100 }}
        content={
          <div style={{ background: '#fff', maxWidth: '400px' }}>{content}</div>
        }
      >
        {children}
      </AntDPopover>
    </Wrapper>
  );
};
