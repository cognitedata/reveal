import { Detail, Row, Title } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import RecentAssetCard from 'components/explorer/RecentAssetCard';
import NoData from 'components/utils/NoData';
import moment from 'moment';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { RecentAsset, useRecentAssets } from 'hooks/useRecentAssets';

import { NoDataWrapper, RecentAssetsWrapper } from './elements';

export const RecentAssets = () => {
  const history = useHistory();

  const [recentAssets, addToRecentAssets] = useRecentAssets();
  const viewedToday = useMemo(
    () =>
      recentAssets.filter((r: RecentAsset) =>
        moment(r.dateAdded).isSame(new Date(), 'day')
      ),
    [recentAssets]
  );
  const viewedLastSevenDays = useMemo(
    () =>
      recentAssets.filter(
        (r: RecentAsset) =>
          !moment(r.dateAdded).isSame(new Date(), 'day') &&
          moment(r.dateAdded).isSame(new Date(), 'week')
      ),
    [recentAssets]
  );
  const older = useMemo(
    () =>
      recentAssets.filter(
        (r: RecentAsset) => !moment(r.dateAdded).isSame(new Date(), 'week')
      ),
    [recentAssets]
  );

  const onAssetSelect = (asset: Asset) => {
    addToRecentAssets(asset);
    history.push(`/explore/${asset.id}/detail`);
  };

  if (recentAssets.length === 0) {
    return (
      <NoDataWrapper>
        <NoData
          type="Recents"
          message="Your recently viewed assets will appear here."
        />
      </NoDataWrapper>
    );
  }

  return (
    <RecentAssetsWrapper>
      <Title level={4} className="recent-assets--title">
        Recently Viewed
      </Title>
      {viewedToday.length > 0 && (
        <>
          <Detail strong>Today</Detail>
          <Row auto={346}>
            {viewedToday.map(({ asset }) => (
              <RecentAssetCard
                asset={asset}
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
              />
            ))}
          </Row>
        </>
      )}
      {viewedLastSevenDays.length > 0 && (
        <>
          <Detail strong>Last 7 days</Detail>
          <Row auto={346}>
            {viewedLastSevenDays.map(({ asset }) => (
              <RecentAssetCard
                asset={asset}
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
              />
            ))}
          </Row>
        </>
      )}
      {older.length > 0 && (
        <>
          <Detail strong>Older</Detail>
          <Row auto={346}>
            {older.map(({ asset }) => (
              <RecentAssetCard
                asset={asset}
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
              />
            ))}
          </Row>
        </>
      )}
    </RecentAssetsWrapper>
  );
};
