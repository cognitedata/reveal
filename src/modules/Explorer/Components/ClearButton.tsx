import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ClearButton = ({
  disableClear,
  clear,
  children,
}: {
  disableClear: boolean;
  clear: () => void;
  children: string;
}) => (
  <StyledButton
    size="small"
    variant="default"
    type="link"
    onClick={(evt: any) => {
      evt.stopPropagation();
      clear();
    }}
    disabled={disableClear}
  >
    {children}
  </StyledButton>
);

const StyledButton = styled(Button)`
  font-size: 13px;
  background: none;
  &:hover {
    background: none;
  }
`;
