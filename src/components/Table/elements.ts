import { Detail, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

const defaultRowHeight = '48px';

export const SummaryCardWrapper = styled.div`
  border-radius: 8px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--cogs-border--muted);
  display: flex;
  flex-direction: column;

  background-color: var(--cogs-surface--medium);
`;

export const ContainerInside = styled.div`
  height: 100%;
  overflow-y: auto;
  scroll-margin-top: ${defaultRowHeight};
  ${SummaryCardWrapper} & {
    height: unset;
  }
`;

export const TableContainer = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 0;
  height: 100%;
  flex-direction: column;
`;

export const ColumnSelectorWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  padding-bottom: 8px;
`;

export const SubTableWrapper = styled.span`
  padding: 0 16px;
`;

export const StyledTable = styled.div`
  color: var(--cogs-text-icon--medium);
  position: relative;
  width: 100%;
  background: white;
  /* To isolate the z-index to the scope of the table */
  isolation: isolate;
  & > div {
    min-width: 100%;
    width: fit-content;
  }

  ${SummaryCardWrapper} & {
    background-color: var(--cogs-surface--medium);
    & > div {
      max-width: 100%;
    }
  }
`;

export const ResizerWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: rgba(0, 0, 0, 0.2);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  opacity: 0;

  &.isResizing {
    opacity: 1;
    background: rgba(0, 0, 0, 0.3);
    cursor: col-resize;
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
  background: inherit;
  z-index: 1;
  height: ${defaultRowHeight};
`;

export const Tr = styled.div`
  color: inherit;
  border-bottom: 1px solid var(--cogs-border--muted);
  display: flex;
  width: 100%;
  align-items: center;
  height: 100%;
  min-height: ${defaultRowHeight};
  padding: 0 8px;

  background: inherit;

  &.selected {
    background-color: var(--cogs-surface--interactive--toggled-pressed);

    &:hover {
      background-color: var(--cogs-surface--interactive--toggled-pressed);
    }

    &:focus {
      background-color: var(--cogs-surface--interactive--toggled-pressed);
    }
  }

  &:hover {
    background: var(--cogs-surface--interactive--hover);
    cursor: pointer;
  }

  &[data-selected='true'] {
    background: var(--cogs-surface--interactive--toggled-hover);
  }

  &:focus {
    outline: none;
    background: var(--cogs-surface--interactive--hover);
  }

  ${Thead} &:hover {
    background: transparent;
    cursor: unset;
  }
`;

export const Tbody = styled.div`
  ${Tr} {
    &:last-child {
      border: none;
    }
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
  position: relative;

  &:hover {
    .resizer {
      opacity: 1;
    }
  }
`;

export const LoadMoreButtonWrapper = styled(Flex)`
  margin: 20px 0;
`;

export const MetadataHeaderText = styled(Detail)`
  font-weight: 400 !important;
  color: var(--cogs-text-icon--muted) !important;
`;
