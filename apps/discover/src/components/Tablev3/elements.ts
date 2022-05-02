import styled, { css } from 'styled-components/macro';
import layers from 'utils/zindex';

import { Body, Button } from '@cognite/cogs.js';

import { LoadMoreButton as DefaultLoadMoreButton } from 'components/Buttons';
import { sizes } from 'styles/layout';

export const HoverContentWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  padding: 0 ${sizes.small} 0 ${sizes.small};
  z-index: ${layers.TABLE_ROW_HOVER};
  background: inherit;
  border-bottom: 1px solid #e5e5e5;

  transform: translateX(-4px);
  transition: 0.2s;
  transition-delay: 0.025s;
  transition-timing-function: ease-out;

  opacity: 0;
  pointer-events: none;
`;

export const TableWrap = styled.div`
  min-width: 100%;
  max-width: 100%;
  max-height: 100%;
  height: 100%;

  overflow-x: auto;
  overflow-y: auto;
  background: var(--cogs-white);

  display: grid;
  grid-template-columns: ${(props: { gridColumns: string }) =>
    props.gridColumns};
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  grid-auto-rows: max-content;

  color: var(--cogs-text-color);
  font-size: 14px;

  & > div[role='rowgroup'] {
    display: contents;
  }

  // Make sure we don't end up with double borders beneath sub-tables
  &
    div[role='table']
    > div[role='row']:last-of-type
    ${HoverContentWrapper},
    &
    div[role='table']
    > div[role='row']:last-of-type
    > div {
    border-bottom: none;
  }

  & div[role='table'] {
    overflow: visible;
  }

  & > [data-testid='table-row-sub'] {
    max-width: ${(props: { tableWidth: string }) =>
      Number(props.tableWidth) > 0 ? `${props.tableWidth}px` : ''};
  }
`;

// Regular cell
export const TableCell = styled.div`
  display: inline-flex;
  padding: ${sizes.small} 12px;
  min-height: 52px;
  align-items: center;
  justify-content: flex-start;
  color: inherit;
  background: inherit;
  border-bottom: 1px solid #e5e5e5;

  &:empty:after {
    content: '';
    display: inline-block;
    color: var(--cogs-greyscale-grey4);
    height: 1px;
    width: 14px;
    background-color: var(--cogs-greyscale-grey4);
  }
`;

// Header cell
export const TableHead = styled(TableCell)`
  z-index: ${layers.TABLE_HEADER};
  font-weight: 500;
  position: sticky;
  top: 0;
  background: var(--cogs-white);
  color: var(--cogs-text-color-secondary);
`;

// Hover cell (the one that pops out from the right)
export const OverlayCell = styled.div`
  padding: 0 !important;
  pointer-events: none;
  position: sticky;
  right: 0;
  background: inherit;

  &:hover {
    z-index: ${layers.TABLE_ROW_HOVER};
  }
`;

export const OverlayContentWrapper = styled(HoverContentWrapper)`
  opacity: 1;
  background: border-box;
`;

export const ExpandedRow = (maxWidth: string) => css`
  & > div::first-of-type {
    width: ${maxWidth || '100%'};
    position: sticky;
    left: 0;
  }
  background: var(--cogs-greyscale-grey1) !important;

  & > ${TableCell} {
    padding: 0;
    grid-column: 1/-1;

    /* Styling for sub-tables */
    ${TableWrap} {
      width: ${maxWidth || '100%'};
      max-width: unset;
      min-width: unset;
      position: sticky;
      left: 0;
    }
  }
`;

export const TableRow = styled.div`
  display: contents;
  background: var(--cogs-white);

  /* Apply styling for expanded rows */
  ${(props: { expandedRow?: boolean; maxWidth: string }) =>
    props.expandedRow && ExpandedRow(props.maxWidth)}

  /* Apply styling for highlighted rows */
  ${(props: { highlighted?: boolean }) =>
    props.highlighted &&
    css`
      background: var(--cogs-bg-control--toggled);

      &:hover {
        background: var(--cogs-bg-control--toggled-hover);
      }
    `}

  &:hover {
    z-index: ${layers.TABLE_ROW_HOVER};
    background: var(--cogs-greyscale-grey1);

    /* Apply styling for highlighted rows */
    ${(props: { highlighted?: boolean }) =>
      props.highlighted &&
      css`
        background: var(--cogs-bg-control--toggled-hover);
      `}

    & > ${TableHead} {
      background: var(--cogs-white);
    }

    & > ${OverlayCell} > ${HoverContentWrapper} {
      opacity: 1;
      pointer-events: initial;
      transform: translateX(0);
    }
  }
`;

export const Thead = styled.div`
  display: contents;
`;

export const CellContent = styled.div`
  display: flex;
  align-items: center;
`;

export const ExpandIconWrapper = styled.span`
  transform-origin: 7px 8px;
  transition: color 0.2s, transform 0.2s;
  display: flex;
  color: var(--cogs-greyscale-grey6);
  z-index: ${layers.TABLE_CELL_EXPAND_ICON};

  ${(props: { expanded: boolean }) =>
    props.expanded &&
    css`
      transform: rotate(-180deg);
    `};
`;

export const EndPaginationText = styled(Body)`
  padding: 10px;
`;

export const FooterWrapper = styled.div`
  grid-column: 1/-1;
`;

export const Footer = styled.div`
  background: var(--cogs-greyscale-grey1);
  text-align: center;
  min-height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  left: 0;
  width: 100%;
`;

export const DefaultSortButton = styled(Button)`
  color: var(--cogs-greyscale-grey5) !important;
`;

export const LoadMoreButton = styled(DefaultLoadMoreButton)`
  padding: 20px 26px;
  margin: 10px;
  border: 1px solid var(--cogs-greyscale-grey3);

  & > .cogs-icon {
    margin-right: 20px;
  }
`;

export const CellContentWrapper = styled.div`
  max-width: 100%;
  color: var(--cogs-text-color);
  ${(props: { whiteSpace: string }) =>
    props.whiteSpace && `white-space: ${props.whiteSpace}`}
`;

export const CellValueWrapper = styled.div`
  overflow-x: hidden;
  text-overflow: ellipsis;
`;
