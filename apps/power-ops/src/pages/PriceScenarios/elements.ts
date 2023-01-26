import styled from 'styled-components';
import { Tabs } from '@cognite/cogs.js-v9';
import layers from 'utils/zindex';

export const Main = styled.div`
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  &:hover {
    overflow: overlay;
  }
  padding: 0 16px 16px 0;
  border-left: 16px solid var(--cogs-bg-default);
`;

export const PriceScenariosContainer = styled.div`
  position: sticky;
  left: 0;
  background: #fafafa;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  width: 100%;
  height: fit-content;
  padding: 24px 16px 0 16px;
  margin-top: 16px;

  .cogs-tabs {
    background: none;
  }
`;

export const StyledTab = styled(Tabs.Tab)`
  .cogs-icon {
    color: ${(props) => props.theme.color};
  }
`;

const colWidth = 140;

export const StyledTable = styled.div`
  table {
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;

    font-family: 'Inter';
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;

    thead {
      border-top: 20px solid var(--cogs-bg-default);
      box-shadow: 0px 1px 0px #dcdcdc;
      position: sticky;
      top: 0;
      background: var(--cogs-bg-default);
      z-index: ${layers.MIDDLE};
      tr {
        align-items: center;
        th {
          padding-left: 16px;
          font-weight: 500;

          // First column
          &:first-child {
            max-width: 65px;
            height: 22px;
            background: var(--cogs-bg-default);
          }
        }
        // Main columns
        &:first-child {
          th {
            color: var(--cogs-text-primary);
            border-right: 1px solid var(--cogs-bg-control--disabled);

            &:not(:first-child) {
              max-width: ${colWidth * 2}px;
            }
          }
        }
        // Sub columns
        &:last-child {
          th {
            &:not(:first-child) {
              color: rgba(0, 0, 0, 0.7);
              font-weight: 400;
              font-size: 12px;
              max-width: ${colWidth}px;
            }

            &:nth-child(odd) {
              border-right: 1px solid var(--cogs-bg-control--disabled);
            }
          }
        }
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid var(--cogs-bg-control--disabled);
        td {
          display: flex;
          align-items: center;
          height: 44px;
          padding-left: 16px;

          // First column
          &:first-child {
            max-width: 65px;
            background: var(--cogs-bg-default);
          }

          &:not(:first-child) {
            max-width: ${colWidth}px;
          }

          // Shop matrix columns
          &:nth-child(odd) {
            border-right: 1px solid var(--cogs-bg-control--disabled);
          }
        }
      }
    }
  }
`;
