import styled from 'styled-components';

export const TabWrapper = styled.div`
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
  .event-content-section {
    display: flex;
    align-items: flex-start;
  }
  .event-sidebar-section {
    overflow-y: auto;
    position: absolute;
    top: 48px;
    right: 0;
    background: white;
    height: calc(100% - 48px);
    border-left: 1px solid var(--cogs-greyscale-grey2);
  }
`;
