import React from 'react';

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';

import { FilterTagProps } from 'components/tag/BlueFilterTag';
import { ClearTagProps } from 'components/tag/ClearTag';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useClearPolygon } from 'modules/api/savedSearches/hooks/useClearPolygon';
import { useClearQuery } from 'modules/api/savedSearches/hooks/useClearQuery';
import {
  useClearWellsFilters,
  useSetWellsFilters,
} from 'modules/api/savedSearches/hooks/useClearWellsFilters';
import { useGetTypeFromGeometry, useMap } from 'modules/map/selectors';
import {
  useAppliedWellFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';
import { useGetAppliedFilterEntries } from 'modules/wellSearch/hooks/useAppliedFilters';
import { FilterValues } from 'modules/wellSearch/types';
import { reomveAppliedFilterValue } from 'modules/wellSearch/utils/filters';
import { sizes } from 'styles/layout';

const Container = styled.div`
  margin-top: ${sizes.small};
`;

interface Props {
  filterTagComponent: React.FC<FilterTagProps>;
  clearTagComponent: React.FC<ClearTagProps>;
  showGeoFilters?: boolean;
  showClearTag?: boolean;
  showSearchPhraseTag?: boolean;
}

export const WellAppliedFilters: React.FC<Props> = React.memo(
  ({
    filterTagComponent,
    clearTagComponent,
    showGeoFilters = false,
    showClearTag = false,
    showSearchPhraseTag = false,
  }) => {
    const metrics = useGlobalMetrics('wells');
    const appliedFilters = useAppliedWellFilters();
    const { filterApplied: geoFiltersApplied } = useMap();
    const setWellsFilters = useSetWellsFilters();
    const clearAllWellFilters = useClearWellsFilters();

    const clearPolygon = useClearPolygon();
    const selectedFeature = useGetTypeFromGeometry();
    const clearQuery = useClearQuery();
    const searchPhrase = useSearchPhrase();
    const filterValues = useGetAppliedFilterEntries();

    const hasFiltersApplied =
      !isEmpty(appliedFilters) ||
      (showGeoFilters && geoFiltersApplied) ||
      (showSearchPhraseTag && searchPhrase);

    const handleFilterCloseClick = (entry: FilterValues) => {
      metrics.track('click-wells-close-filter-tag');
      setWellsFilters(
        reomveAppliedFilterValue(appliedFilters, entry.id, entry.value)
      );
    };

    const handleClearAllClick = () => {
      metrics.track('click-wells-clear-all-tag');
      clearAllWellFilters();
    };

    const canShowGeoFilters =
      showGeoFilters && selectedFeature && geoFiltersApplied;

    const canShowSearchPhrase =
      showSearchPhraseTag && searchPhrase && hasFiltersApplied;

    const canShowClearFilterElement = showClearTag && hasFiltersApplied;

    const createFilterTagElement = (
      key: string,
      tag: any,
      onClick: () => void
    ) => (
      <div key={key}>
        {React.createElement(filterTagComponent, {
          tag,
          onClick,
        })}
      </div>
    );

    const createClearTagElement = (onClick: () => void) =>
      React.createElement(clearTagComponent, {
        onClick,
      });

    return (
      <Container data-testid="well-filter-container">
        {(filterValues || []).map((filterValue) =>
          createFilterTagElement(
            `${filterValue.id}-${filterValue.value}-well-tags`,
            `${filterValue.field || filterValue.category} : ${
              filterValue.value || filterValue.displayName
            }`,
            () => {
              handleFilterCloseClick(filterValue);
            }
          )
        )}
        {canShowGeoFilters &&
          createFilterTagElement(
            `${selectedFeature}-well-tags`,
            `Custom ${selectedFeature}`,
            () => clearPolygon()
          )}
        {canShowSearchPhrase &&
          createFilterTagElement(
            `${searchPhrase}-query-tags`,
            searchPhrase,
            clearQuery
          )}
        {canShowClearFilterElement &&
          createClearTagElement(() => {
            handleClearAllClick();
          })}
      </Container>
    );
  }
);
