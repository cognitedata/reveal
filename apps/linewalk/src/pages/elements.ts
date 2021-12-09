import styled from 'styled-components';

export const LineReviewsWrapper = styled.div`
  .filters {
    width: 100%;
    display: flex;
    margin-bottom: 32px;
  }
  .cogs-select,
  .cogs-input {
    margin-right: 16px;
    width: 320px;
  }
`;

export const Stats = styled.div`
  width: 100%;
  height: 212px;
  background: #fafafa;
  display: flex;
  .stat {
    margin: auto;
    display: flex;
    padding: 8px;
    width: 320px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    height: 100px;
    .number {
      font-size: 32px;
      font-weight: bold;
      width: 80px;
      height: 100%;
      justify-content: center;
      align-items: center;
      display: flex;
      border-right: 1px solid rgba(0, 0, 0, 0.2);
    }
    .text {
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      padding-left: 16px;
    }
  }
`;
