import styled from 'styled-components';

export const ExplorerWrapper = styled.div`
  display: flex;
  height: 100%;
  > aside {
    padding: 16px;
    width: 256px;
    min-width: 256px;
    background: var(--cogs-greyscale-grey2);
    border-right: 1px solid var(--cogs-greyscale-grey4);
    height: 100%;
    overflow: hidden;
    h3 {
      margin-bottom: 16px;
    }
  }
  > main {
    flex-grow: 1;

    height: 100%;
    background: white;
  }
`;
