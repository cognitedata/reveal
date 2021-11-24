import React from 'react';

import { AllIconTypes, Body, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

type MessageType = 'info' | 'success' | 'warning' | 'error';

type MessageProps = {
  message: string;
  type?: MessageType;
};

const Message = ({ message, type = 'info' }: MessageProps): JSX.Element => {
  let backgroundColor: string;
  let icon: AllIconTypes;
  let iconColor: string;
  switch (type) {
    case 'success':
      backgroundColor = 'rgba(57, 162, 99, 0.06)';
      icon = 'CheckmarkFilled';
      iconColor = Colors.success.hex();
      break;
    case 'warning':
      backgroundColor = 'rgba(255, 187, 0, 0.06)';
      icon = 'WarningFilled';
      iconColor = Colors.warning.hex();
      break;
    case 'error':
      backgroundColor = 'rgba(223, 58, 55, 0.06)';
      icon = 'Beware';
      iconColor = Colors.danger.hex();
      break;
    case 'info':
    default:
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      icon = 'InfoFilled';
      iconColor = Colors['text-accent'].hex();
      break;
  }

  return (
    <StyledMessageWrapper $backgroundColor={backgroundColor}>
      <StyledMessageIcon $iconColor={iconColor} type={icon} />
      <StyledMessageContent level={2}>{message}</StyledMessageContent>
    </StyledMessageWrapper>
  );
};

const StyledMessageIcon = styled(Icon)<{ $iconColor: string }>`
  color: ${({ $iconColor }) => $iconColor};
  margin-right: 10px;
`;

const StyledMessageWrapper = styled.div<{ $backgroundColor: string }>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 8px;
  display: flex;
  padding: 16px;
`;

const StyledMessageContent = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  flex: 1;
  word-break: break;
`;

export default Message;
