import styled, { css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const ContentWrapper = styled.div<{ empty?: boolean }>`
  padding: 32px 48px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  ${({ empty }) =>
    empty &&
    css`
      text-align: center;
      justify-content: center;
    `}
`;

export const Filters = styled.div`
  margin-bottom: 24px;
`;

export const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 300px;

  > div {
    position: absolute;
  }
`;

export const TableContainer = styled.div<{ isLoading: boolean }>`
  flex-grow: 1;

  td {
    padding: 10px;
    display: flex;
    align-items: center;
  }
`;

export const StatusLabel = styled.div<{ approved: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;

  ${({ approved }) =>
    approved
      ? css`
          color: #22633c;
          background-color: rgba(24, 175, 142, 0.1); ;
        `
      : css`
          color: #b25c00;
          background-color: rgba(255, 187, 0, 0.14);
        `}
`;
