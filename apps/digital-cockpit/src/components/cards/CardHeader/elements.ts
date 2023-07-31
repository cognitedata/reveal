import styled from 'styled-components';

export const CardHeaderWrapper = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;

  .icon-container,
  .card-header--icon-container {
    background: var(--cogs-greyscale-grey2);
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    margin-right: 8px;
  }

  header {
    font-weight: 500;
    h3 {
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 0;

      &.with-subtitle {
        font-size: 14px;
        line-height: 14px;
      }
    }
    .card-header--subtitle {
      font-size: 10px;
      line-height: 14px;
      color: var(--cogs-greyscale-grey7);
    }
  }

  .card-header--appended-icon {
    margin-left: auto;
  }

  .suite-avatar {
    margin-right: 8px;
  }
`;

export const IconContainer = styled.div``;
