import { ReactNode } from 'react';

import styled from 'styled-components';

import { Colors, Detail, Icon, Title } from '@cognite/cogs.js';

interface BlockedWarningProps {
  details: ReactNode;
  title: string;
}

const BlockedWarning = ({ details, title }: BlockedWarningProps) => (
  <StyledContainer>
    <StyledTitleBar>
      <StyledWarningIcon />
      <Title level={6}>{title}</Title>
    </StyledTitleBar>
    <Detail style={{ color: Colors['text-icon--strong'] }}>{details}</Detail>
  </StyledContainer>
);

const StyledContainer = styled.div`
  background-color: ${Colors['surface--status-critical--muted--default--alt']};
  border: 1px solid ${Colors['border--status-critical--muted']};
  border-radius: 8px;
  padding: 16px;
  line-height: 16px;
`;

const StyledTitleBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const StyledWarningIcon = styled(Icon).attrs({ type: 'WarningFilled' })`
  margin-right: 8px;
  color: ${Colors['text-icon--status-critical']};
`;

export default BlockedWarning;
