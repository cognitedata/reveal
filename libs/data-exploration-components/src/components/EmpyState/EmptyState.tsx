import { Body, Flex, Illustrations, Title } from '@cognite/cogs.js';
import { SearchEmpty } from '@data-exploration-components/graphics';

import React from 'react';
import styled from 'styled-components';
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
  return (
    <EmptyStateWrapper justifyContent="center" alignItems="center">
      <Flex direction="column" gap={8} alignItems="center">
        <GraphicWrapper>
          {isLoading ? <Loading /> : <SearchEmpty />}
        </GraphicWrapper>
        <Title level={5}>
          {title || isLoading ? 'Loading...' : 'No results available'}
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
