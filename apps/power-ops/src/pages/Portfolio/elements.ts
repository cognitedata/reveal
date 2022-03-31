import styled from 'styled-components/macro';
import { BaseContainer } from 'pages/elements';
import { Input, Button } from '@cognite/cogs.js';

import BidmatrixTable from './GetBidmatrixTable';

export const Header = styled.span`
  display: flex;
  position: sticky;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: var(--cogs-bg-default);
  border-bottom: 1px solid var(--cogs-bg-control--disabled);

  p {
    color: var(--cogs-text-primary);
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.01em;
    margin: 0 0 4px 0;
  }

  Button {
    margin-left: auto;
  }

  &.top {
    top: 56px;
  }

  &.search {
    top: 0;
    position: sticky;
  }
`;

export const Container = styled(BaseContainer)`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;

export const LeftPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--cogs-bg-control--disabled);
  width: 280px;
`;

export const StyledSearch = styled(Input)`
  background: var(--cogs-bg-control--secondary);
  width: 100%;
  border: none;
  border-radius: 6px;
  color: var(--cogs-text-secondary);
  ::placeholder {
    color: var(--cogs-text-secondary);
  }
  .cogs-icon {
    color: rgba(0, 0, 0, 0.45);
  }
  .input-wrapper {
    width: 100%;
    .cogs-input {
      padding-right: 38px;
    }
  }
  .btn-reset {
    background: transparent;
  }
`;

export const PanelContent = styled.div`
  position: absolute;
  padding: 16px;
  max-height: calc(100% - 69px);
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StyledButton = styled(Button)`
  width: 100%;
  align-items: center;
  justify-content: left;
  font-weight: 600;
  font-family: Inter;
  margin-bottom: 8px;

  p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }
`;

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

    h1 {
      display: flex;
      color: var(--cogs-text-primary);
      text-align: left;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.01em;
      margin-bottom: 4px;
      p {
        margin: 0 4px 0 0;
      }
    }

    h2 {
      color: var(--cogs-text-secondary);
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: -0.008em;
      margin: 0;
      text-align: left;
    }
    .cogs-label {
      margin-left: 4px;
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
