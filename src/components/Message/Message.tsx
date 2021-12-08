import React, { useEffect, useState } from 'react';

import { AllIconTypes, Body, Button, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export type MessageSize = 'small' | 'default';

type MessageProps = {
  className?: string;
  duration?: number;
  isClosable?: boolean;
  message: string;
  size?: MessageSize;
  type?: MessageType;
};

const Message = ({
  className,
  duration,
  isClosable,
  message,
  size = 'default',
  type = 'info',
}: MessageProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true);

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
      icon = 'ErrorFilled';
      iconColor = '#CF1A17';
      break;
    case 'loading':
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      icon = 'Loader';
      iconColor = '#2B3A88';
      break;
    case 'info':
    default:
      backgroundColor = 'rgba(110, 133, 252, 0.06)';
      icon = 'InfoFilled';
      iconColor = Colors['bg-status-small--accent'].hex();
      break;
  }

  useEffect(() => {
    if (isClosable) {
      setTimeout(() => {
        setIsOpen(false);
      }, [duration]);
    }
  }, [duration, isClosable]);

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
      $size={size}
      className={className}
    >
      <StyledMessageIcon $iconColor={iconColor} type={icon} />
      <StyledMessageContent level={2}>{message}</StyledMessageContent>
      {isClosable && (
        <StyledCloseButton
          aria-label="Close message"
          icon="Close"
          onClick={handleMessageClick}
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
