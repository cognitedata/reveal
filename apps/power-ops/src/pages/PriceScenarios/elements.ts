import styled from 'styled-components/macro';
import { Icon, Tabs } from '@cognite/cogs.js';
import { MainPanel } from 'pages/elements';
import layers from 'utils/zindex';

export const Main = styled(MainPanel)`
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
`;

export const GraphContainer = styled.div`
  position: relative;
  background: #fafafa;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  width: 100%;
  height: fit-content;
  padding: 24px 16px 0 16px;
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
  display: flex;
  flex-direction: column;
  text-align: left;
  overflow: hidden;
  &:hover {
    overflow: auto;
  }
  width: 100%;
  margin-top: 20px;

  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  thead {
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
`;
