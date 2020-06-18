import { createGlobalStyle } from 'styled-components';

export const colors = {
  grey4: '#d9d9d9',
  grey5: '#bfbfbf',
  grey7: '#595959',
  grey8: '#404040',
  grey9: '#333333',
  grey10: '#262626',
  mainBackground: '#e7e2e2',
  midBlue: '#4a67fb',
};

export default createGlobalStyle`
  * {
    margin: 0;
  }
  #root {
    height: 100%;
  }
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "Inter", sans-serif !important;
    overflow: hidden;
    color: ${colors.grey9};
  }
`;
