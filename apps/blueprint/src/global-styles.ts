import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "proxima-nova", sans-serif !important;
  }

  .cogs-drawer-title {
    white-space: pre-wrap;
    word-wrap: break-word;
    width: 100%;
    padding-right: 32px;
  }

  .cogs-drawer-close {
    position: absolute;
    right: 16px;
  }

  .drawer-content-wrapper {
    border: 1px solid var(--cogs-greyscale-grey4);
  }
`;
