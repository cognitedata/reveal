import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { useAssetsSearchAggregateQuery } from '@data-exploration-lib/domain-layer';

import { TabProps } from '@cognite/cogs.js';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';

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
    assetSearchConfig
  );

  const chipRightProps = getChipRightPropsForResourceCounter(count, isLoading);

  return <CounterTab label="Assets" {...chipRightProps} {...rest} />;
};
