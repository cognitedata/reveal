import styled from 'styled-components/macro';

export const QueryExplorerContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

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
