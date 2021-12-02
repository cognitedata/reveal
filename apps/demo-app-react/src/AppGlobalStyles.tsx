import { createGlobalStyle } from 'styled-components/macro';

export const GlobalStyle = createGlobalStyle`
  html {
    font-size: 63.5%;
    background-color: #fff;
    height: 100vh;
  }

  body {
    display: flex;
    margin: 0;
    padding: 0;
    height: 100%;
  }

  * {
    box-sizing: border-box;
  }
`;
