import React from 'react';

import styled from 'styled-components';

import {
  bottomSpacing,
  DivFlexProps,
} from '@extraction-pipelines/components/styled';
import { CLOSE, SAVE } from '@extraction-pipelines/utils/constants';

import { Button, Colors, ButtonProps } from '@cognite/cogs.js';

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

export const SaveButton = (props: ButtonProps) => (
  <Button type="primary" {...(props as any)} aria-label={SAVE} icon="Checkmark">
    {props.children}
  </Button>
);
export const CloseButton = (props: ButtonProps) => (
  <Button type="secondary" {...(props as any)} aria-label={CLOSE} icon="Close">
    {props.children}
  </Button>
);

type EditButtonProps = ButtonProps & {
  $full?: boolean;
  showPencilIcon: boolean;
};
export const EditButton = styled((props: EditButtonProps) => (
  <Button {...props} type="ghost" icon="Edit" iconPlacement="right">
    {props.children}
  </Button>
))`
  &.cogs-btn {
    &.cogs-btn-ghost {
      background: unset;
      width: ${(p) => (p.$full ? '100%' : 'max-content')};
      display: ${(p) => (p.$full ? 'grid' : 'flex')};
      grid-template-columns: ${(p) => (p.$full ? '1fr auto' : '1fr')};
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
        background-color: ${Colors['decorative--blue--700']};
        .cogs-icon {
          &.cogs-icon-Edit {
            opacity: ${(p) => (p.showPencilIcon ? '1' : '0')};
          }
        }
      }
    }
  }
`;
