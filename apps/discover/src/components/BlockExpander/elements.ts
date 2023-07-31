import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
  color: var(--cogs-bg-status-small--normal-pressed);
  display: flex;
  align-items: center;
  max-width: 60px;
  justify-content: center;
  box-sizing: border-box;
  padding: ${sizes.normal};
`;

export const Container = styled.div`
  user-select: none;
  width: 100%;
  height: 100%;
  border: 2px dashed var(--cogs-bg-status-small--normal-pressed);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;

  span {
    transform: rotate(180deg);
    writing-mode: vertical-lr;
    font-size: 14px;
  }
`;
