import * as React from 'react';

import styled from 'styled-components/macro';

import { StyledTypography } from 'components/EmptyState/elements';

const Text = styled.span`
  text-align: center;
  transition: opacity 0.1s;
  width: 100%;
  position: absolute;
  white-space: nowrap;
  top: 0;
  left: 0;
`;

interface Props {
  text?: string;
}
export const MediumTitle: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  children,
}) => {
  return (
    <StyledTypography variant="h6" weight="semibold">
      <Text>{text || children}</Text>
    </StyledTypography>
  );
};
