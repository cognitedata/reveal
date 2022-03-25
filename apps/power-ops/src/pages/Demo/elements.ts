import styled from 'styled-components/macro';

export const Header = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: var(--cogs-greyscale-grey7);
  padding: 20px;
`;

export const StyledTable = styled.div`
  margin: 4vh 1.5vw;
  overflow: auto;
  min-height: 40vh;

  .cogs-table {
    font-family: 'Inter';
    font-style: normal;

    th {
      color: #333333;
      background: #f5f5f5;
      font-weight: 500;
      color: var(--cogs-b3-color);
      font-size: var(--cogs-b3-font-size);
      letter-spacing: var(--cogs-b3-letter-spacing);
      line-height: var(--cogs-b3-line-height);
    }

    .cogs-table-row {
      color: #595959;
      background: #fafafa;
      font-weight: 500;
      color: var(--cogs-b2-color);
      font-size: var(--cogs-b2-font-size);
      letter-spacing: var(--cogs-b2-letter-spacing);
      line-height: var(--cogs-b2-line-height);
      td {
        border-bottom: 0;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
`;

export const Frame = styled.div`
  margin: 24px;
  width: 100vw;
`;

export const StyledDiv = styled.div`
  width: 65vw;
  background: #fafafa;
  border-radius: 12px;
  padding-bottom: 16px;
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: inset 0px -1px 0px #e8e8e8;
  height: 72px;

  h1 {
    color: #333333;
    align-items: center;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.01em;
    margin: 0 16px;
  }

  .segmented-control {
    margin-left: auto;
  }

  .new {
    margin: 0 16px 0 18px;
  }
`;

export const StyledBidMatrix = styled.div`
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin: 16px 16px 0 16px;

  .cogs-table {
    font-family: 'Inter';
    font-style: normal;
    font-size: 12px;
    line-height: 16px;

    th {
      color: #333333;
      background: #f5f5f5;
      font-weight: 500;
      letter-spacing: -0.004em;
      .cogs-th-container {
        justify-content: center;
      }
    }

    .cogs-table-row {
      color: #595959;
      background: #fafafa;
      font-weight: normal;
      letter-spacing: -0.008em;
      td {
        text-align: center;
        border-bottom: 0;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
`;
