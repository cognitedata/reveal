import styled from 'styled-components';

export const Container = styled.div`
  width: 280px;
`;

export const Header = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px;

  .document-sidebar--title {
    margin-left: 8px;
    text-transform: uppercase;
    word-break: break-word;
  }
`;

export const Preview = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;

  .document-sidebar--preview-wrapper {
    width: 242px;
  }
`;

export const Actions = styled.section`
  padding: 17px 5px;
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid var(--cogs-border-default);

  .documents-sidebar--open-in-blueprint {
    width: 175px;
    margin-right: 10px;
  }
`;

export const Metadata = styled.section`
  padding: 25px 9px 9px 9px;

  .documents-sidebar--details {
    margin-bottom: 12px;
  }

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
