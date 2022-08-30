import { createGlobalStyle } from 'styled-components';
import { ids } from 'src/cogs-variables';
import theme from './theme';

const GlobalStyle = createGlobalStyle<{ theme: typeof theme }>`
  .${ids.styleScope} {
    font-family: Inter,BlinkMacSystemFont,Arial,sans-serif;
  }
  
  .ant-input,
  .ant-tag {
    font-family: BlinkMacSystemFont,Arial,sans-serif;
    background: transparent !important;
    border: 2px solid #D9D9D9 !important;
    border-radius: 6px !important;
  }
  .ant-input-disabled {
    background: var(--cogs-greyscale-grey2) !important;
    border: 2px solid #D9D9D9 !important;
    border-radius: 6px !important;
  }

  .ant-form-explain-holder {
    display: none;
  }

  h1 {
    font-size: 28px;
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

  .cdf-vision-subapp-style-scope .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #333333;
    text-shadow: 0 0 0.25px currentColor;
  }
  

  // TODO: [VIS-793] This can be removed when Cogs fix styles of Dropdown
  .cogs-tooltip {
    padding: 8px 8px;
  }
`;

export default GlobalStyle;
