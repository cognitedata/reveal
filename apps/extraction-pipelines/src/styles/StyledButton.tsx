import React from 'react';
import styled from 'styled-components';
import { Button, Colors } from '@cognite/cogs.js';
import { DivFlexProps } from 'styles/flex/StyledFlex';
import { bottomSpacing } from 'styles/StyledVariables';
import { CLOSE, SAVE } from 'utils/constants';

type ButtonPlacedProps = DivFlexProps & { marginbottom?: number };
export const ButtonPlaced = styled(Button)`
  align-self: ${(props: ButtonPlacedProps) => props.self ?? 'flex-start'};
  margin-bottom: ${(props: ButtonPlacedProps) =>
    `${
      props.marginbottom !== undefined
        ? `${props.marginbottom}rem`
        : bottomSpacing
    }`};
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

type EditButtonProps = { $full: boolean };
export const EditButton = styled((props) => (
  <Button {...props} type="ghost" icon="Edit" iconPlacement="right">
    {props.children}
  </Button>
))`
  &.cogs-btn {
    &.cogs-btn-ghost {
      background: unset;
      width: ${(props: EditButtonProps) =>
        props.$full ? '100%' : 'max-content'};
      display: ${(props: EditButtonProps) => (props.$full ? 'grid' : 'flex')};
      grid-template-columns: ${(props: EditButtonProps) =>
        props.$full ? '1fr auto' : '1fr'};
      grid-template-rows: auto;
      justify-items: flex-start;
      height: fit-content;
      text-align: left;
      word-break: break-word;
      .cogs-icon {
        &.cogs-icon-Edit {
          grid-column: 2;
          opacity: 0;
        }
      }
      :hover {
        background-color: ${Colors['midblue-7'].hex()};
        .cogs-icon {
          &.cogs-icon-Edit {
            opacity: 1;
          }
        }
      }
    }
  }
`;
