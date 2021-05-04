import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';

export const Header = styled.header`
  height: 60px;
  background: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  justify-content: ${(props: { inSearch: boolean }) =>
    props.inSearch ? 'flex-end' : 'space-between'};
  .actions {
    display: flex;
    margin-right: 24px;
    .cogs-btn {
      margin-left: 8px;
    }
  }
  .daterange {
    display: flex;
    justify-self: flex-start;
    padding: 0 24px;
    align-items: center;
  }
`;

export const TopPaneWrapper = styled.div`
  flex: 1 1 0%;
  /* left side shouldn't have scrollbars at all */
  overflow: hidden;
  height: 100%;
`;

export const BottomPaneWrapper = styled.div`
  /* overflow: auto; */
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
`;

export const ChartViewContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export const BottombarWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 56px;
  border-top: 1px solid var(--cogs-greyscale-grey4);
  background-color: var(--cogs-greyscale-grey1);
`;

export const BottombarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  border-left: 1px solid var(--cogs-greyscale-grey4);
  border-right: 1px solid var(--cogs-greyscale-grey4);
  background-color: ${(props: { isActive: boolean }) =>
    props.isActive ? 'var(--cogs-greyscale-grey3)' : 'none'};

  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: ${(props: { showSearch: boolean }) =>
    props.showSearch ? '70%' : '100%'};
`;

export const ToolbarIcon = styled(Icon)`
  width: 20px;
`;

export const ChartContainer = styled.div`
  position: relative;
  display: flex;
  height: 100%;
`;

export const SourceListWrapper = styled.div`
  flex-grow: 1;
  max-height: 100%;
  width: 300px;
  min-width: 300px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  overflow-y: scroll;
`;

export const SourcesTitle = styled.h2`
  text-align: center;
  margin: 15px;
`;

export const SourceList = styled.div`
  & > :first-child {
    border-top: 1px solid var(--cogs-greyscale-grey2);
  }
`;

export const SourceTableWrapper = styled.div`
  flex-grow: 1;
  max-height: 100%;
  min-width: 350px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  overflow-y: scroll;
`;

export const SourceTable = styled.table`
  border: 1px solid var(--cogs-greyscale-grey2);
  border-collapse: collapse;
  width: 100%;

  td,
  th {
    padding-left: 10px;
  }

  th {
    position: sticky;
    top: -1px;
    color: var(--cogs-greyscale-grey7);
    background-color: var(--cogs-greyscale-grey1);
    z-index: ${Layers.TABLE_HEADER};
    margin-bottom: -1px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  tbody > tr:hover {
    background: var(--cogs-greyscale-grey3);
  }
`;

export const TypeLabel = styled.td`
  color: var(--cogs-greyscale-grey7);
`;
export const SourceRow = styled.tr`
  background: ${(props: { isActive: boolean }) =>
    props.isActive ? 'var(--cogs-greyscale-grey3)' : 'none'};

  &&:nth-child(odd) {
    background: #ffffff;
  }
  &&:nth-child(even) {
    background: var(--cogs-greyscale-grey1);
  }
  &&:hover {
    background: var(--cogs-greyscale-grey3);
  }
`;

export const SourceCircle = styled.span`
  height: 20px;
  width: 20px;
  background-color: ${(props) => props.color || 'lightgreen'};
  margin: 20px;
  margin-left: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: ${(props: { fade?: boolean }) => (props.fade ? '0.2' : '1')};
`;

export const SourceSquare = styled.span`
  height: 20px;
  width: 20px;
  background-color: ${(props) => props.color || 'lightgreen'};
  margin: 20px;
  margin-left: 5px;
  flex-shrink: 0;
  opacity: ${(props: { fade?: boolean }) => (props.fade ? '0.2' : '1')};
`;

export const SourceItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 36px;
  text-overflow: ellipsis;
  cursor: pointer;

  opacity: ${(props: { isActive?: boolean; isDisabled?: boolean }) =>
    props.isDisabled ? 0.35 : 1};

  &:hover {
    & > :last-child {
      visibility: visible;
    }
  }
`;

export const SourceName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SourceDescription = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 240px;
`;

export const SourceTag = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 210px;
`;

export const SourceButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 30px;
`;

export const SourceMenu = styled.div`
  position: absolute;
  right: 0px;
  height: 100%;
  width: 30px;
  background-color: white;
  border-left: 1px solid var(--cogs-greyscale-grey2);
  visibility: hidden;

  &:hover {
    background-color: var(--cogs-greyscale-grey1);
  }

  & > span {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
`;

export const ChartWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;

  > div {
    height: 100%;
    width: 100%;
  }
`;

export const UnitMenuHeader = styled.div`
  word-break: break-word;
  text-transform: none;
  font-weight: 400;
  color: var(--cogs-greyscale-grey6);
`;

export const UnitMenuAside = styled.div`
  margin-left: 40px;
  position: relative;
  &:before {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -20px;
    width: 2px;
    background-color: var(--cogs-greyscale-grey3);
  }
`;
