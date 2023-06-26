import React from 'react';

import styled from 'styled-components';

import { Body, Flex, Title } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { SearchEmpty } from '../Graphics';

import Loading from './Loading';

export interface EmptyStateProps {
  title?: string;
  body?: string;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  body,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <EmptyStateWrapper justifyContent="center" alignItems="center">
      <Flex direction="column" gap={8} alignItems="center">
        <GraphicWrapper>
          {isLoading ? <Loading /> : <SearchEmpty />}
        </GraphicWrapper>
        <Title level={5}>
          {title || isLoading
            ? t('LOADING', 'Loading...')
            : t('NO_RESULTS_AVAILABLE', 'No results available')}
        </Title>
        {body && <StyledBody level={2}>{body}</StyledBody>}
      </Flex>
    </EmptyStateWrapper>
  );
};

const EmptyStateWrapper = styled(Flex)`
  height: 100%;
`;
const GraphicWrapper = styled.div`
  padding-bottom: 8px;
`;
const StyledBody = styled(Body)`
  color: var(--cogs-text-icon--medium);
`;
