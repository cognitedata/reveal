import styled from 'styled-components';

export const SearchResultContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

  .search-result--icon {
    margin-right: 5px;
    flex: 0 0 auto;
  }
`;

export const SearchResultDetails = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`;
