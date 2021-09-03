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

type EditButtonProps = { $full: boolean; $isBottom: boolean };
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
      margin-bottom: ${(props: EditButtonProps) =>
        props.$isBottom ? '1rem' : '0'};
      text-align: left;
      word-break: break-word;
      .cogs-icon {
        &.cogs-icon-Edit {
          grid-column: 2;
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

export const SwitchButton = styled.button`
  width: 6rem;
  background: white;
  border: 0.125rem solid ${Colors.primary.hex()};
  border-radius: 0.2rem;
  padding: 0.4rem;
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
  .on,
  .off {
    margin: 1rem 0.3rem;
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
  }
  &[role='switch'][aria-checked='true'] {
    .on {
      background: ${Colors.primary.hex()};
      color: white;
    }
    .off {
      background: white;
      color: ${Colors.primary.hex()};
    }
  }
  &[role='switch'][aria-checked='false'] {
    .on {
      background: white;
      color: ${Colors.primary.hex()};
    }
    .off {
      background: ${Colors.primary.hex()};
      color: white;
    }
  }
`;
