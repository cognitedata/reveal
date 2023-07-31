import { createGlobalStyle } from 'styled-components/macro';
import * as React from 'react';

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: Inter;
    font-weight: normal;
    font-style: normal;
  }

  #root {
    min-height: 100%;
  }

  #root * {
    font-family: 'Inter';
    font-feature-settings: 'ss04' on;
  }

  *:focus {
    outline: none;
  }
`;
export const decorators = [
  (Story) => (
    <>
      <GlobalStyles />
      <Story />
    </>
  ),
];
