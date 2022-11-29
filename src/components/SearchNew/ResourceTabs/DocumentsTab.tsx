import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useDocumentFilteredAggregateCount } from '@cognite/react-document-search';
import { useObserveDocumentSearchFilters } from 'domain/documents';
import {
  MORE_THAN_MAX_RESULT_LIMIT,
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
} from 'domain/constants';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from 'utils';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const DocumentsTab = ({ query, filter, showCount = false }: Props) => {
  const { data: filteredDocumentCount = 0 } =
    useDocumentFilteredAggregateCount();
  useObserveDocumentSearchFilters(query!, filter);

  const count =
    filteredDocumentCount > DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredDocumentCount;
  return (
    <TabContainer>
      <ResourceTypeTitle>{'Documents'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {getTabCountLabel(count)}
        </Label>
      )}
    </TabContainer>
  );
};
