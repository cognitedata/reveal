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
  %row-style {
    &:hover {
      background-color: ${Colors['greyscale-grey3'].hex()};
    }
    &:first-child {
      border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
    }
    border-bottom: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
  }
  .row-style-even {
    @extend %row-style;
    &:nth-child(even) {
      background-color: ${Colors['greyscale-grey2'].hex()};
      &:hover {
        background-color: ${Colors['greyscale-grey3'].hex()};
      }
    }
  }
  .row-style-odd {
    @extend %row-style;
    &:nth-child(odd) {
      background-color: ${Colors['greyscale-grey2'].hex()};
      &:hover {
        background-color: ${Colors['greyscale-grey3'].hex()};
      }
    }
  }
  .row-height-4 {
    min-height: 4rem;
  }
`;

export const GridWithTopMargin = styled((props) => (
  <Grid {...props}>{props.children}</Grid>
))`
  margin-top: 3rem;
`;

export const GridRowStyle = styled((props) => (
  <PaddedGridDiv {...props}>{props.children}</PaddedGridDiv>
))`
  grid-template-columns: 5rem 5rem 2fr 2fr 1.5rem 5rem 4rem;
  height: 4rem;
  align-items: center;
  span[aria-expanded] {
    align-self: center;
    display: flex;
    justify-content: center;
    button {
      width: 100%;
    }
  }
  &:hover {
    background-color: ${Colors['greyscale-grey3'].hex()};
  }
`;
