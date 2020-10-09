import { createGlobalStyle } from 'styled-components';

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
    background-color: var(--cogs-greyscale-grey3);
    color: var(--cogs-greyscale-grey9);
    
    .cogs-modal-footer-buttons {
    .cogs-btn.cogs-btn-secondary {
      display: none;
    }
  }
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: var(--cogs-midblue);
    border-color: var(--cogs-midblue);
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    background-color: var(--cogs-midblue-6);
    .ant-select-item-option-state {
      color: var(--cogs-midblue);
    }
  }
  .ant-select.ant-select-single {
    margin-top: 4px;
    
    .cogs-icon-Down {
      margin-top: -4px;
      color: var(--cogs-black);
    }
  }
  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    background-color: var(--cogs-greyscale-grey2);
    border-color: var(--cogs-greyscale-grey2);
    color: var(--cogs-black);
    border-radius: 4px;
    
    &:hover {
      border-color: var(--cogs-midblue);
    }
    
    .ant-select-selection-placeholder {
      color: var(--cogs-black);
    }
  }
  .ant-select-focused:not(.ant-select-disabled).ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    border-color: var(--cogs-midblue);
    box-shadow: 0 0 0 1px var(--cogs-midblue);
  }
`;
