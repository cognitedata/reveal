import React from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

export const InfoIcon = styled((props) => <Icon {...props} type="Info" />)`
  &.cogs-icon {
    svg {
      g {
        path {
          &:nth-child(2),
          &:nth-child(3) {
            fill: ${(props: { color?: string }) =>
              props.color ?? `${Colors['text-icon--interactive--default']}`};
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
            props.color ?? `${Colors['text-icon--interactive--default']}`};
          &:nth-child(3) {
            fill: ${Colors['decorative--grayscale--white']};
          }
        }
      }
    }
  }
`;
