import styled from 'styled-components';

export const TabWrapper = styled.div`
  .cogs-input-container {
    margin-bottom: 24px;
  }
  .search-input {
    .input-wrapper,
    input {
      width: 100%;
    }
  }

  > section {
    margin-bottom: 32px;
  }
  h3 {
    margin-bottom: 12px;
    margin-left: 2px;
  }

  .sidebar {
    position: absolute;
    top: 48px;
    right: 0;
    background: white;
    height: calc(100% - 48px);
    border-left: 1px solid var(--cogs-greyscale-grey2);
  }
`;
