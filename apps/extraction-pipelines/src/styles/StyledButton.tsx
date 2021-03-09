import styled from 'styled-components';
import { Button, Colors } from '@cognite/cogs.js';
import React from 'react';
import { DivFlexProps } from 'styles/flex/StyledFlex';
import { bottomSpacing } from 'styles/StyledVariables';

export const NoStyleBtn = styled((props) => (
  <Button variant="ghost" {...props}>
    {props.children}
  </Button>
))`
  &.cogs-btn-secondary {
    &.cogs-btn-ghost {
      padding: 0;
      &:hover,
      &:focus {
        background-color: ${Colors.white.hex()};
      }
    }
  }
`;

type ButtonPlacedProps = DivFlexProps & { mb?: number };
export const ButtonPlaced = styled(Button)`
  align-self: ${(props: ButtonPlacedProps) => props.self ?? 'flex-start'};
  margin-bottom: ${(props: ButtonPlacedProps) =>
    `${props.mb ? `${props.mb}rem` : bottomSpacing}`};
`;
