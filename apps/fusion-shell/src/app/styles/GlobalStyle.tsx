/* eslint-disable @cognite/no-number-z-index */
import { createGlobalStyle } from 'styled-components';

import { Modal } from 'antd';

import { Tooltip as CogsTooltip } from '@cognite/cogs.js';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import SourceCodeProVariable from '../../assets/SourceCodePro-VariableFontWeight.ttf';
import { getContainer } from '../utils/utils';
import { ZIndexLayer } from '../utils/zIndex';

CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: () => getContainer(),
};

Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

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
    src: url(${SourceCodeProVariable}) format('truetype');
    font-weight: 100 1000;
  }

  * {
    box-sizing: border-box;
  }

  .cdf-login-page-style-scope {
      z-index: 99;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 100%;
  }
`;

export default GlobalStyle;
