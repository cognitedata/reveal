import styled from 'styled-components';
import { Button, Icon } from '@cognite/cogs.js';
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

  .cogs-btn {
    color: var(--cogs-black);
  }
`;

export const FiltersWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;

  > div {
    margin-right: 1rem;
  }

  > span {
    align-self: flex-end;
  }

  .cogs-btn {
    min-width: 150px;
    height: 36px;
    display: flex;
    justify-content: space-between;
  }
`;

export const StartContainer = styled.div`
  display: flex;
  align-items: center;

  > span {
    margin: 0 1rem;
    font-weight: 500;
  }
`;

export const BackButton = styled(Button)`
  align-self: flex-end;
  min-width: 0 !important;
  margin-right: 1rem;
`;

export const SecondaryFilters = styled.div`
  display: flex;
  margin-top: 1rem;

  > div {
    margin-right: 1rem;
  }

  @media screen and (min-width: 1285px) {
    margin-top: 0;
    margin-left: auto;
  }

  .cogs-input-container {
    &.input-visible {
      opacity: 1;
    }
    &.input-hidden {
      opacity: 0;
    }
    .title {
      font-size: 0.88rem;
      line-height: 1.4rem;
      font-weight: 500;
      color: var(--cogs-greyscale-grey10);
      display: block;
      margin-bottom: 4px;
    }
  }
`;

export const CalendarWrapper = styled.div`
  margin-top: -2.55rem;

  .ant-picker {
    border-color: #a3a3a3;

    .ant-picker-input > input::placeholder {
      color: #a3a3a3;
    }
  }

  .close-button {
    justify-self: flex-end;
    margin-left: auto;
    margin-top: 8px;
    min-width: 0;
  }
`;

export const CalendarBtnWrapper = styled.div<{ active: boolean }>`
  color: ${(props) =>
    props.active ? 'var(--cogs-midblue)' : 'var(--cogs--black)'};

  .cogs-btn {
    min-width: 0;
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
  align-self: flex-end;
  margin-bottom: 0.3rem;

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

export const DetailViewWrapper = styled.div`
  .cogs-modal-footer-buttons {
    .cogs-btn.cogs-btn-secondary {
      display: none;
    }
  }
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
