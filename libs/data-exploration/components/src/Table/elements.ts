import styled, { css } from 'styled-components';

import { Detail, Flex, Chip, Body, BodyProps } from '@cognite/cogs.js';

import { zIndex } from '@data-exploration-lib/core';

const defaultRowHeight = '48px';
const defaultExtraRowHeight = '24px';

export const SummaryCardWrapper = styled.div`
  border-radius: 8px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--cogs-border--muted);
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;

  background-color: var(--cogs-surface--medium);
`;

export const ContainerInside = styled.div<{ isBulkActionBarVisible?: boolean }>`
  height: 100%;
  overflow-y: auto;
  scroll-margin-top: ${defaultRowHeight};
  ${SummaryCardWrapper} & {
    height: unset;
  }
  padding-bottom: ${({ isBulkActionBarVisible }) =>
    isBulkActionBarVisible && '70px'};
`;

export const TableContainer = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 0;
  height: 100%;
  flex-direction: column;
`;

export const Thead = styled.div<{ isStickyHeader?: boolean }>`
  position: ${({ isStickyHeader }) => (isStickyHeader ? 'sticky' : 'relative')};
  top: 0;
  background: inherit;
  isolation: isolate;
  z-index: ${({ isStickyHeader }) =>
    isStickyHeader ? zIndex.DRAWER : zIndex.MINIMUM};
  height: ${defaultRowHeight};
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
  background-color: white;
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
  .sticky-column {
    position: sticky;
    top: 0;
    left: 0;
    background-color: inherit;
    z-index: ${zIndex.OVERLAY};
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

export const Tr = styled.div`
  color: inherit;
  border-bottom: 1px solid var(--cogs-border--muted);
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  height: 100%;
  min-height: ${defaultRowHeight};
  padding: 0 8px;

  background: inherit;

  &.extra-row {
    background-color: var(--cogs-surface--medium);
    min-height: ${defaultExtraRowHeight};
  }

  &.selected {
    background-color: var(--cogs-decorative--blue--200);

    &:hover {
      background-color: var(--cogs-decorative--blue--200);
    }

    &:focus {
      background-color: var(--cogs-decorative--blue--200);
    }
  }

  &:hover {
    background: var(--cogs-greyscale-grey2);
    cursor: pointer;
  }

  &[data-selected='true'] {
    background: var(--cogs-greyscale-grey2);
  }

  &:focus {
    outline: none;
    background: var(--cogs-greyscale-grey3);
  }

  ${Thead} &:hover {
    background-color: white;
    cursor: unset;
  }

  .copying-button {
    display: none;
  }
  &:hover .copying-button {
    display: block;
  }
`;

export const HeaderRow = styled(Tr)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const MainRowContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background-color: inherit;
`;

export const MainRowSubContainer = styled.div<{ depth?: number }>`
  width: 100%;
  padding-left: ${({ depth = 0 }) => `${depth * 2}rem`};
`;

export const Tbody = styled.div`
  background-color: inherit;
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
  &:first-of-type {
    font-weight: 500;
  }
`;

export const TableDataBody = styled(Body)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  font-size: inherit;
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
  position: sticky;
  left: 0;
`;

export const MetadataHeaderText = styled(Detail)`
  font-weight: 400 !important;
  color: var(--cogs-text-icon--muted) !important;
`;

const ellipsistyles = css`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledLabel = styled(Chip)`
  display: block;
  ${ellipsistyles};
`;

export const StyledButton = styled.div`
  ${ellipsistyles};
  max-width: 80px;
`;

interface EllipsisTextProps extends BodyProps<HTMLDivElement> {
  lines?: number;
}
export const EllipsisText = styled.div<EllipsisTextProps>(
  ({ lines = 1 }) => css`
    display: block; /* Fallback for non-webkit */
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
  `
);
