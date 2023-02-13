import { TabProps, Tabs } from '@cognite/cogs.js';

import { getTabCountLabel } from '@data-exploration-components/utils';
import { useAssetsSearchAggregateQuery } from '@data-exploration-lib/domain-layer';

interface Props extends TabProps {
  query?: string;
  filter?: any;
  showCount?: boolean;
}

export const AssetsTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: Props) => {
  const {
    data: { count },
  } = useAssetsSearchAggregateQuery({
    assetsFilters: filter,
    query,
  });

  const chipRightProps = showCount
    ? { chipRight: { label: getTabCountLabel(count), size: 'x-small' } }
    : {};

  return <Tabs.Tab label="Assets" {...chipRightProps} {...rest} />;
};
