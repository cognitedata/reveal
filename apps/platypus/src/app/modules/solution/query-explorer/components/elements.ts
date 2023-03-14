import styled from 'styled-components/macro';

export const QueryExplorerContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  .graphiql-container,
  .CodeMirror-info,
  .CodeMirror-lint-tooltip,
  reach-portal {
    /* Copied from light theme. I couldn't fix without important */
    --color-primary: 320, 95%, 43% !important;
    --color-secondary: 242, 51%, 61% !important;
    --color-tertiary: 188, 100%, 36% !important;
    --color-info: 208, 100%, 46% !important;
    --color-success: 158, 60%, 42% !important;
    --color-warning: 36, 100%, 41% !important;
    --color-error: 13, 93%, 58% !important;
    --color-neutral: 219, 28%, 32% !important;
    --color-base: 219, 28%, 100% !important;
    --alpha-secondary: 0.76 !important;
    --alpha-tertiary: 0.5 !important;
    --alpha-background-heavy: 0.15 !important;
    --alpha-background-medium: 0.1 !important;
    --alpha-background-light: 0.07 !important;
  }
  /* Hide this buttons, they don't provide any value to us but rather introduce bugs with styling */
  .graphiql-container .graphiql-sidebar .graphiql-sidebar-section:last-of-type {
    display: none;
  }
  .graphiql-container .graphiql-execute-button,
  .graphiql-container .graphiql-execute-button:focus {
    background-color: var(--cogs-primary) !important;
    outline: var(--cogs-primary) auto 1px;
  }

  & > .docExplorerWrap {
    .doc-explorer-title-bar {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      font-size: var(--cogs-b2-font-size);

      .doc-explorer-rhs {
        cursor: pointer;
      }
    }

    .doc-explorer-contents {
      overflow: scroll;

      .graphiql-explorer-root {
        flex-direction: column-reverse !important;
      }

      .graphiql-explorer-actions {
        border: none !important;

        select {
          margin: 0 10px;
        }

        .toolbar-button,
        select {
          cursor: pointer;
        }
      }

      .graphiql-operation-title-bar {
        input {
          width: auto !important;
          padding-top: 10px;
        }

        .toolbar-button {
          cursor: pointer;
          width: 20px !important;
          height: 20px !important;
          font-size: 20px !important;
        }
      }

      .graphiql-explorer-node {
        padding: 3px 0;
      }
    }
  }
`;
