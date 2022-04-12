import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';
import { BidmatrixTable } from 'components/BidmatrixTable';

export const MainPanel = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 280px;
  right: 0;
  height: 100%;
  overflow: auto;
  padding: 16px 0 16px 16px;
`;

export const StyledDiv = styled.div`
  &.bidmatrix {
    width: calc(100% - 232px);
  }
  &.price-scenario {
    min-width: 200px;
    width: 200px;
  }
  background: var(--cogs-bg-accent);
  border-radius: 12px;
  padding-bottom: 16px;
  margin-right: 16px;
  height: fit-content;
`;

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  box-shadow: inset 0px -1px 0px var(--cogs-bg-control--disabled);
  margin: 0 16px;
  font-family: 'Inter';
  font-style: normal;
  height: 72px;
  overflow: hidden;

  div {
    display: flex;
    flex-direction: column;
    margin-right: auto;

    span {
      display: flex;
      text-align: left;
      margin-bottom: 4px;
    }

    .cogs-detail {
      color: var(--cogs-text-secondary);
      margin: 0;
      text-align: left;
    }

    .cogs-label {
      margin-left: 8px;
    }
  }
`;

export const StyledBidMatrix = styled.div`
  overflow: hidden;
  &:hover {
    overflow-x: auto;
  }
  box-shadow: 0 0 0 1px var(--cogs-bg-control--disabled);
  border-radius: 8px;
  margin: 16px 16px 0 16px;
`;

export const StyledTable = styled(BidmatrixTable)`
  width: 100%;
  font-family: 'Inter';
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  background: #f5f5f5;

  &.bidmatrix {
    text-align: left;

    thead {
      tr {
        border-top: none;

        th {
          padding: 4px;
          margin: 0 8px 0 8px;
          color: var(--cogs-text-primary);
          font-weight: 500;
          letter-spacing: -0.004em;
          max-width: 60px;
          min-width: 60px;
          width: 60px;

          &:first-child {
            margin: 0 8px 0 0;
            text-align: center;
            background: #f5f5f5;
            box-shadow: inset 1px 1px 0 var(--cogs-bg-control--disabled),
              inset -2px 0 0 var(--cogs-bg-control--disabled);
            border-radius: 8px 0 0 0;
          }
        }
      }
    }

    tbody {
      tr {
        color: var(--cogs-text-secondary);
        border-top: 1px solid var(--cogs-bg-control--disabled);
        background: var(--cogs-bg-accent);
        font-weight: normal;
        letter-spacing: -0.008em;

        td {
          padding: 4px;
          margin: 0 8px 0 8px;
          max-width: 60px;
          min-width: 60px;
          width: 60px;

          &:first-child {
            margin: 0 8px 0 0;
            text-align: center;
            background: #f5f5f5;
            box-shadow: inset -2px 0 0 var(--cogs-bg-control--disabled),
              inset 1px 0 0 var(--cogs-bg-control--disabled);
          }
        }

        &:last-child {
          td:first-child {
            box-shadow: inset 1px -1px 0 var(--cogs-bg-control--disabled),
              inset -2px 0 0 var(--cogs-bg-control--disabled);
            border-radius: 0 0 0 8px;
          }
        }

        &:hover {
          background: rgba(34, 42, 83, 0.06);
        }
      }
    }
  }

  &.price-scenario {
    table-layout: fixed;
    text-align: right;

    thead {
      width: 100%;
      tr {
        padding-right: 16px;
        th {
          padding: 4px;
          color: var(--cogs-text-primary);
          font-weight: 500;
          letter-spacing: -0.004em;

          &:first-child {
            max-width: 60%;
          }
          &:last-child {
            max-width: 40%;
          }
        }
      }
    }

    tbody {
      width: 100%;
      tr {
        padding-right: 16px;
        color: var(--cogs-text-secondary);
        border-top: 1px solid var(--cogs-bg-control--disabled);
        font-weight: normal;
        letter-spacing: -0.008em;

        td {
          padding: 4px;

          &:first-child {
            max-width: 60%;
          }

          &:last-child {
            max-width: 40%;
          }
        }

        &:last-child {
          color: var(--cogs-text-primary);
          font-weight: 500;
        }
      }
    }
  }
`;

export const StyledTitle = styled(Title)`
  font-family: 'Inter';
`;
