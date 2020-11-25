import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Header = styled.header`
  background: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  hgroup {
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    h1,
    h4 {
      padding: 0;
      margin: 0;
      text-align: left;
    }
    h4 {
      color: var(--cogs-greyscale-grey5);
    }
  }
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
`;

export const ToolbarWrapper = styled.div`
  min-width: 56px;
  width: 56px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  background-color: var(--cogs-greyscale-grey1);
`;

export const ToolbarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  cursor: pointer;

  &:hover {
    background-color: var(--cogs-greyscale-grey3);
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: 100%;
`;

export const ToolbarIcon = styled(Icon)`
  width: 20px;
`;

export const ChartContainer = styled.div`
  display: flex;
  height: 100%;
`;

export const SourceListWrapper = styled.div`
  max-height: 100%;
  width: 300px;
  border-right: 1px solid var(--cogs-greyscale-grey4);
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

export const SourceCircle = styled.span`
  height: 20px;
  width: 20px;
  background-color: ${(props) => props.color || 'lightgreen'};
  margin: 20px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const SourceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 50px;
  border-bottom: 1px solid var(--cogs-greyscale-grey2);
  cursor: pointer;

  &:hover {
    background-color: var(--cogs-greyscale-grey1);
  }
`;

export const SourceButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 30px;
`;

export const ChartWrapper = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;

  > div {
    height: 100%;
    width: 100%;

    > .highcharts-container {
      height: 100%;
      width: 100%;
    }
  }
`;
