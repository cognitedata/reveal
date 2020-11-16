import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

const Wrapper = styled.div`
  .cogs-table {
    border-spacing: 0;
    border-collapse: collapse;
    thead {
      tr {
        border-bottom: ${Colors['greyscale-grey3'].hex()};
        th {
          background-color: white;
          white-space: nowrap;
          &:last-child {
            width: 3rem;
          }
          &:first-child {
            width: 3rem;
          }
        }
      }
    }
    tbody {
      tr {
        &:nth-child(2n) {
          background-color: white;
          &:hover {
            background-color: ${Colors['greyscale-grey2'].hex()};
          }
        }
        &.row-active {
          background-color: ${Colors['midblue-7'].hex()};
          &:hover {
            background-color: ${Colors['greyscale-grey2'].hex()};
          }
        }
        td {
          padding: 0.75rem;
        }
      }
    }
    th:first-child.timestamp-col {
      width: 11rem;
    }
    .status-col,
    .statusSeen-col {
      text-align: center;
      .cogs-badge span {
        color: #fff;
      }
    }
  }
`;

export default Wrapper;
