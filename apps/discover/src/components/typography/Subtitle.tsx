import * as React from 'react';

import styled from 'styled-components/macro';

import { Detail } from '@cognite/cogs.js';

const StyledText = styled(Detail)`
  color: var(--cogs-text-secondary);
  display: block;
`;

interface Props {
  text: string;
}
export const Subtitle: React.FC<Props> = ({ text }) => {
  return <StyledText>{text}</StyledText>;
};
