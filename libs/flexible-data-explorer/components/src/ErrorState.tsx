import * as React from 'react';

import styled from 'styled-components/macro';

import { EmptyState as CogsEmptyState } from '@cognite/cogs.js';

interface Props {
  title: string;
  body: string;
  centerVertically?: boolean;
}

export const ErrorState: React.FC<Props> = ({
  title,
  body,
  centerVertically,
}) => {
  return (
    <Container center={centerVertically}>
      <CogsEmptyState
        illustration="EmptyStateSearchSad"
        illustrationProminence="muted"
        illustrationColor="red"
        title={title}
        body={body}
        href=""
        target="_self"
      />
    </Container>
  );
};

const Container = styled.div<{ center?: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: ${({ center }) => (center ? 'center' : 'initial')};
`;
