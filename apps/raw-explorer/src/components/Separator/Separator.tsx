import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

export const Separator = styled((props) => (
  <div
    style={{
      backgroundColor: Colors['border--interactive--default'],
      width: '2px',
      height: '16px',
      ...(props.style ?? {}),
    }}
  />
))``;
