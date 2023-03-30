import { TabProps } from '@cognite/cogs.js';

import { getChipRightPropsForResourceCounter } from '../../../utils';
import { useAssetsSearchAggregateQuery } from '@data-exploration-lib/domain-layer';
import { CounterTab } from './elements';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';

interface Props extends TabProps {
  query?: string;
  filter?: any;
}

export const AssetsTab = ({ query, filter, ...rest }: Props) => {
  const assetSearchConfig = useGetSearchConfigFromLocalStorage('asset');

  const {
    data: { count },
    isLoading,
  } = useAssetsSearchAggregateQuery(
    {
      assetsFilters: filter,
      query,
    },
    undefined,
    assetSearchConfig
  );

  const chipRightProps = getChipRightPropsForResourceCounter(count, isLoading);

  return <CounterTab label="Assets" {...chipRightProps} {...rest} />;
};
