import { useWellSearchResultQuery } from 'domain/wells/well/internal/queries/useWellSearchResultQuery';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Button } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { FilterCategoryValues } from 'components/TableEmpty/FilterCategoryValues';
import { SearchInputValues } from 'components/TableEmpty/SearchInputValues';
import {
  clearSelectedFeature,
  removeArbitraryLine,
  setGeo,
} from 'modules/map/actions';
import { useGetTypeFromGeometry } from 'modules/map/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { WellFilterOptionValue } from 'modules/wellSearch/types';

import {
  CLEAR_ALL_TEXT,
  GEOLOCATION_LABEL,
  SEARCH_VALUE_LABEL,
} from './constants';
import { FilterContainer, FilterWrapper } from './elements';

export type GetFilterValues = (id: string) => {
  id: number | string;
  value: string | WellFilterOptionValue;
  displayName?: string;
}[];
export interface TableEmptyProps {
  clearQuery?: () => void;
  clearAllFilters?: () => void;
  clearPolygon?: () => void;
}
export const TableEmpty: React.FC<TableEmptyProps> = ({
  clearAllFilters,
  clearPolygon,
  clearQuery,
}) => {
  const { t } = useTranslation();
  const { isLoading } = useWellSearchResultQuery();
  const dispatch = useDispatch();
  const query = useSearchPhrase();
  const selectedFeature = useGetTypeFromGeometry();

  const updatePolygonMap = () => {
    if (selectedFeature === 'LineString') {
      dispatch(removeArbitraryLine());
    } else {
      dispatch(setGeo([]));
    }
    dispatch(clearSelectedFeature());
  };

  const resetAllFilters = () => {
    updatePolygonMap();
    if (clearAllFilters) clearAllFilters();
  };

  const resetPolygon = () => {
    updatePolygonMap();
    if (clearPolygon) clearPolygon();
  };

  if (isLoading) {
    return <EmptyState isLoading />;
  }

  return (
    <EmptyState>
      <FilterWrapper>
        <FilterContainer>
          <SearchInputValues
            caption={t(GEOLOCATION_LABEL)}
            value={selectedFeature}
            onClick={resetPolygon}
          />
          <SearchInputValues
            caption={t(SEARCH_VALUE_LABEL)}
            value={query}
            onClick={clearQuery}
          />
          <FilterCategoryValues />
        </FilterContainer>

        <Button
          type="danger"
          onClick={resetAllFilters}
          aria-label={t(CLEAR_ALL_TEXT)}
          data-testid="clear-all-btn"
        >
          {t(CLEAR_ALL_TEXT)}
        </Button>
      </FilterWrapper>
    </EmptyState>
  );
};
