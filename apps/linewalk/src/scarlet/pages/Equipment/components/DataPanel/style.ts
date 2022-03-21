import styled, { css } from 'styled-components';
import z from 'utils/z';

export const Container = styled.div`
  height: calc(100vh - 106px);
  position: relative;
`;

export const ListWrapper = styled.div<{ inactive: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 100%;
  overflow-x: hidden;

  ${({ inactive }) =>
    inactive &&
    css`
      overflow: hidden;
    `}
`;

export const List = styled.div`
  padding: 18px;
  height: 100%;
`;

export const Item = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: var(--cogs-white);
  z-index: ${z.LIST_TOOL_OVERLAY};
`;
