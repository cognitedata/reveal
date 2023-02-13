import { Tabs } from '@cognite/cogs.js';

import { getTabCountLabel } from '@data-exploration-components/utils';

import { ResourceTabProps } from './types';
import {
  useDocumentFilteredAggregateCount,
  MORE_THAN_MAX_RESULT_LIMIT,
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
} from '@data-exploration-lib/domain-layer';

// This is FilesTab with counts when advanced filters are enabled!
export const DocumentsTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data: filteredDocumentCount = 0 } = useDocumentFilteredAggregateCount(
    { filters: filter, query }
  );

  const count =
    filteredDocumentCount > DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredDocumentCount;
  const chipRightProps = showCount
    ? { chipRight: { label: getTabCountLabel(count), size: 'x-small' } }
    : {};

  return <Tabs.Tab label="Files" {...chipRightProps} {...rest} />;
};
