import { TabProps } from '@cognite/cogs.js';

export interface ResourceTabProps<TFilter> extends TabProps {
  query?: string;
  filter?: TFilter;
  defaultFilter?: TFilter;
  isDocumentsApiEnabled?: boolean;
}
