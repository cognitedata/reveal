import { Timeseries } from '@cognite/sdk';
import AssetSearchHit from 'components/SearchResultTable/AssetSearchHit';
import { AssetList } from 'components/SearchResultTable/SearchResultList';
import { useRootAssets, useRootTimeseries } from 'hooks/cdf-assets';
import React, { ComponentProps } from 'react';
import RecentViewSources from './RecentViewSources';

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
