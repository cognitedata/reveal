import { useSetWellsFilters } from 'domain/savedSearches/internal/hooks/useSetWellsFilters';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Body } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { useGetAppliedFilterGroupedByCategory } from 'modules/wellSearch/hooks/useAppliedFilters';
import { removeAppliedFilterValue } from 'modules/wellSearch/utils/filters';

import {
  CategoryContainer,
  RemoveValue,
  SearchInputContainer,
  Title,
  ValueContainer,
  ValueSpan,
} from './elements';

export const FilterCategoryValues: React.FC = () => {
  const metrics = useGlobalMetrics('wells');
  const { t } = useTranslation();
  const groupedFilterValues = useGetAppliedFilterGroupedByCategory();
  const setWellsFilters = useSetWellsFilters();
  const appliedFilters = useAppliedWellFilters();

  return (
    <>
      {Object.entries(groupedFilterValues).map(([category, filterValues]) => {
        return (
          <CategoryContainer key={category}>
            <SearchInputContainer key={category}>
              <Title>{t(category)}</Title>
              {filterValues.map(({ id, value, displayName, field }) => {
                const clearFilter = () => {
                  metrics.track('click-wells-close-filter-tag');
                  setWellsFilters(
                    removeAppliedFilterValue(appliedFilters, id, value)
                  );
                };
                return (
                  <ValueContainer
                    map={value}
                    key={`${id}-${value}`}
                    data-testid="filter-tag"
                  >
                    <ValueSpan>
                      <Body strong level={5} as="span">
                        {`${field}: `}
                      </Body>
                      {displayName || value}
                    </ValueSpan>
                    <RemoveValue
                      data-testid="remove-btn"
                      onClick={clearFilter}
                    />
                  </ValueContainer>
                );
              })}
            </SearchInputContainer>
          </CategoryContainer>
        );
      })}
    </>
  );
};
