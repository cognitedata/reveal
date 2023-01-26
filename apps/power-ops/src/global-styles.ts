import { createGlobalStyle } from 'styled-components';
import layers from 'utils/zindex';
import '@cognite/cogs.js-v9/dist/cogs.css';

export default createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "proxima-nova", sans-serif !important;

    // Keep the tabs dropdown in front of all other elements
    .rc-tabs-dropdown:not(.rc-tabs-dropdown-hidden) {
      z-index: ${layers.MAXIMUM}
    }

    .cogs.cogs-modal {
      font-family: 'Inter';
      margin: calc((100vh) / 2) auto;
      transform: translateY(-50%);

      .cogs-modal-header {
        border: none;
        height: initial;
        padding: 0 60px 14px 0;
      }

      .cogs-modal-close-button {
        padding: 4px 10px 10px;
      }

      .cogs-modal__content {
        padding: 0;
      }

      .cogs-modal-footer {
        border: none;
        padding: 22px 0 0 0;
      }
    }
  }
  #root {
    height: 100%;
  }
`;
