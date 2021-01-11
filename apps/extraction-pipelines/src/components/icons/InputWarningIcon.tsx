import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';
import React from 'react';

export const InputWarningIcon = styled((props) => (
  <Icon {...props} type="Warning" />
))`
  width: 1.2rem;
  svg {
    g {
      g:first-child {
        path {
          fill: ${(props) => props.$color};
        }
      }
      #Vector {
        path {
          fill: ${Colors.black.hex()};
        }
      }
    }
  }
`;
