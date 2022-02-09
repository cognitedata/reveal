import styled from 'styled-components';

export const AssetDetailsTabWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  > main {
    display: grid;
    flex-grow: 1;
    height: 100%;
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    grid-column-gap: 16px;
    grid-row-gap: 16px;
    padding-right: 36px;
    padding-bottom: 16px;
  }

  > aside {
    width: 256px;
    display: grid;
    grid-template-rows: auto 100%;
  }

  .slim-card {
    height: 56px;
    margin-bottom: 16px;
  }
`;
