import { Input } from '@cognite/cogs.js';
import styled from 'styled-components';

export const MetadataCard = styled.div`
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;
`;

export const MetadataHeader = styled.div`
  padding: 16px 12px;
  height: 53px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
  margin-bottom: 16px;

  .cogs-input {
    margin-right: 8px;
  }
`;

export const FilterInput = styled(Input)`
  background: #efefef !important;
  &:hover,
  :focus {
    background: transparent !important;
  }
`;
