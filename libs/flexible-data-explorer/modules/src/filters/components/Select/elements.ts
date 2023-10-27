import styled from 'styled-components/macro';

export const SelectWrapper = styled.div`
  .cogs-select__option {
    color: var(--cogs-text-icon--medium);
    font-weight: 500;
    padding: 8px;
    letter-spacing: -0.006em;
    font-feature-settings: 'cv05' on;
  }
  .cogs-select__option--is-selected {
    color: var(--cogs-text-icon--interactive--default);
  }
`;
