import React, { useState } from 'react';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { Body, Button, Colors, Flex, Link } from '@cognite/cogs.js';

type ReleaseBannerProps = {
  defaultIsOpen: React.ReactNode;
  linkUrl: string;
  onRequestClose?: () => void;
  text: string;
  buttonText: string;
};

export const ReleaseBanner = ({
  defaultIsOpen,
  linkUrl,
  onRequestClose = noop,
  text,
  buttonText,
}: ReleaseBannerProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const handleCloseClick = (): void => {
    onRequestClose();
    setIsOpen(false);
  };

  return isOpen ? (
    <StyledReleaseBanner>
      <Flex
        alignItems="center"
        gap={8}
        style={{ flex: 1 }}
        justifyContent="center"
      >
        <Body level={2}>{text}</Body>
        <Link href={linkUrl} target="_blank" data-testid="banner-open-button">
          {buttonText}
        </Link>
      </Flex>
      <StyledCloseButton
        icon="Close"
        onClick={handleCloseClick}
        size="small"
        type="ghost"
        data-testid="banner-close-button"
        aria-label="close banner"
      />
    </StyledReleaseBanner>
  ) : (
    <></>
  );
};

const StyledReleaseBanner = styled.div`
  background-color: ${Colors['surface--status-neutral--muted--default']};
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  align-items: center;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  position: absolute;
  width: 100%;
`;

const StyledCloseButton = styled(Button)`
  align-self: end;
  padding: 10px;
`;
