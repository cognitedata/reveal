import styled from 'styled-components';
import React from 'react';
import { Colors } from '@cognite/cogs.js';

export const PaddedGridDiv = styled.div`
  display: grid;
  grid-column-gap: 0.4rem;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  align-items: center;
`;
export const PaddedGridForm = styled.form`
  display: grid;
  grid-column-gap: 0.4rem;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  align-items: center;
`;

export const Grid = styled((props) => <div {...props}>{props.children}</div>)`
  display: grid;
  grid-template-columns: 1fr;
  .row-style-even {
    &:hover {
      background-color: ${Colors['greyscale-grey3'].hex()};
    }
    &:nth-child(even) {
      background-color: ${Colors['greyscale-grey2'].hex()};
      &:hover {
        background-color: ${Colors['greyscale-grey3'].hex()};
      }
    }
    &:first-child {
      border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
    }
    border-bottom: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
  }
`;

export const GridWithTopMargin = styled((props) => (
  <Grid {...props}>{props.children}</Grid>
))`
  margin-top: 3rem;
`;
