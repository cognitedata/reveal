import { Dropdown } from '@cognite/cogs.js';
import { Alert } from 'antd';
import styled from 'styled-components/macro';

export const Header = styled.header`
  min-height: 56px;
  max-height: 56px;
  height: 56px;
  background: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  width: ${(props: { showSearch: boolean }) =>
    props.showSearch ? '70%' : '100%'};
  min-width: ${(props: { showSearch: boolean }) =>
    props.showSearch ? '650px' : '900px'};
`;

export const ChartContainer = styled.div`
  position: relative;
  display: flex;
  height: 100%;
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

export const DropdownWithoutMaxWidth = styled(Dropdown)`
  &.tippy-box {
    max-width: none !important;
  }
`;

export const WarningAlert = styled(Alert)`
  .ant-alert-message {
    color: var(--cogs-text-warning);
  }
`;

export const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin-left: 10px;
`;

export const DropdownTitle = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 12px;
  margin-bottom: 15px;
`;

export const DropdownWrapper = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

export const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

export const RangeColumn = styled.div`
  margin: 2px 6px;
`;

export const MenuItemText = styled.div`
  padding-right: 10px;
`;
