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

  // TODO: This can be removed when Cogs fix styles of Dropdown [CDS-1111](https://cognitedata.atlassian.net/browse/CDS-1111?atlOrigin=eyJpIjoiOTkyMDc2ZTIwMTlmNDJjY2E5MTlhYmYyODdjYzUzMmEiLCJwIjoiamlyYS1zbGFjay1pbnQifQ)
  .cogs-tooltip {
    padding: 8px 8px;
  }
`;

export default GlobalStyle;
