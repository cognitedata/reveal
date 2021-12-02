import React from 'react';

import { AllIconTypes, Body, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export type MessageSize = 'small' | 'default';

type MessageProps = {
  className?: string;
  message: string;
  size?: MessageSize;
  type?: MessageType;
};

const Message = ({
  className,
  message,
  size = 'default',
  type = 'info',
}: MessageProps): JSX.Element => {
  let backgroundColor: string;
  let icon: AllIconTypes;
  let iconColor: string;
  switch (type) {
    case 'success':
      backgroundColor = 'rgba(57, 162, 99, 0.06)';
      icon = 'CheckmarkFilled';
      iconColor = '#2E8551';
      break;
    case 'warning':
      backgroundColor = 'rgba(255, 187, 0, 0.06)';
      icon = 'WarningFilled';
      iconColor = '#D67F05';
      break;
    case 'error':
      backgroundColor = 'rgba(223, 58, 55, 0.06)';
      icon = 'Beware';
      iconColor = '#CF1A17';
      break;
    case 'info':
    default:
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      icon = 'InfoFilled';
      iconColor = Colors['bg-status-small--accent'].hex();
      break;
  }

  return (
    <StyledMessageWrapper
      $backgroundColor={backgroundColor}
      $size={size}
      className={className}
    >
      <StyledMessageIcon $iconColor={iconColor} type={icon} />
      <StyledMessageContent level={2}>{message}</StyledMessageContent>
    </StyledMessageWrapper>
  );
};

const StyledMessageIcon = styled(Icon)<{ $iconColor: string }>`
  color: ${({ $iconColor }) => $iconColor};
  margin-right: 10px;
`;

const StyledMessageWrapper = styled.div<{
  $backgroundColor: string;
  $size: MessageSize;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 8px;
  display: flex;
  padding: ${({ $size }) => ($size === 'small' ? '10px 14px' : '16px')};
`;

const StyledMessageContent = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  flex: 1;
  word-break: break;
`;

export default Message;
