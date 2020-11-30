import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import React from 'react';

export const EditStyleTable = styled.table`
  tbody {
    tr {
      &:first-child {
        td {
          border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
        }
      }
      td {
        height: 3.5rem;
        &:first-child {
          width: 18%;
        }
        &:last-child {
          min-width: 12rem;
          width: 22%;
        }
        &.name,
        &.email {
          width: 29%;
        }
      }
    }
  }
`;

export const StyledTable = styled.div`
  .cogs-table {
    border-spacing: 0;
    border-collapse: collapse;
    thead {
      tr {
        border-bottom: ${Colors['greyscale-grey3'].hex()};
        th {
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
        td {
          padding: 0.75rem;
          border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
        }
        &.parent-row {
          .timestamp-col {
            font-weight: bold;
          }
          .statusSeen-col {
            position: relative;
            .cogs-icon {
              position: absolute;
              right: 0;
              top: 0.9375rem;
            }
          }
        }
        &.child-row {
          .timestamp-col {
            padding-left: 1.5rem;
          }
        }
      }
    }
    th:first-child.timestamp-col {
      width: 11rem;
    }
    .status-col,
    .statusSeen-col {
      text-align: center;
    }
  }
`;

const StyledTableNoRowColor = styled((props) => (
  <StyledTable {...props}>{props.children}</StyledTable>
))`
  .cogs-table {
    thead {
      tr {
        th {
          background-color: white;
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
      }
    }
  }
`;

export default StyledTableNoRowColor;
