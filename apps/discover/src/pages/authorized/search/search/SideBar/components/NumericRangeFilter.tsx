import React, { useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { useSetDocumentFilters } from 'services/savedSearches/hooks/useClearDocumentFilters';

import { DocumentPayload } from '@cognite/discover-api-types';

import { NumericRangeFilter } from 'components/Filters';
import { useDeepEffect } from 'hooks/useDeep';
import {
  DocumentQueryFacet,
  DocumentQueryFacets,
} from 'modules/documentSearch/types';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';

import { FilterCollapse } from './FilterCollapse';

interface Props {
  title: string;
  docQueryFacetType: Extract<keyof DocumentQueryFacets, 'pageCount'>;
  categoryData: DocumentPayload[];
  category: CategoryTypes;
  resultFacets: DocumentQueryFacet[];
}

const DEFAULT_MIN_VALUE = 1;

export const NumericFacetRangeFilter: React.FC<Props> = React.memo(
  ({ title, docQueryFacetType, categoryData, ...rest }) => {
    const appliedFilters = useFilterAppliedFilters();

    const [rangeValues, setRangeValues] = useState<number[] | undefined>(
      undefined
    );
    const [selectedRange, setSelectedRange] = useState<number[] | undefined>(
      undefined
    );
    const setDocumentFilters = useSetDocumentFilters();

    const currentFilterStateFacets =
      appliedFilters.documents[docQueryFacetType];

    useDeepEffect(() => {
      if (isUndefined(categoryData)) return;

      const min = minBy(categoryData, (item) => Number(item.name));
      const max = maxBy(categoryData, (item) => Number(item.name));

      setRangeValues([
        Number(min?.name) || DEFAULT_MIN_VALUE,
        Number(max?.name) || DEFAULT_MIN_VALUE,
      ]);
    }, [categoryData]);

    useDeepEffect(() => {
      if (currentFilterStateFacets.length === 2) {
        setSelectedRange(
          map(currentFilterStateFacets, (value) => Number(value))
        );
      } else {
        setSelectedRange(undefined);
      }
    }, [currentFilterStateFacets]);

    const onFilterRangeChange = (values: number[]) => {
      handleApplyFilters(values);
    };

    const handleApplyFilters = async (values: number[]) => {
      setDocumentFilters({
        ...appliedFilters.documents,
        [docQueryFacetType]: values.map(String),
      });
    };

    return (
      <FilterCollapse.Panel title={title} showApplyButton={false} {...rest}>
        {rangeValues ? (
          <NumericRangeFilter
            selectedValues={selectedRange}
            onValueChange={onFilterRangeChange}
            config={{
              editableTextFields: true,
            }}
            min={rangeValues[0]}
            max={rangeValues[1]}
          />
        ) : null}
      </FilterCollapse.Panel>
    );
  }
);
