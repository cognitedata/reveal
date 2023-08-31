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
      navigate.toSearchPage(undefined, undefined, {
        category: dataType,
      });
    },
    [navigate]
  );

  return (
    <CategoriesContainer>
      <CategoryContent className="categories-container">
        {client.allDataTypes?.map((item, index) => (
          <CategoryCard
            key={index}
            type={item.displayName || item.name}
            description={item.description}
            onClick={() => handleCategoryClick(item.name)}
          />
        ))}

        <CategoryCard
          type="Time series"
          onClick={() => handleCategoryClick('TimeSeries')}
        />

        <CategoryCard type="File" onClick={() => handleCategoryClick('File')} />
      </CategoryContent>
    </CategoriesContainer>
  );
};

const CategoriesContainer = styled.div`
  height: 10%;
  padding-top: 16px;
  width: 774px;
  align-self: center;
`;

const CategoryContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 16px;
  padding: 16px 0;
`;
