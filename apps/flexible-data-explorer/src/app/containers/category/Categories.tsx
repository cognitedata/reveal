import { useCallback } from 'react';

import styled from 'styled-components';

import { useNavigation } from '../../hooks/useNavigation';
import { useFDM } from '../../providers/FDMProvider';

import { CategoryCard } from './components/CategoryCard';

export const Categories = () => {
  const client = useFDM();

  const navigate = useNavigation();

  const handleCategoryClick = useCallback(
    (dataType: string) => {
      navigate.toSearchCategoryPage(dataType);
    },
    [navigate]
  );

  return (
    <CategoriesContainer>
      <CategoryContent>
        {client.allDataTypes?.map((item, index) => (
          <CategoryCard
            key={index}
            type={item.displayName || item.name}
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
