import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

export const LoaderBg = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: var(--cogs-black);
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
`;

export const Layout = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row-reverse;
  background-color: var(--cogs-greyscale-grey2);
`;

export const Main = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  flex-grow: 1;
  overflow-y: scroll;
  position: relative;
`;

export const Content = styled.main`
  padding: 32px 48px;
`;

export const ContentContainer = styled.div`
  background-color: var(--cogs-white);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);
  margin-top: 16px;

  .ant-table .ant-table-thead tr th.ant-table-cell {
    background: #ffffff;
    text-transform: capitalize;
  }
  .ant-table-column-sorters {
    text-transform: capitalize;
  }
  .ant-pagination.ant-table-pagination {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .ant-table-empty
    .ant-table-thead
    > tr
    .ant-table-cell.ant-table-row-expand-icon-cell {
    border: none;
    padding: 0;
  }
`;

export const StatusIcon = styled(Icon)`
  display: flex;
  justify-content: center;
  & > svg {
    width: 8px;
    height: 8px;
  }
`;
