import styled from 'styled-components';

import { Input } from '@cognite/cogs.js';

export const MetadataCard = styled.div`
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;
`;

export const MetadataHeader = styled.div`
  padding: 16px 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--cogs-border--muted);
`;

export const MetadataTableContainer = styled.div`
  white-space: pre;
  overflow: auto;

  & > div {
    padding: 0px;
  }

  .data-exploration-table {
    background-color: var(--cogs-surface-medium);

    .cell-content {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  overflow: hidden;
  gap: 8px;
`;

export const FilterInput = styled(Input)`
  background: #efefef !important;
  &:hover,
  :focus {
    background: transparent !important;
  }
`;

export const RootAssetWrapper = styled.div`
  color: var(--cogs-text-icon--interactive--default);
  cursor: pointer;
  align-self: center;
`;
