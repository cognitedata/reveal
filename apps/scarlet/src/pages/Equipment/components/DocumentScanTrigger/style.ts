import styled, { css } from 'styled-components';
import z from 'utils/z';

const pendingStateCSS = css`
  display: flex;
  flex-direction: column;
  box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
  background: #f4f4f4;
  padding: 4px;
`;

export const Container = styled.div<{ pending: boolean }>`
  position: absolute;
  right: 18px;
  bottom: 16px;
  background: #ffffff;

  z-index: ${z.OVERLAY};

  ${({ pending }) => pending && pendingStateCSS}
`;

export const PendingLabel = styled.span`
  text-align: center;
  padding: 5px;
`;
