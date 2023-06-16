import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Icon, IconType } from '@cognite/cogs.js';

export type InfoBoxStatus =
  | 'critical'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'undefined';

type InfoBoxProps = {
  children: React.ReactNode;
  icon?: IconType | boolean;
  status?: InfoBoxStatus;
  title?: React.ReactNode;
};

const InfoBox = ({
  children,
  icon,
  status = 'undefined',
  title,
}: InfoBoxProps): JSX.Element => {
  return (
    <StyledInfoBoxContainer $status={status}>
      {icon && (
        <InfoBoxIconContainer>
          <StyledInfoBoxIcon
            $status={status}
            type={typeof icon === 'boolean' ? 'InfoFilled' : icon}
          />
        </InfoBoxIconContainer>
      )}
      <Flex direction="column" gap={2}>
        {title && (
          <StyledInfoBoxTitle level={3} strong>
            {title}
          </StyledInfoBoxTitle>
        )}
        <Body level={3}>{children}</Body>
      </Flex>
    </StyledInfoBoxContainer>
  );
};

const StyledInfoBoxContainer = styled.div<{ $status: InfoBoxStatus }>`
  background-color: ${({ $status }) =>
    Colors[`surface--status-${$status}--muted--default`]};
  border-radius: 6px;
  display: flex;
  gap: 8px;
  padding: 8px 12px;
`;

const InfoBoxIconContainer = styled.div`
  height: 16px;
  width: 16px;
`;

const StyledInfoBoxIcon = styled(Icon)<{ $status: InfoBoxStatus }>`
  color: ${({ $status }) => Colors[`text-icon--status-${$status}`]};
  margin-top: 2px;
`;

const StyledInfoBoxTitle = styled(Body)`
  color: ${Colors['text-icon--strong']};
`;

export default InfoBox;
