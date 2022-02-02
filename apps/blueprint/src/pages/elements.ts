import styled from 'styled-components/macro';

export const PageWrapper = styled.div`
  > header {
    background: var(--cogs-greyscale-grey1);
    padding: 32px 0;
    margin-bottom: 8px;
    h2 {
      margin: 0;
    }
    > main {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  main {
    width: 960px;
    margin: 0 auto;
  }
`;

export const Code = styled.code`
  background: var(--cogs-greyscale-grey3);
`;

export const BlueprintTable = styled.table`
  width: 100%;
  tr {
    height: 48px;
  }
  tr.blueprint-row {
    cursor: pointer;
    border-radius: 8px;
    &:hover {
      background: #e9edff;
    }
  }
  td {
    border-bottom: 1px solid var(--cogs-greyscale-grey3);
    &:first-child {
      width: 500px;
      padding-left: 16px;

      border-radius: 8px 0 0 8px;
    }
    &:last-child {
      border-radius: 0 8px 8px 0;
    }
  }
`;
