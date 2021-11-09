import React from 'react';

import { useFacets } from 'modules/documentSearch/selectors';
import { FilterPayload } from 'pages/authorized/search/search/SideBar/types';

import { NumericFacetRangeFilter } from '../../components/NumericRangeFilter';

export const PageCountFilter: React.FC<FilterPayload> = React.memo(
  ({ title, data, category, ...rest }) => {
    const { pageCount } = useFacets();

    return (
      <NumericFacetRangeFilter
        title={title}
        category={category}
        docQueryFacetType="pageCount"
        categoryData={data}
        resultFacets={pageCount}
        {...rest}
      />
    );
  }
);
