import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';

import { ResourceTabProps } from './types';
import {
  useDocumentFilteredAggregateCount,
  MORE_THAN_MAX_RESULT_LIMIT,
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
} from '@data-exploration-lib/domain-layer';
import { CounterTab } from './elements';

// This is FilesTab with counts when advanced filters are enabled!
export const DocumentsTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data: filteredDocumentCount = 0, isLoading } =
    useDocumentFilteredAggregateCount({ filters: filter, query });

  const count =
    filteredDocumentCount > DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT
      ? MORE_THAN_MAX_RESULT_LIMIT
      : filteredDocumentCount;
  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(count),
    showCount,
    isLoading
  );

  return <CounterTab label="Files" {...chipRightProps} {...rest} />;
};
