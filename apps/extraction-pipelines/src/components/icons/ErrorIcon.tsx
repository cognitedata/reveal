import React from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

interface ErrorIconProps {
  width: string;
}

export const ErrorIcon = styled((props) => <Icon {...props} type="Error" />)`
  width: ${(props: ErrorIconProps) => props.width || '1.5rem'};
  svg {
    path {
      &:nth-child(2),
      &:nth-child(3) {
        fill: red;
      }
    }
  }
`;
