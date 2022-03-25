import styled from 'styled-components/macro';
import { BaseContainer } from 'pages/elements';
import { Input, Button } from '@cognite/cogs.js';

export const Container = styled(BaseContainer)`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;

export const Header = styled.span`
  display: flex;
  position: sticky;
  padding: 16px;
  text-align: left;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;

  p {
    color: #333333;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.01em;
    margin: 0;
  }

  Button {
    margin-left: auto;
  }

  &.top {
    top: 56px;
  }
`;

export const StyledDiv = styled.div`
  width: 65vw;
  background: #fafafa;
  border-radius: 12px;
  padding-bottom: 16px;
  margin: 16px;
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  justify-content: center;
  box-shadow: inset 0px -1px 0px #e8e8e8;
  height: 72px;
  font-family: 'Inter';
  font-style: normal;
  margin: 0 16px;

  h1 {
    color: #333333;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }

  h2 {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: -0.008em;
    margin: 0;
  }

  .segmented-control {
    margin-left: auto;
  }

  .new {
    margin: 0 16px 0 18px;
  }
`;

export const StyledBidMatrix = styled.div`
  overflow: hidden;
  &:hover {
    overflow-x: auto;
  }
  box-shadow: 0 0 0 1px #e8e8e8;
  border-radius: 8px;
  margin: 16px 16px 0 16px;
`;

export const StyledBidMatrixTable = styled.table`
  width: 100%;
  font-family: 'Inter';
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  text-align: left;

  thead {
    tr {
      border-top: none;
      background: #f5f5f5;

      th {
        padding: 4px;
        margin: 0 8px 0 8px;
        color: #333333;
        font-weight: 500;
        letter-spacing: -0.004em;
        max-width: 60px;
        min-width: 60px;
        width: 60px;

        &:first-child {
          margin: 0 8px 0 0;
          text-align: center;
          background: #f5f5f5;
          box-shadow: inset 1px 1px 0 #e8e8e8, inset -2px 0 0 #e8e8e8;
          border-radius: 8px 0 0 0;
        }
      }
    }
  }

  tbody {
    tr {
      color: #595959;
      border-top: 1px solid #e8e8e8;
      background: #fafafa;
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
          box-shadow: inset -2px 0 0 #e8e8e8, inset 1px 0 0 #e8e8e8;
        }
      }

      &:last-child {
        td:first-child {
          box-shadow: inset 1px -1px 0 #e8e8e8, inset -2px 0 0 #e8e8e8;
          border-radius: 0 0 0 8px;
        }
      }

      &:hover {
        background: rgba(34, 42, 83, 0.06);
      }
    }
  }
`;

export const PanelContent = styled.div`
  position: absolute;
  padding: 16px;
  max-height: 100%;
  width: 100%;
  overflow-x: hidden;
`;

export const LeftPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-right: 1px solid #e8e8e8;
  width: 280px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const MainPanel = styled.div`
  position: absolute;
  top: 0;
  left: 280px;
  right: 0;
  height: 100%;
  overflow: auto;
`;

export const StyledSearch = styled(Input)`
  background: #f1f1f1;
  width: 100%;
  border: none;
  border-radius: 6px;
  color: rgba(89, 89, 89, 1);
  ::placeholder {
    color: rgba(89, 89, 89, 1);
  }
  .cogs-icon {
    color: rgba(0, 0, 0, 0.45);
  }
  .input-wrapper {
    width: 100%;
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
