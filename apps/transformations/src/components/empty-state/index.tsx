import styled from 'styled-components';

import { Body, Colors, Title } from '@cognite/cogs.js';

type EmptyStateProps = {
  className?: string;
  description: string;
  title?: string;
};

const EmptyState = ({
  className,
  description,
  title,
}: EmptyStateProps): JSX.Element => {
  return (
    <StyledEmptyStateContainer className={className}>
      {title && <Title level={6}>{title}</Title>}
      <StyledEmptyStateBody level={2}>{description}</StyledEmptyStateBody>
    </StyledEmptyStateContainer>
  );
};

const StyledEmptyStateContainer = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 8px;
  height: fit-content;
  padding: 12px;
  width: 100%;
`;

const StyledEmptyStateBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

export default EmptyState;
