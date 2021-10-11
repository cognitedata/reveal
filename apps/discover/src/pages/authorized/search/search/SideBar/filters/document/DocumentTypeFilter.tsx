import React from 'react';

import { DEFAULT_FILTER_ITEM_LIMIT } from 'modules/documentSearch/constants';
import { useFacets } from 'modules/documentSearch/selectors';

import { CheckboxFilter } from '../../components/CheckboxFilter';
import { FilterPayload } from '../../types';

export const DocumentTypeFilter: React.FC<FilterPayload> = React.memo(
  ({ title, data, category, ...rest }) => {
    const { labels } = useFacets(); // redux

    return (
      <CheckboxFilter
        title={title}
        category={category}
        docQueryFacetType="labels"
        categoryData={data}
        resultFacets={labels}
        defaultNumberOfItemsToDisplay={DEFAULT_FILTER_ITEM_LIMIT}
        {...rest}
      />
    );
  }
);
