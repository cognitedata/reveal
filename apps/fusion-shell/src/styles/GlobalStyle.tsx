import { createGlobalStyle } from 'styled-components';

// import SourceCodeProVariable from '../assets/SourceCodePro-VariableFontWeight.ttf';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';

import { ZIndexLayer } from '../utils/zIndex';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    z-index: ${ZIndexLayer.Body};
  }

  body {
    margin: 0;
    padding: 0;
  }

  *, *:before, *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  @font-face {
    font-family: 'Source Code Pro';
    font-weight: 100 1000;
  }

  * {
    box-sizing: border-box;
  }
`;

// src: url(${SourceCodeProVariable}) format('truetype');
export default GlobalStyle;
