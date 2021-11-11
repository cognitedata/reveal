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
    justify-content: space-around;
    height: 35%;

    .placeholder-text {
      width: 480px;
      .cogs-title-3 {
        margin-bottom: 8px;
      }
      .cogs-body-1 {
        display: inline;
      }
      .component-name {
        display: inline-flex;
        justify-content: space-around;
        align-items: center;
        width: 145px;
        height: 24px;
        margin-right: 5px;
        background: rgba(50, 56, 83, 0.04);
        border-radius: 6px;
        color: var(--cogs-text-color-secondary);

        &:hover {
          color: var(--cogs-text-color);
          background: rgba(34, 42, 83, 0.1);
        }

        .cogs-icon-Help {
          width: 13.5px !important;
        }
      }
    }

    .placeholder-actions {
      height: 42%;
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
