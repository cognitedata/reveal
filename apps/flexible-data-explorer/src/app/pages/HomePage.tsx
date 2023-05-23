import { Title } from '@cognite/cogs.js';
import { useCallback } from 'react';
import styled from 'styled-components';
import { CategoryCard } from '../components/cards/CategoryCard';
import { Page } from '../containers/page/Page';
import { SearchBar } from '../containers/search/SearchBar';
import { useNavigation } from '../hooks/useNavigation';
import { useTranslation } from '../hooks/useTranslation';
import { useTypesDataModelQuery } from '../services/dataModels/query/useTypesDataModelQuery';

export const HomePage = () => {
  const { t } = useTranslation();

  const { toListPage } = useNavigation();

  const { data, isLoading } = useTypesDataModelQuery();

  const handleCategoryClick = useCallback(
    (dataType: string) => {
      toListPage(dataType);
    },
    [toListPage]
  );

  return (
    <Page>
      <SearchContainer>
        <Title level={3}>{t('homepage_title', 'Explore all your data')}</Title>
        <SearchBar />
      </SearchContainer>
      <Page.Body loading={isLoading}>
        <CategoriesContainer>
          <Title level={4}>Categories {data?.length}</Title>

          <CategoryContent>
            {data?.map((item) => (
              <CategoryCard
                key={item.name}
                type={item.name}
                description={item.description}
                onClick={handleCategoryClick}
              />
            ))}
          </CategoryContent>
        </CategoriesContainer>
      </Page.Body>
    </Page>
  );
};

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 70vh;
  background-color: radial-gradient(
    62.29% 135.84% at 0% 0%,
    rgba(10, 119, 247, 0.1024) 0%,
    rgba(10, 119, 246, 0) 100%
  );

  box-sizing: border-box;

  background: radial-gradient(
      62.29% 135.84% at 0% 0%,
      rgba(10, 119, 247, 0.1024) 0%,
      rgba(10, 119, 246, 0) 100%
    ),
    radial-gradient(
      40.38% 111.35% at 76.81% 40.18%,
      rgba(84, 108, 241, 0.16) 0%,
      rgba(84, 108, 241, 0) 100%
    ),
    #ffffff;

  border-bottom: 1px solid rgba(83, 88, 127, 0.16);
`;

const CategoriesContainer = styled.div`
  height: 10%;
  padding-top: 40px;
`;

const CategoryContent = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 10px;
  grid-row-gap: 10px;

  padding: 16px 0;
`;
