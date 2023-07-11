import styled from 'styled-components/macro';

export const ButtonWrapper = styled.div`
  .cogs-button {
    width: calc(100% + 16px);
    margin: -8px;
    margin-top: 8px;
    border-radius: 0px 0px 8px 8px;

    background: var(--cogs-surface--interactive--toggled-default);
    color: var(--cogs-text-icon--interactive--default);

    :hover {
      background: var(--cogs-surface--interactive--toggled-hover) !important;
      color: var(--cogs-text-icon--interactive--hover) !important;
    }

    :active {
      background: var(--cogs-surface--interactive--toggled-pressed) !important;
      color: var(--cogs-text-icon--interactive--pressed) !important;
    }
  }

  .cogs-button--disabled {
    background: var(--cogs-surface--interactive--disabled) !important;
    color: var(--cogs-text-icon--interactive--disabled) !important;

    :hover {
      background: var(--cogs-surface--interactive--disabled) !important;
      color: var(--cogs-text-icon--interactive--disabled) !important;
    }
  }
`;
