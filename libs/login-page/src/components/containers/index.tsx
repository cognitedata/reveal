import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

import { BREAKPOINT_WIDTH } from '../../utils';

import { DomainHelpModal } from './DomainHelpModal';

export const StyledSelectSignInMethodContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  margin: 36px;
  max-height: calc(100% - 72px);
  width: ${BREAKPOINT_WIDTH}px;

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    height: 100%;
    margin: 0;
    max-height: 100%;
    border-radius: 0;
  }
`;

export const StyledApplicationTitle = styled.div`
  font-feature-settings: normal; /* can be removed once updated cogs component is used here */
  font-size: 12px;
  font-weight: 500;
  margin: 24px 0 8px;
`;

export const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

export const StyledContainerHeader = styled(StyledHeader)`
  background-color: #f8f8f8;
  border-radius: 6px 6px 0 0;
  padding: 36px 0 24px;
  margin: 0;
  width: 100%;
`;

export const StyledContent = styled.div<{ $isBordered?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px 24px;
  width: 100%;

  ${({ $isBordered }) =>
    $isBordered &&
    `
    border-bottom: 1px solid ${Colors['border--muted']};
    border-top: 1px solid ${Colors['border--muted']};
    `};

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    flex: 1;
  }
`;

export const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  width: 100%;

  button {
    padding: 8px 12px 8px 12px !important;
  }
`;

export const WarningAlertContainer = styled(Flex)`
  background: ${Colors['decorative--grayscale--200']};
  padding: 16px;
  border-radius: 6px;
  box-sizing: border-box;
`;

type WarningAlertProps = {
  children: React.ReactNode;
  title: string;
};

export const WarningAlert = ({
  children,
  title,
}: WarningAlertProps): JSX.Element => {
  return (
    <WarningAlertContainer direction="column" gap={12}>
      <Flex alignItems="center" gap={8}>
        <Icon type="WarningTriangleFilled" size={14} />
        <Body level={3} strong>
          {title}
        </Body>
      </Flex>
      {children}
    </WarningAlertContainer>
  );
};

export const StyledOrganizationImage = styled.img`
  max-height: 64px;
  max-width: 100%;
`;

export const StyledApplicationImage = styled.img`
  max-height: 24px;
  max-width: 100%;
`;

export { DomainHelpModal };
