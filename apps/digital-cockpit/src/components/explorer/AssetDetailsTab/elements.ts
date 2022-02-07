import styled from 'styled-components';

export const AssetDetailsTabWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  > main {
    display: grid;
    flex-grow: 1;
    height: 500px;
    grid-template-columns: 50% 50%;
    grid-row: auto auto;
    grid-column-gap: 16px;
    grid-row-gap: 16px;
    padding-right: 36px;
  }

  > aside {
    width: 256px;
  }

  .slim-card {
    height: auto;
    margin-bottom: 16px;
  }
`;
