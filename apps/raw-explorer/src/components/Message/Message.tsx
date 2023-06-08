import React, { useState } from 'react';

import styled from 'styled-components';

import { AllIconTypes, Body, Button, Colors, Icon } from '@cognite/cogs.js';

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export type MessageSize = 'small' | 'default';

type MessageProps = {
  className?: string;
  isClosable?: boolean;
  message: string;
  size?: MessageSize;
  type?: MessageType;
};

const Message = ({
  className,
  isClosable,
  message,
  size = 'default',
  type = 'info',
}: MessageProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true);

  let backgroundColor: string;
  let icon: AllIconTypes;
  let iconColor: string;
  let border: string;
  switch (type) {
    case 'success':
      backgroundColor = 'rgba(57, 162, 99, 0.06)';
      border = '1px solid rgba(57, 162, 99, 0.2)';
      icon = 'CheckmarkFilled';
      iconColor = '#2E8551';
      break;
    case 'warning':
      backgroundColor = 'rgba(255, 187, 0, 0.06)';
      border = '1px solid rgba(255, 187, 0, 0.2)';
      icon = 'WarningFilled';
      iconColor = '#D67F05';
      break;
    case 'error':
      backgroundColor = 'rgba(223, 58, 55, 0.06)';
      border = '1px solid rgba(223, 58, 55, 0.2)';
      icon = 'ErrorFilled';
      iconColor = '#CF1A17';
      break;
    case 'loading':
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      border = '1px solid rgba(110, 133, 252, 0.2)';
      icon = 'Loader';
      iconColor = Colors['text-icon--interactive--default'];
      break;
    case 'info':
    default:
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      border = '1px solid rgba(110, 133, 252, 0.2)';
      icon = 'InfoFilled';
      iconColor = Colors['surface--status-neutral--muted--default'];
      break;
  }

  const handleMessageClick = (): void => {
    if (isClosable) {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return <></>;
  }

  return (
    <StyledMessageWrapper
      $backgroundColor={backgroundColor}
      $border={border}
      $isClosable={isClosable}
      $size={size}
      className={className}
      onClick={handleMessageClick}
    >
      <StyledMessageIcon $iconColor={iconColor} type={icon} />
      <StyledMessageContent level={2}>{message}</StyledMessageContent>
      {isClosable && (
        <StyledCloseButton
          aria-label="Close message"
          icon="Close"
          size="small"
          type="ghost"
        />
      )}
    </StyledMessageWrapper>
  );
};

const StyledMessageIcon = styled(Icon)<{ $iconColor: string }>`
  color: ${({ $iconColor }) => $iconColor};
  margin-right: 10px;
`;

const StyledMessageWrapper = styled.div<{
  $backgroundColor: string;
  $border: string;
  $isClosable?: boolean;
  $size: MessageSize;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: ${({ $border }) => $border};
  border-radius: 8px;
  display: flex;
  padding: ${({ $size }) => ($size === 'small' ? '10px 14px' : '16px')};
  cursor: ${({ $isClosable }) => $isClosable && 'pointer'};
`;

const StyledMessageContent = styled(Body)`
  color: ${Colors['text-icon--strong']};
  flex: 1;
  word-break: break;
`;

const StyledCloseButton = styled(Button)`
  && {
    height: 16px;
    padding: 0;

    :hover {
      background: unset;
    }
  }
`;

export default Message;
