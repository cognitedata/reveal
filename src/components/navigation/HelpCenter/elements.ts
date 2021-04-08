import styled from 'styled-components/macro';

export const HelpCenterBase = styled.div`
  .drawer-right.drawer-open .drawer-content-wrapper {
    box-shadow: none;
  }
  .drawer-content-wrapper {
    background-color: #fafafa;
    border-left: 1px solid #e8e8e8;
    .cogs-drawer-content {
      height: calc(100vh - 56px);
      .help-center-content {
        height: calc(100vh - 116px);
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        .documentation-header {
          margin-top: 4px;
        }
        .documentation-link {
          text-align: start;
        }
      }
    }
  }
`;
