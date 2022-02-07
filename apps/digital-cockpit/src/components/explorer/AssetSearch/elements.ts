import styled from 'styled-components';

export const AssetSearchWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    height: 100%;
    overflow: auto;
    padding-bottom: 32px;
  }
  .search-input {
    .input-wrapper,
    input {
      width: 100%;
      font-size: 14px;
      line-height: 20px;
    }
    .input-wrapper {
      margin-bottom: 6px;
    }
  }
`;

export const AssetSearchItem = styled.div`
  max-height: 65px;
  margin: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background-color: var(--cogs-midblue-8);
  }
  &.selected {
    background-color: var(--cogs-greyscale-grey2);
  }
  & .asset-title {
    margin: 0;
    font-size: 14px;
    max-height: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  & .asset-description {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--cogs-greyscale-grey6);
    line-height: 16px;
    max-height: 32px;
    overflow: hidden;
  }
`;
