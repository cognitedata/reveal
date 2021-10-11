import React from 'react';

import { DEFAULT_FILTER_ITEM_LIMIT } from 'modules/documentSearch/constants';
import { useFacets } from 'modules/documentSearch/selectors';

import { CheckboxFilter } from '../../components/CheckboxFilter';
import { FilterPayload } from '../../types';

export const SourceFilter: React.FC<FilterPayload> = React.memo(
  ({ title, data, category, ...rest }) => {
    const { location } = useFacets();
    return (
      <CheckboxFilter
        title={title}
        docQueryFacetType="location"
        category={category}
        categoryData={data}
        resultFacets={location}
        defaultNumberOfItemsToDisplay={DEFAULT_FILTER_ITEM_LIMIT}
        {...rest}
      />
    );
  }
);
