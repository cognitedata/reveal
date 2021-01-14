import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "Inter", sans-serif !important;
  }
`;
