import styled from 'styled-components';
import { Button, Colors } from '@cognite/cogs.js';
import { DivFlexProps } from 'styles/flex/StyledFlex';
import { bottomSpacing } from 'styles/StyledVariables';
import React from 'react';
import { CLOSE, SAVE } from 'utils/constants';

type ButtonPlacedProps = DivFlexProps & { mb?: number };
export const ButtonPlaced = styled(Button)`
  align-self: ${(props: ButtonPlacedProps) => props.self ?? 'flex-start'};
  margin-bottom: ${(props: ButtonPlacedProps) =>
    `${props.mb !== undefined ? `${props.mb}rem` : bottomSpacing}`};
`;

export const LinkWrapper = styled.div`
  grid-area: links;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 1.5rem 0;
  a,
  span {
    align-self: center;
    margin-right: 2rem;
  }
`;
export const SaveButton = styled((props) => (
  <Button type="tertiary" {...props} aria-label={SAVE} icon="Checkmark">
    {props.children}
  </Button>
))`
  margin: 0.125rem;
  color: ${Colors.primary.hex()};
  &:hover,
  :focus {
    color: ${Colors.primary.hex()};
  }
`;
export const CloseButton = styled((props) => (
  <Button type="tertiary" {...props} aria-label={CLOSE} icon="Close">
    {props.children}
  </Button>
))`
  margin: 0.125rem;
`;
type StyledEditProps = { $full: boolean };
export const StyledEdit = styled((props) => (
  <Button {...props} type="ghost" icon="Edit" iconPlacement="right">
    {props.children}
  </Button>
))`
  &.cogs-btn {
    &.cogs-btn-ghost {
      width: ${(props: StyledEditProps) =>
        props.$full ? '100%' : 'max-content'};
      display: ${(props: StyledEditProps) => (props.$full ? 'grid' : 'flex')};
      grid-template-columns: ${(props: StyledEditProps) =>
        props.$full ? 'auto 1fr 3rem ' : '1fr'};
      justify-items: flex-start;
      .cogs-icon {
        &.cogs-icon-Edit {
          margin-left: 2rem;
          opacity: 0;
        }
      }
      :hover {
        .cogs-icon {
          &.cogs-icon-Edit {
            opacity: 1;
          }
        }
      }
    }
  }
`;
