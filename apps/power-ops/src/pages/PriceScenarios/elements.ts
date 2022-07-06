import styled from 'styled-components/macro';
import { Icon, Tabs } from '@cognite/cogs.js';
import layers from 'utils/zindex';
import { MainPanel } from 'styles/layout';

export const Main = styled(MainPanel)`
  flex-direction: column;
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
`;

export const StyledTabs = styled(Tabs)`
  background: none;
  .rc-tabs-nav-list {
    margin: auto;
  }
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => props.color};
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
