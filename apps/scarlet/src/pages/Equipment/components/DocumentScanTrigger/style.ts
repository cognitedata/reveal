import styled, { css } from 'styled-components';
import z from 'utils/z';

const containedStateCSS = css`
  display: flex;
  flex-direction: column;
  box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
  background: #f4f4f4;
  padding: 4px;
`;

export const Container = styled.div<{ contained: boolean }>`
  position: absolute;
  right: 18px;
  bottom: 16px;
  background: #ffffff;

  z-index: ${z.OVERLAY};

  ${({ contained }) => contained && containedStateCSS}
`;

export const Label = styled.span`
  text-align: center;
`;
