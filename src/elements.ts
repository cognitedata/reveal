import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

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
  }
  .ant-table-column-sorters {
    text-transform: capitalize;
  }
`;

export const TableActions = styled.div`
  padding: 32px 16px;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  justify-content: flex-end;

  .cogs-menu-item {
    text-transform: capitalize;
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
