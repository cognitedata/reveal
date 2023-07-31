import * as React from 'react';

import { DEFAULT_FILTER_ITEM_LIMIT } from 'modules/documentSearch/constants';

import { FilterPayload } from '../../types';

import { CheckboxFilter } from './CheckboxFilter';

export const FileTypeFilter: React.FC<FilterPayload> = React.memo(
  ({ title, data, category, ...rest }) => {
    return (
      <CheckboxFilter
        title={title}
        category={category}
        docQueryFacetType="fileCategory"
        categoryData={data}
        defaultNumberOfItemsToDisplay={DEFAULT_FILTER_ITEM_LIMIT}
        {...rest}
      />
    );
  }
);
