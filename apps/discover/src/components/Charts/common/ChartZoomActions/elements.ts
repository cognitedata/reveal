import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const ChartActionButtonsContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  .cogs-btn {
    color: var(--cogs-text-hint);
    margin-right: ${sizes.small};
    :last-child {
      margin-right: 0px;
    }
  }
  .cogs-btn-disabled {
    background: transparent !important;
    color: var(--cogs-bg-control--disabled-hover) !important;
  }
  .cogs-btn-disabled:hover {
    background: transparent;
    color: var(--cogs-bg-control--disabled-hover);
  }
`;
