import { Colors, Icon } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const InfoIcon = styled((props) => <Icon {...props} type="Info" />)`
  &.cogs-icon {
    svg {
      g {
        path {
          &:nth-child(2),
          &:nth-child(3) {
            fill: ${(props: { color?: string }) =>
              props.color ?? `${Colors.primary.hex()}`};
          }
        }
      }
    }
  }
`;
export const IconFilled = styled((props) => <Icon {...props} />)`
  &.cogs-icon {
    svg {
      g {
        path {
          fill: ${(props: { color?: string }) =>
            props.color ?? `${Colors.primary.hex()}`};
          &:nth-child(3) {
            fill: ${Colors.white.hex()};
          }
        }
      }
    }
  }
`;
