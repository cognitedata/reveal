import styled from 'styled-components';

export const Container = styled.div`
  background: white;

  .ant-tabs-top > .ant-tabs-nav::before,
  .ant-tabs-bottom > .ant-tabs-nav::before,
  .ant-tabs-top > div > .ant-tabs-nav::before,
  .ant-tabs-bottom > div > .ant-tabs-nav::before {
    border-bottom-color: var(--cogs-greyscale-grey3);
  }

  .ant-tabs-nav {
    margin-bottom: 0;
  }
`;

export const ChartContainer = styled.div<{ xScroll: boolean }>`
  background: white;
  border: 1px solid var(--cogs-greyscale-grey3);
  border-top: 0;
  padding: 20px 8px 8px 8px;
  overflow-x: ${(props) => (props.xScroll ? 'scroll' : 'auto')};

  .empty-message {
    margin-bottom: 0.7rem;
    text-align: center;

    & > div {
      font-size: 0.8rem;
      padding: 0;
      margin: 0 auto;
    }

    .cogs-graphic {
      width: 65px !important;
    }
  }
`;

export const StatusText = styled.div`
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 10px;
  margin-left: 24px;
  margin-bottom: 16px;
`;

export const BarsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
`;

export const OnOfWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  flex-direction: column;
  margin-right: 8px;

  & > div {
    font-size: 10px;
    font-weight: 700;
    color: var(--cogs-greyscale-grey6);
    margin-top: auto;
    margin-bottom: 12px;
  }

  & > div:first-of-type {
    margin-top: 0;
    align-self: flex-start;
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  flex-direction: column;
`;

export const BarWrapper = styled.div`
  display: flex;
  padding: 0 8px;
  border: 1px solid #f0f0f0;
  height: 66px;
  margin-top: auto;
  margin-right: -1px;
  box-sizing: content-box;
`;

export const Bar = styled.div<{ isOn: boolean }>`
  height: ${(props) => (props.isOn ? '66px' : '6px')};
  width: 20px;
  background-color: var(--cogs-midblue-4);
  align-self: flex-end;
  justify-self: center;
  margin: auto auto 0 auto;
`;

export const DateItem = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: var(--cogs-greyscale-grey6);
  align-self: flex-end;
  width: 100%;
  text-align: center;
`;
