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
  
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
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
  .ant-tabs-top > .ant-tabs-nav::before,
  .ant-tabs-bottom > .ant-tabs-nav::before,
  .ant-tabs-top > div > .ant-tabs-nav::before,
  .ant-tabs-bottom > div > .ant-tabs-nav::before {
    border-bottom-color: var(--cogs-greyscale-grey3);
  }
  .ant-tabs-tab {
    font-weight: 500;
    padding: 0 12px 12px 12px;

    .ant-tabs-tab-btn {
      color: var(--cogs-greyscale-grey8);

      &:focus {
        outline: 1px solid var(--cogs-midblue);
        color: var(--cogs-midblue);
      }
      &:focus:not(.focus-visible) {
        outline: none;
      }
    }

    &.ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: var(--cogs-black);
      }
    }
  }

  .ant-tabs-ink-bar {
    background: var(--cogs-midblue);
  }
`;
