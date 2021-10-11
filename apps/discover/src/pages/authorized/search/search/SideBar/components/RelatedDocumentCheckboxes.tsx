import React, { useEffect, useState } from 'react';

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { DocumentPayload } from 'modules/api/documents/types';
import { useQuerySavedSearchRelatedDocuments } from 'modules/api/savedSearches/useQuery';
import {
  DocumentQueryFacet,
  DocumentQueryFacets,
} from 'modules/documentSearch/types';
import { useSetRelatedDocumentFilters } from 'modules/filterData/hooks/useSetRelatedDocumentFilters';
import {
  Checkboxes,
  CheckboxState,
} from 'pages/authorized/search/search/SideBar/components/Checkboxes';

interface Props {
  categoryData: DocumentPayload[];
  resultFacets: DocumentQueryFacet[];
  docQueryFacetType: Exclude<keyof DocumentQueryFacets, 'lastmodified'>;
}

const extractSelectedFiltersName = (
  filter: CheckboxState[],
  forceNameUsage = false
) => {
  const extractedFilters = filter
    .filter((item) => item.selected)
    .map((item) => (forceNameUsage ? item.name : item.id || item.name));
  return extractedFilters;
};

export const RelatedDocumentCheckBoxes: React.FC<Props> = (props) => {
  const { categoryData, resultFacets, docQueryFacetType } = props;

  const [activeFilters, setFilters] = useState<CheckboxState[]>([]);
  const setRelatedDocumentFilters = useSetRelatedDocumentFilters();
  const { data } = useQuerySavedSearchRelatedDocuments();
  const query = get(data, 'query');
  const facets = get(data, 'filters.documents.facets');

  const currentFilterStateFacets = (): string[] => {
    if (!facets) return [];
    return facets[docQueryFacetType] || [];
  };

  const search = (filters: CheckboxState[]) => {
    // map the filters, because we need the special format for labels accepted
    let value: string[] | { externalId: string }[] =
      extractSelectedFiltersName(filters);

    // map it going out so we save the right query in the api
    if (docQueryFacetType === 'labels') {
      value = value.map((id) => ({ externalId: id }));
    }

    // const resultedFacets = {
    //   ...facets,
    //   labels: [],
    //   [docQueryFacetType]: value,
    // };

    setRelatedDocumentFilters(
      {
        ...facets,
        [docQueryFacetType]: value,
      },
      query
    );
  };

  const isFilterItemPersistentlySelected = (item: DocumentPayload) => {
    return currentFilterStateFacets().some((currentFacet) => {
      if (!currentFacet) {
        return false;
      }

      // @ts-expect-error hack cause type is wrong
      if (currentFacet.externalId) {
        // @ts-expect-error hack cause type is wrong
        return currentFacet.externalId === item.id;
      }

      return currentFacet === item.name;
    });
  };

  const transformAddSelectedAndIncludeStateInfo = () => {
    return categoryData.reduce(
      (accumulator: CheckboxState[], item: DocumentPayload) => {
        if (!item) {
          return accumulator;
        }

        const isFilterItemSelected = isFilterItemPersistentlySelected(item);

        return [
          ...accumulator,
          {
            ...item,
            selected: isFilterItemSelected,
          },
        ];
      },
      []
    );
  };

  useEffect(() => {
    if (!categoryData) {
      return;
    }

    const transformSelectedStateInfo =
      transformAddSelectedAndIncludeStateInfo();

    if (!isEqual(transformSelectedStateInfo, activeFilters)) {
      setFilters(transformSelectedStateInfo);
    }
  }, []);

  const handleSelectedFilterSelection = async (data: string[]) => {
    const resultFilters: CheckboxState[] = activeFilters.map((f) => {
      return { ...f, selected: data.includes(f.name) };
    });
    setFilters(resultFilters);

    await search(resultFilters);
  };

  const hideResultsCount = true;
  return (
    <Checkboxes
      data={activeFilters}
      onValueChange={handleSelectedFilterSelection}
      resultFacets={resultFacets}
      hideResultsCount={hideResultsCount}
    />
  );
};
