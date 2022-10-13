import { Body, Flex, Graphic, GraphicTypes, Title } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import Loading from './Loading';

export interface EmptyStateProps {
  title?: string;
  body?: string;
  graphic?: GraphicTypes;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  body,
  graphic,
  isLoading = false,
}) => {
  return (
    <EmptyStateWrapper justifyContent="center" alignItems="center">
      <Flex direction="column" gap={4} alignItems="center">
        {isLoading ? <Loading /> : <Graphic type={graphic || 'Search'} />}
        <Title level={2}>{title || 'No results available'}</Title>
        {body && <Body level={2}>{body}</Body>}
      </Flex>
    </EmptyStateWrapper>
  );
};

const EmptyStateWrapper = styled(Flex)`
  height: 100%;
`;
