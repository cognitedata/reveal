import styled from 'styled-components';
import { SearchBar } from '../containers/SearchBar';

export const HomePage = () => {
  return (
    <>
      <SearchContainer>
        <SearchBar />
      </SearchContainer>

      <CategoriesContainer>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
        <p>hi</p>
      </CategoriesContainer>
    </>
  );
};

const SearchContainer = styled.div`
  min-height: 60vh;
  background-color: grey;
  display: flex;
  align-items: center;
  justify-content: center;

  & > * {
    min-width: 640px;
  }
`;

const CategoriesContainer = styled.div`
  height: 10%;
`;
