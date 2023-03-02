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
}

export const AssetsTab = ({ query, filter, ...rest }: Props) => {
  const {
    data: { count },
    isLoading,
  } = useAssetsSearchAggregateQuery({
    assetsFilters: filter,
    query,
  });

  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(count),
    isLoading
  );

  return <CounterTab label="Assets" {...chipRightProps} {...rest} />;
};
