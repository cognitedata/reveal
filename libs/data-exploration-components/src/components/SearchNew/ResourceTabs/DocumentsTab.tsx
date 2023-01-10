import React from 'react';
import { Label } from '@cognite/cogs.js';

import {
  MORE_THAN_MAX_RESULT_LIMIT,
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
} from '@data-exploration-lib/domain-layer';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from '@data-exploration-components/utils';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

// This is FilesTab with counts when advanced filters are enabled!
export const DocumentsTab = ({ query, filter, showCount = false }: Props) => {
  const { data: filteredDocumentCount = 0 } = useDocumentFilteredAggregateCount(
    { filters: filter, query }
  );

  const count =
    filteredDocumentCount > DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredDocumentCount;
  return (
    <TabContainer>
      <ResourceTypeTitle>Files</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {getTabCountLabel(count)}
        </Label>
      )}
    </TabContainer>
  );
};
