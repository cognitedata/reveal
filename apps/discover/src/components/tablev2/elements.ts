import styled, { css } from 'styled-components/macro';

import { Body, Button } from '@cognite/cogs.js';

import layers from '_helpers/zindex';
import { LoadMoreButton as DefaultLoadMoreButton } from 'components/buttons';
import { sizes } from 'styles/layout';
import { FadeInFast } from 'styles/transition';

export const padding = '12px';

export const TableWrap = styled.table`
  width: 100%;
  font-size: 12px;
  table-layout: fixed;
  background: var(--cogs-white);
`;

export const Thead = styled.thead`
  white-space: nowrap;
  font-weight: 500;
  color: var(--cogs-text-color);

  p {
    margin-bottom: 0;
    font-weight: 500;
  }
  tr {
    height: 56px;
    border-bottom: none;
  }
  tr :hover {
    background: none;
  }
`;

export const TableCell = styled.td`
  padding: 0px 12px;
  font-size: 14px;
  color: var(--cogs-text-color);

  p {
    margin-top: 1em;
    color: var(--cogs-text-color);
  }

  :last-child {
    border-right: 0;
    border-bottom: none;
  }
`;

export const TableHead = styled.th`
  z-index: ${layers.TABLE_HEADER};
  background: var(--cogs-white);
  padding: ${padding};
  box-shadow: inset 0 -1px 0 var(--cogs-color-strokes-default);
  color: var(--cogs-text-color-secondary);
  font-weight: 500;
  font-size: 14px;

  ${(props: { scrollTable?: boolean }) =>
    props.scrollTable &&
    css`
      position: sticky;
      top: 0;
    `}

  :last-child {
    border-right: 0;
  }
`;

export const RowHoverHeader = styled(TableHead)`
  max-width: 0;
  width: 0;
  padding: 0;
`;

export const HoverContentWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: absolute;
  box-shadow: inset 0px -1px 0px var(--cogs-greyscale-grey2);
  right: 0;
  top: 0;
  padding: 0 0 0 ${sizes.small};
  z-index: ${layers.TABLE_ROW_HOVER};
  background: var(--cogs-greyscale-grey1);
  transform: translateX(4px);
  opacity: 0;
  pointer-events: none;
  transition: 0.2s;
  transition-delay: 0.025s;
  transition-timing-function: ease-out;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  cursor: default;

  ${(props: { expandedRow?: boolean }) =>
    props.expandedRow &&
    css`
      ${FadeInFast()};
      background: var(--cogs-greyscale-grey1);
      padding: none;

      ${TableCell} {
        padding: 0;
      }

      ${TableRow} {
        .checkbox-ui {
          margin-left: 45px;
        }
      }

      ${TableHead} {
        background: transparent;
        padding-left: 0;

        .checkbox-ui {
          margin-left: 12px;
        }
      }
    `}

  &:hover {
    background: var(--cogs-greyscale-grey1);
    z-index: ${layers.TABLE_ROW_HOVER};
  }

  &:hover > td > ${HoverContentWrapper} {
    opacity: 1;
    pointer-events: initial;
    transform: translateX(0);
  }
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
  height: ${sizes.normal};
  width: ${sizes.normal};

  ${(props: { expanded: boolean }) =>
    props.expanded &&
    css`
      transform: rotate(-180deg);
    `};
`;

export const EndPaginationText = styled(Body)`
  padding: ${sizes.medium} ${sizes.normal};
`;

export const Footer = styled.div`
  background: var(--cogs-greyscale-grey1);
  text-align: center;
  width: 100%;
  position: sticky;
  left: 0;
`;

export const DefaultSortButton = styled(Button)`
  color: var(--cogs-greyscale-grey5) !important;
`;

export const HoverCell = styled.td`
  position: sticky;
  height: 49px;
  padding: 0 !important;
  right: 0px;
  width: 0;
  pointer-events: none;
`;

export const Scrollbars = styled.div`
  overflow: auto;
  height: ${(props: { showFooter: boolean }) =>
    props.showFooter ? 'calc(100% - 56px)' : '100%'};
  width: 100%;
  flex: 1 1 0;
  padding-bottom: 90px;
  background: var(--cogs-greyscale-grey1);
`;

export const LoadMoreButton = styled(DefaultLoadMoreButton)`
  && {
    margin: ${sizes.normal};
    border: 1px solid var(--cogs-greyscale-grey3);
    width: calc(100% - ${sizes.normal} - ${sizes.normal});
  }
  &&:hover {
    background: var(--cogs-greyscale-grey3);
  }
  .cogs-icon {
    margin-right: 20px;
  }
`;
