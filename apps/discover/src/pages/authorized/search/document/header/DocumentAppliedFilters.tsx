import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Button, Label } from '@cognite/cogs.js';
import { GeoJsonGeometryTypes } from '@cognite/seismic-sdk-js';

import { CLEAR_ALL_TEXT } from 'components/tableEmpty/constants';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentAppliedFilterEntries } from 'modules/api/documents/hooks/useDocumentAppliedFilters';
import { useDocumentFormatFilter } from 'modules/api/documents/hooks/useDocumentFormatFilter';
import { useClearAllDocumentFilters } from 'modules/api/savedSearches/hooks/useClearAllDocumentFilters';
import { useSetDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
import { useClearPolygon } from 'modules/api/savedSearches/hooks/useClearPolygon';
import { useClearQuery } from 'modules/api/savedSearches/hooks/useClearQuery';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { useGetTypeFromGeometry, useMap } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';
import {
  getDocumentFacetsflatValues,
  isRangeFacet,
} from 'modules/sidebar/utils';

import { useSavedSearch } from '../../../../../modules/api/savedSearches/hooks';
import { useAppliedMapGeoJsonFilters } from '../../../../../modules/sidebar/selectors';
import { MapLayerGeoJsonFilter } from '../../../../../modules/sidebar/types';

import { TagRow, TagWrapper } from './elements';

export enum ClearAllScenarios {
  ALL,
  FILTERS,
  SEARCH_PHRASE,
}

interface Props {
  showGeoFilters?: boolean;
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
  showClearTagForScenarios?: ClearAllScenarios;
}

export const DocumentAppliedFilters: React.FC<Props> = (props) => {
  const documentFacets = useAppliedDocumentFilters();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const searchPhrase = useSearchPhrase();
  const { filterApplied: geoFiltersApplied } = useMap();
  const selectedFeature = useGetTypeFromGeometry();

  const setDocumentFilters = useSetDocumentFilters();
  const clearAllDocumentFilters = useClearAllDocumentFilters();
  const clearQuery = useClearQuery();
  const clearPolygon = useClearPolygon();
  const patchSavedSearch = useSavedSearch();

  const actions = {
    setDocumentFilters,
    clearAllDocumentFilters,
    clearQuery,
    clearPolygon,
    clearExtraGeoJsonFilter: (filter: MapLayerGeoJsonFilter) => {
      patchSavedSearch({
        filters: {
          extraGeoJsonFilters: extraGeoJsonFilters?.filter(
            (f) => f.label !== filter.label
          ),
        },
      });
    },
  };
  const data = {
    documentFacets,
    extraGeoJsonFilters,
    searchPhrase,
    geoFiltersApplied,
    selectedFeature,
  };
  return (
    <DocumentAppliedFiltersCore {...props} data={data} actions={actions} />
  );
};

interface CoreProps {
  showGeoFilters?: boolean;
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
  showClearTagForScenarios?: ClearAllScenarios;
  data: {
    documentFacets: DocumentsFacets;
    extraGeoJsonFilters: MapLayerGeoJsonFilter[] | undefined;
    searchPhrase: string;
    selectedFeature?: GeoJsonGeometryTypes | null;
    geoFiltersApplied?: boolean;
  };
  actions: {
    clearAllDocumentFilters: () => void;
    clearQuery: () => void;
    clearPolygon?: () => void;
    setDocumentFilters: (
      facets: DocumentsFacets
      // extraGeoJsonFilters?: MapLayerGeoJsonFilter[]
    ) => void;
    clearExtraGeoJsonFilter?: (filter: MapLayerGeoJsonFilter) => void;
  };
}

export const DocumentAppliedFiltersCore: React.FC<CoreProps> = React.memo(
  ({
    showGeoFilters = false,
    showClearTag = false,
    showSearchPhraseTag = false,
    showClearTagForScenarios = ClearAllScenarios.ALL,
    actions,
    data,
  }) => {
    const metrics = useGlobalMetrics('documents');

    const {
      documentFacets,
      extraGeoJsonFilters,
      searchPhrase,
      selectedFeature,
      geoFiltersApplied = false,
    } = data;

    const {
      setDocumentFilters,
      clearAllDocumentFilters,
      clearPolygon,
      clearQuery,
      clearExtraGeoJsonFilter,
    } = actions;

    const formatTag = useDocumentFormatFilter();
    const entries = useDocumentAppliedFilterEntries(documentFacets);

    const hasFiltersApplied =
      !isEmpty(getDocumentFacetsflatValues(documentFacets) || []) ||
      geoFiltersApplied ||
      (extraGeoJsonFilters && !isEmpty(extraGeoJsonFilters));

    const handleClearFilterClicked = ({
      facet,
      original,
    }: {
      facet: keyof DocumentsFacets;
      original: any;
    }) => {
      metrics.track('click-documents-close-filter-tag');

      let filtered: unknown[];

      if (isRangeFacet(facet)) {
        filtered = [];
      } else if (facet === 'labels') {
        filtered = (documentFacets[facet] as { externalId: string }[]).filter(
          (item) => {
            return item.externalId !== original.externalId;
          }
        );
      } else {
        filtered = (documentFacets[facet] as string[]).filter((item: any) => {
          return item !== original;
        });
      }

      setDocumentFilters(
        {
          ...documentFacets,
          [facet]: filtered,
        }
        // extraGeoJsonFilters
      );
    };

    const handleClearMapLayerFilter = (filter: MapLayerGeoJsonFilter) => {
      if (clearExtraGeoJsonFilter) {
        clearExtraGeoJsonFilter(filter);
      }
    };
    const handleClearAllClick = () => {
      metrics.track('click-documents-clear-all-tag');
      clearAllDocumentFilters();
    };

    const showClearFilterTagByScenario = () => {
      switch (showClearTagForScenarios) {
        case ClearAllScenarios.ALL:
          return hasFiltersApplied || searchPhrase;
        case ClearAllScenarios.FILTERS:
          return hasFiltersApplied;
        case ClearAllScenarios.SEARCH_PHRASE:
          return searchPhrase;
        default:
          return false;
      }
    };

    const canShowGeoFilters =
      showGeoFilters && selectedFeature && geoFiltersApplied;

    const canShowSearchPhrase = showSearchPhraseTag && searchPhrase;

    const canShowClearFilterElement =
      showClearTag && showClearFilterTagByScenario();

    const createFilterTagElement = (
      key: string,
      tag: string,
      onClick: () => void
    ) => (
      <TagWrapper key={key}>
        <Label
          key={key}
          size="medium"
          variant="default"
          icon="Close"
          iconPlacement="right"
          onClick={onClick}
          data-testid="filter-tag"
        >
          {tag}
        </Label>
      </TagWrapper>
    );

    const createClearAllTagElement = (onClick: () => void) => (
      <TagWrapper>
        <Button
          type="secondary"
          size="small"
          onClick={onClick}
          data-testid="clear-all-filter-button"
        >
          {CLEAR_ALL_TEXT}
        </Button>
      </TagWrapper>
    );

    return (
      <TagRow
        data-testid="document-filter-container"
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.stopPropagation();
        }}
      >
        {(entries || []).map(([facet, activeFacetItems]) => {
          // "Batch" the dates into one tag
          if (isRangeFacet(facet) && !isEmpty(activeFacetItems)) {
            const tag = formatTag(facet, activeFacetItems);
            return createFilterTagElement(`${facet}-document-tags`, tag, () =>
              handleClearFilterClicked({ facet, original: activeFacetItems })
            );
          }

          // For the rest, map and show the tag
          return (activeFacetItems as (string | { externalId: string })[]).map(
            (item) => {
              const tag = formatTag(facet, item);
              return createFilterTagElement(
                `${facet}-${item}-document-tags`,
                tag,
                () =>
                  handleClearFilterClicked({
                    facet,
                    original: item,
                  })
              );
            }
          );
        })}

        {(extraGeoJsonFilters || []).map((filter) => {
          return createFilterTagElement(
            `map-layer-filter-${filter.label}`,
            filter.label,
            () => {
              handleClearMapLayerFilter(filter);
            }
          );
        })}
        {canShowGeoFilters &&
          clearPolygon &&
          createFilterTagElement(
            `${selectedFeature}-document-tags`,
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
          createClearAllTagElement(() => {
            handleClearAllClick();
          })}
      </TagRow>
    );
  }
);
