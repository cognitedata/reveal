import { TabProps } from '@cognite/cogs.js';

import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';
import { useAssetsSearchAggregateQuery } from '@data-exploration-lib/domain-layer';
import { CounterTab } from './elements';

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
    isLoading,
  } = useAssetsSearchAggregateQuery({
    assetsFilters: filter,
    query,
  });

  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(count),
    showCount,
    isLoading
  );

  return <CounterTab label="Assets" {...chipRightProps} {...rest} />;
};
