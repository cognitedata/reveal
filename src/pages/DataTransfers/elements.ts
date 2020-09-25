import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { Table } from 'antd';

export const TableActions = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .cogs-menu-item {
    text-transform: capitalize;
  }
`;

export const FiltersWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;

  > div {
    margin-right: 1rem;
  }

  .cogs-btn {
    min-width: 150px;
    height: 36px;
    display: flex;
    justify-content: space-between;
  }
`;

export const SecondaryFilters = styled.div`
  margin-left: auto;
  display: flex;

  > div {
    margin-right: 1rem;
  }
`;

export const DropdownLabel = styled.span`
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--cogs-greyscale-grey10);
  display: block;
  margin-bottom: 4px;
`;

export const ColumnsSelector = styled.div`
  margin-left: auto;

  > div {
    margin-top: 2rem;
  }
`;

export const ExpandRowIcon = styled(Icon)`
  cursor: pointer;
`;

export const RevisionContainer = styled.td`
  flex: 1;
`;

export const RevisionLabel = styled.div`
  font-size: 0.65rem;
`;

export const SubTable = styled(Table)`
  .ant-table {
    .ant-table-tbody .ant-table-row {
      background: #fafafa;

      .ant-table-cell {
        background: #fafafa;
        &:first-of-type {
          padding-left: 6px;
        }
        &:last-of-type {
          margin-left: auto;
          padding-right: 32px;
          text-align: right;
        }
      }
    }
  }
`;

export const StatusDot = styled.div<{ bgColor: string }>`
  border-radius: 50%;
  width: 0.7rem;
  height: 0.7rem;
  background-color: ${(props) => props.bgColor};
  margin: 0 auto;
`;
