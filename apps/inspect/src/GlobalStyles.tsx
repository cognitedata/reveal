import React from 'react';
import { createGlobalStyle } from 'styled-components/macro';

import { ThemeContext } from './pages/providers/ThemeProvider';

const GlobalStylesInternal = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "proxima-nova", sans-serif !important;
    color: ${(props) => (props.dark ? 'white' : 'black')};
    background-color: ${(props) => (props.dark ? 'black' : 'white')};
    transition: color 1s ease, background-color 0.5s ease-in-out;
    ${(props) =>
      props.dark
        ? `:root {
       --cogs-text-color : #ccc;
      --cogs-t2-color : lightgray;
      --cogs-t6-color : lightgray;
      --cogs-midblue-7 : #222;
      --our-bg-invert-color: #222;
    }`
        : ''}
  }
`;

export const GlobalStyles = () => {
  const { mode } = React.useContext(ThemeContext);
  return <GlobalStylesInternal dark={mode === 'dark'} />;
};
