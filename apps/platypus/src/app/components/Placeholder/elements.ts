import styled from 'styled-components/macro';

export const PlaceholderWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 220px;
  width: 100%;
  height: 100%;

  background: var(--cogs-bg-accent);
  border: 1px dashed var(--cogs-border-default);
  box-sizing: border-box;
  border-radius: 16px;

  .content {
    display: flex;
    flex-direction: column;
    margin-right: 24px;

    .placeholder-text {
      width: 480px;
      padding-top: 28px;
      margin-bottom: 24px;
      .cogs-title-3 {
        margin-bottom: 8px;
      }
      .cogs-body-1 {
        display: inline;
      }
      .cogs-label {
        margin-right: 5px;
        background: rgba(50, 56, 83, 0.04);
        font-size: 16px;
        color: var(--cogs-text-color-secondary);

        &:hover {
          color: var(--cogs-text-color);
          background: rgba(34, 42, 83, 0.1);
        }
      }
    }

    .placeholder-actions {
      .cogs-body-1 {
        &:first-child {
          margin-bottom: 16px;
        }
        &:last-of-type {
          display: inline-block;
        }
      }
      button {
        margin-right: 8px;
        &:last-of-type {
          margin-left: 8px;
        }
        &:focus {
          color: var(--cogs-primary);
          background: rgba(74, 103, 251, 0.08);
        }
      }
      .cogs-detail {
        display: block;
        margin-top: 10px;
      }
    }
  }
`;
