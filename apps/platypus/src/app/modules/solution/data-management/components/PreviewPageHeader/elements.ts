import { Button, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

export const SuggestionButton = styled(Button)<{ $isActive: boolean }>`
  && {
    color: ${(props) =>
      props.$isActive ? 'var(--cogs-text-icon--status-warning)' : ''};
    background: ${(props) =>
      props.$isActive
        ? 'var(--cogs-surface--status-warning--muted--default)'
        : ''};
  }
`;

export const SearchInput = styled(Input)`
  width: 250px;
`;
