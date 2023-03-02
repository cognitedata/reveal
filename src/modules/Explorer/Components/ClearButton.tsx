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
    type="ghost-accent"
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
  margin-left: 5px;
`;
