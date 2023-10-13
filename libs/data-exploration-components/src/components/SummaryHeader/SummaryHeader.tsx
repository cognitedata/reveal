import React from 'react';

import styled from 'styled-components';

import { VerticalDivider } from '@data-exploration/components';
import noop from 'lodash/noop';

import { Button, Flex, Icon, IconType, Title } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

interface SummaryHeaderProps {
  icon?: IconType;
  title: string;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}
export function SummaryHeader({
  icon,
  title,
  onAllResultsClick = noop,
}: SummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <StyledFlex justifyContent="space-between">
      <Flex alignItems="center" gap={8}>
        {icon && (
          <IconWrapper>
            <Icon type={icon} />
          </IconWrapper>
        )}
        <Title level={5}>{title}</Title>
      </Flex>
      <Flex alignItems="center" gap={10}>
        <Button
          icon="ArrowRight"
          iconPlacement="right"
          onClick={onAllResultsClick}
        >
          {' '}
          {t('ALL_RESULTS', 'All results')}
        </Button>
        <VerticalDivider />
      </Flex>
    </StyledFlex>
  );
}

const StyledFlex = styled(Flex)`
  align-items: center;
  flex: 1;
`;
const IconWrapper = styled.div`
  padding: 12px;
  display: flex;
  background-color: var(--cogs-surface--status-success--muted--default);
  color: var(--cogs-text-icon--status-success);
  border-radius: 6px;
`;