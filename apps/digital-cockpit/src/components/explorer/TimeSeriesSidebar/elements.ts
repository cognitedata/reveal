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
  margin-bottom: 9px;

  .timeseries-sidebar--title {
    user-select: all;
    margin-left: 8px;
    text-transform: uppercase;
    word-break: break-word;
  }
`;

export const Preview = styled.section`
  background-color: var(--cogs-bg-accent);
  padding: 9px 14px;
`;

export const Actions = styled.section`
  padding: 14px 5px;
  display: flex;
  justify-content: space-around;

  .sidebar-action-btn {
    margin-right: 4px;
  }

  .timeseries-sidebar--open-in-charts {
    width: 175px;
    margin-right: 10px;
  }
`;

export const MetadataList = styled.section`
  border-top: 1px solid var(--cogs-border-default);

  & > div:nth-child(odd) {
    background-color: var(--cogs-bg-accent);
  }
`;

export const MetadataItem = styled.div`
  padding: 10px;
  word-break: break-all;
`;
