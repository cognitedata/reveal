import * as React from 'react';

import { useDocumentResultFacets } from 'modules/documentSearch/hooks/useDocumentResultFacets';
import { FilterPayload } from 'pages/authorized/search/search/SideBar/types';

import { NumericFacetRangeFilter } from '../../components/NumericRangeFilter';

export const PageCountFilter: React.FC<FilterPayload> = React.memo(
  ({ title, data, category, ...rest }) => {
    const { pageCount } = useDocumentResultFacets();

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
