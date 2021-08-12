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

  .cogs-table {
    th {
      background-color: white;
    }
  }
`;
