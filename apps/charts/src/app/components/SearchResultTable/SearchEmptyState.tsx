import React, { ComponentProps } from 'react';

import { Timeseries } from '@cognite/sdk';

import { useRootAssets, useRootTimeseries } from '../../hooks/cdf-assets';

import AssetSearchHit from './AssetSearchHit';
import RecentViewSources from './RecentViewSources';
import { AssetList } from './SearchResultList';

type renderTimeSeries = (timeseries: Timeseries[]) => React.ReactNode;

interface Props {
  viewType: ComponentProps<typeof RecentViewSources>['viewType'];
  renderTimeSeries: renderTimeSeries;
}

const AssetsEmptyState = () => {
  const { data } = useRootAssets();
  const searchResultElements = data?.map((asset) => (
    <li key={asset.id}>
      <AssetSearchHit asset={asset} />
    </li>
  ));
  return <AssetList>{searchResultElements}</AssetList>;
};

const TimeseriesEmptyState = ({
  renderTimeSeries,
}: {
  renderTimeSeries: renderTimeSeries;
}) => {
  const { data } = useRootTimeseries();
  if (!data) return null;
  return <>{renderTimeSeries(data as Timeseries[])}</>;
};

const SearchEmptyState = ({ viewType, renderTimeSeries }: Props) => {
  if (viewType === 'assets') {
    return <AssetsEmptyState />;
  }
  return <TimeseriesEmptyState renderTimeSeries={renderTimeSeries} />;
};

export default SearchEmptyState;
