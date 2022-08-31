import styled, { css } from 'styled-components';
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

export const Grid = styled.div`
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

export const GridRowStyle = styled(PaddedGridDiv)`
  grid-template-columns: 7rem 5rem 1.5fr 2fr 5rem 4rem;
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
  .cogs-switch {
    display: flex;
  }
`;

export const MainFullWidthGrid = styled.div<{ hideDividerLine?: boolean }>`
  grid-area: main;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  border-top: ${(props) => (props.hideDividerLine ? '0' : '1px')} solid #ccc;
`;

export const Span3 = css`
  grid-column: 1 / span 3;
`;
