import styled from 'styled-components';

import { Body, Flex, Heading } from '@cognite/cogs.js';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <SCContainer direction="column" gap={6}>
      <Heading level={3}>{title}</Heading>
      <Body size="medium">{subtitle}</Body>
    </SCContainer>
  );
};

const SCContainer = styled(Flex)`
  border-bottom: 1px solid var(--cogs-border--interactive--default);
  background: var(--cogs-surface--medium);
  padding: 2rem 4rem;
`;
