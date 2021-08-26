/*
 * Completely taken from data-exploration since basic table has no styles
 */
import styled, { css } from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { lightGrey } from 'src/utils/Colors';

const TableWrapperInner = styled.div`
  .BaseTable {
    box-shadow: 0 2px 4px 0 #eeeeee;
    background-color: #ffffff;
    position: relative;
    box-sizing: border-box;
    font-size: 13px;
  }

  .BaseTable--disabled {
    opacity: 0.7;
    pointer-events: none;
  }

  .BaseTable--dynamic .BaseTable__row {
    overflow: hidden;
    align-items: stretch;
  }

  .BaseTable:not(.BaseTable--dynamic) .BaseTable__row-cell-text,
  .BaseTable .BaseTable__row--frozen .BaseTable__row-cell-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .BaseTable__table {
    background-color: #ffffff;
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column-reverse;
  }

  .BaseTable__table-main {
    outline: 1px solid #eeeeee;
    left: 0;
  }

  .BaseTable__table-main .BaseTable__header-cell:first-child,
  .BaseTable__table-main .BaseTable__row-cell:first-child {
    padding-left: 15px;
  }

  .BaseTable__table-main .BaseTable__header-cell:last-child,
  .BaseTable__table-main .BaseTable__row-cell:last-child {
    padding-right: 15px;
  }

  .BaseTable__table-main .BaseTable__header {
    background-color: #f8f8f8;
  }

  .BaseTable__table-frozen-left .BaseTable__header,
  .BaseTable__table-frozen-left .BaseTable__body,
  .BaseTable__table-frozen-right .BaseTable__header,
  .BaseTable__table-frozen-right .BaseTable__body {
    overflow: hidden !important;
  }

  .BaseTable__table-frozen-left {
    box-shadow: 2px 0 4px 0 #eeeeee;
    top: 0;
    left: 0;
  }

  .BaseTable__table-frozen-left .BaseTable__header-cell:first-child,
  .BaseTable__table-frozen-left .BaseTable__row-cell:first-child {
    padding-left: 15px;
  }

  .BaseTable__table-frozen-left .BaseTable__header-row,
  .BaseTable__table-frozen-left .BaseTable__row {
    padding-right: 0 !important;
  }

  .BaseTable__table-frozen-left .BaseTable__body {
    overflow-y: auto !important;
  }

  .BaseTable__table-frozen-right {
    box-shadow: -2px 0 4px 0 #eeeeee;
    top: 0;
    right: 0;
  }

  .BaseTable__table-frozen-right .BaseTable__header-cell:last-child,
  .BaseTable__table-frozen-right .BaseTable__row-cell:last-child {
    padding-right: 15px;
  }

  .BaseTable__table-frozen-right .BaseTable__header-row,
  .BaseTable__table-frozen-right .BaseTable__row {
    padding-left: 0 !important;
  }

  .BaseTable__table-frozen-right .BaseTable__body {
    overflow-y: auto !important;
  }

  .BaseTable__header {
    overflow: visible !important;
  }

  /* .BaseTable .BaseTable__header,  // commented to allow table scroll
  .BaseTable .BaseTable__body {
    outline: none;
    overflow: visible !important;
  }
  */

  .BaseTable__header-row,
  .BaseTable__row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eeeeee;
    box-sizing: border-box;
  }

  .BaseTable__header-row {
    background-color: #f8f8f8;
    font-weight: 700;
  }

  .BaseTable__row {
    background-color: #ffffff;
  }

  .BaseTable__row:hover,
  .BaseTable__row--hovered {
    background-color: #f3f3f3;
  }

  .BaseTable__row-expanded {
    border-bottom: 1px solid #eeeeee;
  }

  .BaseTable__header-cell,
  .BaseTable__row-cell {
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 7.5px;
    box-sizing: border-box;
  }

  .BaseTable__header-cell--align-center,
  .BaseTable__row-cell--align-center {
    justify-content: center;
    text-align: center;
  }

  .BaseTable__header-cell--align-right,
  .BaseTable__row-cell--align-right {
    justify-content: flex-end;
    text-align: right;
  }

  .BaseTable__header-cell {
    position: relative;
    cursor: default;
  }

  .BaseTable__header-cell:hover .BaseTable__column-resizer {
    visibility: visible;
    opacity: 0.5;
  }

  .BaseTable__header-cell:hover .BaseTable__column-resizer:hover {
    opacity: 1;
  }

  .BaseTable__header-cell .BaseTable__sort-indicator {
    display: none;
  }

  .BaseTable__header-cell--sortable:hover {
    background-color: #f3f3f3;
    cursor: pointer;
  }

  .BaseTable__header-cell--sortable:not(.BaseTable__header-cell--sorting):hover
    .BaseTable__sort-indicator {
    display: block;
    color: #888888;
  }

  .BaseTable__header-cell--sorting .BaseTable__sort-indicator,
  .BaseTable__header-cell--sorting:hover .BaseTable__sort-indicator {
    display: block;
  }

  .BaseTable__header-cell--resizing .BaseTable__column-resizer {
    visibility: visible;
    opacity: 1;
  }

  .BaseTable__header-cell--resizing .BaseTable__column-resizer::after {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    content: '';
    left: -9999px;
  }

  .BaseTable__header-cell-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }

  .BaseTable__header-row--resizing .BaseTable__header-cell {
    background-color: transparent;
    cursor: col-resize;
  }

  .BaseTable__header-row--resizing
    .BaseTable__header-cell:not(.BaseTable__header-cell--sorting)
    .BaseTable__sort-indicator {
    display: none;
  }

  .BaseTable__header-row--resizing
    .BaseTable__header-cell:not(.BaseTable__header-cell--resizing)
    .BaseTable__column-resizer {
    visibility: hidden;
  }

  .BaseTable__column-resizer {
    width: 3px;
    visibility: hidden;
    background-color: #cccccc;
  }

  .BaseTable__column-resizer:hover {
    visibility: visible;
    opacity: 1;
  }

  .BaseTable__footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background-color: #ffffff;
  }

  .BaseTable__resizing-line {
    cursor: col-resize;
    position: absolute;
    top: 0;
    background-color: #cccccc;
    width: 3px;
    transform: translateX(-100%);
  }

  .BaseTable__empty-layer {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    background-color: #ffffff;
  }

  .BaseTable__overlay {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .BaseTable__overlay > * {
    pointer-events: auto;
  }
`;

export const TableWrapper = styled(TableWrapperInner)(
  (props: { disableScroll?: boolean }) => css`
    width: 100%;
    height: inherit;
    /* overflow-x: hidden; // commented to allow table scroll
    overflow-y: auto; */
    overflow: hidden;
    .row {
      transition: 0.3s all;
      border-bottom: 1px solid ${lightGrey};
    }
    .BaseTable__header-cell {
      background: ${Colors['greyscale-grey2'].hex()};
      overflow: visible !important;
    }
    .BaseTable__header-row {
      border-bottom: 1px solid ${lightGrey};
    }
    .row:not(.previewing):hover,
    .BaseTable__row--hovered:not(.previewing) {
      background: ${Colors['greyscale-grey1'].hex()};
    }
    .clickable {
      cursor: pointer;
    }
    &&& .BaseTable__row.active {
      background: ${Colors['midblue-6'].hex()};
    }
    &&& .BaseTable__row.selected:not(.active) {
      background: ${Colors['midblue-8'].hex()};
    }

    ${props.disableScroll &&
    css`
      &&& .BaseTable__body {
        overflow-x: hidden !important;
      }
    `}
  `
);
