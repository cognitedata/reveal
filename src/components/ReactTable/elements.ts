import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ContainerInside = styled.div`
  height: 100%;
  overflow-y: auto;
`;

export const TableContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 16px;
  padding-bottom: 0;
  height: 100%;
  flex-direction: column;
`;

export const ColumnSelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledTable = styled.div`
  color: var(--cogs-text-icon--medium);
  position: relative;
  width: 100%;
  /* To isolate the z-index to the scope of the table */
  isolation: isolate;
  & > div {
    min-width: 100%;
    width: fit-content;
  }
`;

export const ResizerWrapper = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  display: inline-block;
  width: 10px;
  height: 100%;

  touch-action: none;

  &:hover {
    border-right: 2px solid rgba(0, 0, 0, 0.1);
  }
  &.isResizing {
    border-right: 2px solid rgba(0, 0, 0, 0.3);
  }
`;

export const Th = styled.div`
  color: var(--cogs-text-color-secondary);
  font-weight: 500;
  padding: 8px 12px;
`;

export const StyledFlex = styled.div`
  margin-left: auto;
`;

export const Thead = styled.div<{ isStickyHeader?: boolean }>`
  position: ${({ isStickyHeader }) => (isStickyHeader ? 'sticky' : 'relative')};
  top: 0;
  background: white;
  z-index: 1;
`;

export const Tr = styled.div`
  color: inherit;
  border-bottom: 1px solid var(--cogs-border--muted);
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 48px;

  background: white;

  min-height: 42px;

  &:hover {
    background: var(--cogs-surface--interactive--hover);
    cursor: pointer;
  }

  &[data-selected='true'] {
    background: var(--cogs-surface--interactive--toggled-hover);
  }

  &:focus {
    outline: none;
    background-color: var(--cogs-surface--interactive--toggled-pressed);
  }

  ${Thead} &:hover {
    background: transparent;
    cursor: unset;
  }
`;
export const Td = styled.div`
  word-wrap: break-word;
  padding: 8px 12px;
  font-size: 14px;
`;

export const ThWrapper = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--cogs-text-icon--strong);
  gap: 10px;

  &:hover > ${ResizerWrapper} {
    border-right: 2px solid rgba(0, 0, 0, 0.1);
  }
`;

export const LoadMoreButtonWrapper = styled(Flex)`
  margin: 20px 0;
`;
