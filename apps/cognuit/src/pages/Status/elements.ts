import styled from 'styled-components';

export const StatusContainer = styled.div`
  margin: 0 auto 2rem auto;

  .cogs-row {
    margin-bottom: 2rem;
  }
`;

export const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  h1 {
    font-size: 1.2rem;
    margin-bottom: 0;
    line-height: 1;
  }

  .cogs-btn-outline {
    background: var(--cogs-white);
    width: 170px;
    justify-content: space-between;
    padding-right: 12px;

    .cogs-icon {
      margin-left: auto;
    }
  }
`;

export const CardContent = styled.div`
  padding: 2rem;

  .ant-tabs-tab {
    font-weight: 500;
    padding: 0 12px 12px 12px;

    .ant-tabs-tab-btn {
      color: var(--cogs-greyscale-grey8);

      &:focus {
        outline: 1px solid var(--cogs-midblue);
        color: var(--cogs-midblue);
      }
      &:focus:not(.focus-visible) {
        outline: none;
      }
    }

    &.ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: var(--cogs-black);
      }
    }
  }

  .ant-tabs-ink-bar {
    background: var(--cogs-midblue);
  }
`;
