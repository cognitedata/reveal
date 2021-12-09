import styled from 'styled-components';

export const LineReviewHeaderWrapper = styled.div`
  width: 100%;
  height: 180px;
  border-bottom: 1px solid #e8e8e8;
  padding: 32px;
  display: flex;
  .back-button {
    margin-right: 16px;
  }
  .metadata {
    p {
      font-size: 16px;
    }
  }
  .actions {
    display: flex;
    flex-direction: column;
    margin-left: auto;
    > span {
      margin-top: 8px;
      font-size: 16px;
      opacity: 0.7;
    }
  }
`;
