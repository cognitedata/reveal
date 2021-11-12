import styled from 'styled-components/macro';

export const PlaceholderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  background: var(--cogs-greyscale-grey1);
  border: 1px dashed rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  border-radius: 16px;

  .content {
    display: flex;
    flex-direction: column;

    .placeholder-text {
      width: 480px;
      margin-bottom: 20px;
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
          margin-bottom: 15px;
        }
        &:last-of-type {
          display: inline-block;
        }
      }
      button {
        margin-right: 10px;
        &:last-of-type {
          margin-left: 10px;
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
