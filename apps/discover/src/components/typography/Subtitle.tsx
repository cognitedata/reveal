import * as React from 'react';

import styled from 'styled-components/macro';

import { Detail } from '@cognite/cogs.js';

const StyledText = styled(Detail)`
  color: var(--cogs-text-secondary);
  display: block;
`;

export const Subtitle: React.FC = ({ children }) => {
  if (!children) {
    return null;
  }

  return <StyledText role="doc-subtitle">{children}</StyledText>;
};
