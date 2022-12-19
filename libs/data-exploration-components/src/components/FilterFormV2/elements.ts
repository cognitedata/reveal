import styled from 'styled-components';

export const FilterItemWrapper = styled.div`
  .key {
    margin-bottom: 16px;
  }
  .key,
  .value {
    display: flex;
    flex: 1;
    > div {
      flex: 1;
    }
  }
  .buttons {
    display: flex;
    align-items: stretch;
    > * {
      margin-left: 4px;
    }
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;
