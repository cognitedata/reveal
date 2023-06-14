import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

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
      background-color: ${Colors['decorative--grayscale--300']};
    }
    &:first-child {
      border-top: 0.0625rem solid ${Colors['decorative--grayscale--300']};
    }
    border-bottom: 0.125rem solid ${Colors['decorative--grayscale--200']};
  }
  .row-style-even {
    @extend %row-style;
    &:nth-child(even) {
      background-color: ${Colors['decorative--grayscale--200']};
      &:hover {
        background-color: ${Colors['decorative--grayscale--300']};
      }
    }
  }
  .row-style-odd {
    @extend %row-style;
    &:nth-child(odd) {
      background-color: ${Colors['decorative--grayscale--200']};
      &:hover {
        background-color: ${Colors['decorative--grayscale--300']};
      }
    }
  }
  .row-height-4 {
    min-height: 4rem;
  }
`;
