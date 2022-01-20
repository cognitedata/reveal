import React, { useState, useEffect, useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import max from 'lodash/max';
import min from 'lodash/min';

import { DocumentPayload } from '@cognite/discover-api-types';

import { NumericRangeFilter } from 'components/filters';
import { useSetDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
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

const DEFAULT_MIN_VALUE = 0;

export const NumericFacetRangeFilter: React.FC<Props> = React.memo(
  ({ title, docQueryFacetType, categoryData, ...rest }) => {
    const appliedFilters = useFilterAppliedFilters();

    const [showApplyButton, setShowApplyButton] = useState(false);
    const [rangeValues, setRangeValues] = useState<number[]>([]);
    const [selectedRange, setSelectedRange] = useState<number[]>([]);
    const setDocumentFilters = useSetDocumentFilters();

    const currentFilterStateFacets =
      appliedFilters.documents[docQueryFacetType];

    useEffect(() => {
      if (isUndefined(categoryData)) return;
      setRangeValues(categoryData.map((category) => Number(category.name)));
    }, [categoryData]);

    useEffect(() => {
      setSelectedRange(map(currentFilterStateFacets, (value) => Number(value)));
    }, [currentFilterStateFacets]);

    const minPageCount =
      useMemo(() => min(rangeValues), [rangeValues]) || DEFAULT_MIN_VALUE;

    const maxPageCount =
      useMemo(() => max(rangeValues), [rangeValues]) || DEFAULT_MIN_VALUE;

    const appliedRange = useMemo(
      () =>
        isEmpty(selectedRange) ? [minPageCount, maxPageCount] : selectedRange,
      [minPageCount, maxPageCount, selectedRange]
    );

    const onFilterRangeChange = (values: number[]) => {
      handleApplyFilters(values);
    };

    const handleApplyFilters = async (values: number[]) => {
      setDocumentFilters({
        ...appliedFilters.documents,
        [docQueryFacetType]: values.map(String),
      });
      setShowApplyButton(false);
    };

    return (
      <FilterCollapse.Panel
        title={title}
        showApplyButton={showApplyButton}
        handleApplyClick={() => {
          handleApplyFilters(selectedRange);
        }}
        {...rest}
      >
        <NumericRangeFilter
          values={[minPageCount, maxPageCount]}
          selectedValues={appliedRange}
          onValueChange={onFilterRangeChange}
          config={{
            editableTextFields: true,
          }}
        />
      </FilterCollapse.Panel>
    );
  }
);
