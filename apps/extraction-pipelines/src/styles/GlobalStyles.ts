import { createGlobalStyle } from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import theme from './theme';

const GlobalStyle = createGlobalStyle<{ theme: typeof theme }>`
  body {
    overflow-y: hidden;
  }

  .ant-input,
  .ant-tag {
    font-family: BlinkMacSystemFont,Arial,sans-serif;
  }

  .ant-form-explain-holder {
    display: none;
  }

  h1 {
    font-size: 1.75rem;
  }

  a {
    color: ${(props) => props.theme.actionText};
    :hover {
      color: ${(props) => props.theme.actionText};
    }
  }
  .ant-table {
    overflow: auto;
    background: white;
  }

  .antd-table table {
    min-width: 1100px;
  }
  .ant-btn-primary-disabled, .ant-btn-danger[disabled], .ant-btn-primary.disabled, .ant-btn-primary[disabled], .ant-btn-primary-disabled:focus, .ant-btn-primary.disabled:focus, .ant-btn-primary[disabled]:focus, .ant-btn-primary-disabled:active, .ant-btn-primary.disabled:active, .ant-btn-primary[disabled]:active, .ant-btn-primary-disabled.active, .ant-btn-primary.disabled.active, .ant-btn-primary[disabled].active{
    color : white;
  }

  .ant-select-dropdown-menu {
    margin-top: 0;
  }

  .integrations-ui-style-scope > div {
    overflow: visible;
  }

  .cogs-avatar {
    background: ${Colors['greyscale-grey4'].hex()} !important;
    border: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
    color: ${Colors['greyscale-grey7'].hex()} !important;
    font-weight: normal !important;
    &.bg-blue {
      background: ${Colors['midblue-3'].hex()} !important;
      color: ${Colors.white.hex()} !important;
    }
  }

`;

export default GlobalStyle;
