import styled, { css } from 'styled-components';

export const PreviewContainer = styled.div<{ disableOverflow?: boolean }>`
  height: 140px;
  width: 300px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  ${({ disableOverflow }) =>
    !disableOverflow &&
    css`
      overflow: hidden;
    `}
`;
