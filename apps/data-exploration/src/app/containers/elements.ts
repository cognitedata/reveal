import styled from 'styled-components';

import { Splitter } from '@cognite/data-exploration';

export const TempCommonMultiSelectFix = styled.div`
  && {
    .cogs-select__multi-value {
      background-color: var(--cogs-surface--status-neutral--muted--default);
      color: var(--cogs-text-icon--status-neutral);
      border-radius: 4px;

      .cogs-select__multi-value__label {
        color: var(--cogs-text-icon--status-neutral);
        font-weight: 500;
      }
    }
  }
`;

export const TempMultiSelectFix = styled.div`
  && {
    .cogs-select__multi-value {
      background-color: var(--cogs-surface--status-success--muted--default);
      color: var(--cogs-text-icon--status-success);
      border-radius: 4px;

      .cogs-select__multi-value__label {
        color: var(--cogs-text-icon--status-success);
        font-weight: 500;
      }
    }
  }
`;

export const StyledSplitter = styled(Splitter)`
  .splitter-layout .layout-pane.layout-pane-primary {
    overflow: hidden;
  }
`;

export const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;
