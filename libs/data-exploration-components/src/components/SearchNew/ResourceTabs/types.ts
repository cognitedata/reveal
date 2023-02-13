import { TabProps } from '@cognite/cogs.js';

export interface ResourceTabProps extends TabProps {
  query?: string;
  filter?: any;
  showCount?: boolean;
}
