import styled from 'styled-components';

export const Container = styled.div`
  width: 280px;
  max-height: 100%;
  overflow-y: auto;
`;

export const Header = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px;

  .document-sidebar--title {
    user-select: all;
    margin-left: 8px;
    text-transform: uppercase;
    word-break: break-word;
  }
`;

export const Preview = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  .document-sidebar--preview-wrapper {
    width: 242px;
  }
`;

export const Actions = styled.section`
  padding: 17px 5px;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid var(--cogs-border-default);

  .sidebar-action-btn {
    margin-right: 4px;
  }

  .documents-sidebar--open-in-blueprint {
    width: 175px;
    margin-right: 10px;
  }
`;

export const DocumentDetailsContainer = styled.section`
  .sidebar-details-collapsable {
    .rc-collapse-content {
      overflow-y: auto;
      max-height: 50vh;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      margin-bottom: 5px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`;

export const Metadata = styled.section`
  padding: 25px 9px 9px 9px;

  & > div:nth-child(even) {
    background-color: var(--cogs-bg-accent);
  }
`;

export const MetadataItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px;

  span {
    max-width: 100px;
    white-space: break-word;
    text-overflow: ellipsis;
  }
`;
