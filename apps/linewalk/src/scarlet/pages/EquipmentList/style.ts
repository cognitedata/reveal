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

export const Row = styled.div`
  background: red;
`;

export const TableContainer = styled.div`
  flex-grow: 1;
`;
