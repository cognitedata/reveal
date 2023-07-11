import { useCallback } from 'react';

import styled from 'styled-components';

import { Skeleton } from '@cognite/cogs.js';

import { useNavigation } from '../../hooks/useNavigation';
import { useTypesDataModelQuery } from '../../services/dataModels/query/useTypesDataModelQuery';

import { CategoryCard } from './components/CategoryCard';

export const Categories = () => {
  const { data: types, isLoading } = useTypesDataModelQuery();

  const navigate = useNavigation();

  const handleCategoryClick = useCallback(
    (dataType: string) => {
      navigate.toSearchCategoryPage(dataType);
    },
    [navigate]
  );

  if (isLoading) {
    return <Skeleton.List lines={4} />;
  }

  return (
    <CategoriesContainer>
      <CategoryContent>
        {types?.map((item) => (
          <CategoryCard
            key={item.name}
            type={item.name}
            description={item.description}
            onClick={handleCategoryClick}
          />
        ))}

        <CategoryCard
          type="Time series"
          onClick={() => handleCategoryClick('Timeseries')}
        />

        <CategoryCard
          type="File"
          onClick={() => handleCategoryClick('Files')}
        />
      </CategoryContent>
    </CategoriesContainer>
  );
};

const CategoriesContainer = styled.div`
  height: 10%;
  padding-top: 24px;
  width: 774px;
  align-self: center;
`;

const CategoryContent = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;

  padding: 16px 0;
`;
