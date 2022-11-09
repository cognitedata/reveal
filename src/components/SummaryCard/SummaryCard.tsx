import React from 'react';

import styled from 'styled-components';
import { Button, Flex, Icon, IconType, Title } from '@cognite/cogs.js';
import noop from 'lodash/noop';
import { SummaryCardWrapper } from 'components/ReactTable/elements';

interface SummaryCardProps {
  icon?: IconType;
  title: string;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  children?: React.ReactElement;
}
export function SummaryCard({
  icon,
  title,
  onAllResultsClick = noop,
  children,
}: SummaryCardProps) {
  return (
    <SummaryCardWrapper>
      <StyledFlex justifyContent="space-between">
        <Flex alignItems="center" gap={8}>
          {icon && (
            <IconWrapper>
              <Icon type={icon} />
            </IconWrapper>
          )}
          <Title level={5}>{title}</Title>
        </Flex>
        <Button
          icon="ArrowRight"
          iconPlacement="right"
          onClick={onAllResultsClick}
        >
          {' '}
          All Results
        </Button>
      </StyledFlex>
      {children}
    </SummaryCardWrapper>
  );
}

const StyledFlex = styled(Flex)`
  border-bottom: 1px solid var(--cogs-border--muted);
  align-items: center;
  padding: 18px 16px;
`;
const IconWrapper = styled.div`
  padding: 12px;
  display: flex;
  background-color: var(--cogs-surface--status-success--muted--default);
  color: var(--cogs-text-icon--status-success);
  border-radius: 6px;
`;
