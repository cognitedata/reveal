import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const TableWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  .row {
    transition: 0.3s all;
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .BaseTable__header-cell {
    background: ${Colors['greyscale-grey2'].hex()};
  }
  .BaseTable__header-row {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .row:not(.previewing):hover,
  .BaseTable__row--hovered:not(.previewing) {
    background: ${Colors['greyscale-grey1'].hex()};
  }
  .clickable {
    cursor: pointer;
  }
  .active {
    background: ${Colors['greyscale-grey1'].hex()};
  }
  .previewing:not(.active) {
    background: ${Colors['midblue-7'].hex()};
  }
`;
