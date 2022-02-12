import { AssetIdEither } from '@cognite/sdk';
import React, { useEffect } from 'react';
import DocumentTab from 'components/explorer/DocumentTab';
import { Icon, Tabs } from '@cognite/cogs.js';
import {
  useAssetBreadcrumbsQuery,
  useAssetRetrieveQuery,
} from 'hooks/useQuery/useAssetQuery';
import Loading from 'components/utils/Loading';
import { NavLink } from 'react-router-dom';

import ThreeDPreview from '../ThreeDPreview';
import EventTab from '../EventTab';
import TimeSeriesTab from '../TimeSeriesTab';
import AssetDetailsTab from '../AssetDetailsTab';

import { AssetTabKey } from './types';
import {
  AssetBreadcrumbsWrapper,
  AssetTabsWrapper,
  AssetTitle,
} from './elements';

export type AssetTabsProps = {
  assetId: AssetIdEither;
  activeTabKey?: AssetTabKey;
  onTabChange?: (nextKey: AssetTabKey) => void;
};

const AssetTabs: React.FC<AssetTabsProps> = ({
  assetId,
  activeTabKey,
  onTabChange,
}) => {
  const currentAssetQuery = useAssetRetrieveQuery([assetId]);
  const currentAsset = currentAssetQuery.data?.[0];

  const assetBreadcrumbsQuery = useAssetBreadcrumbsQuery(
    currentAsset?.parentId ? { id: currentAsset.parentId } : undefined
  );

  useEffect(() => {
    if (currentAssetQuery.isError) {
      // eslint-disable-next-line no-console
      console.error(currentAssetQuery.error);
      return;
    }
    if (assetBreadcrumbsQuery.isError) {
      // eslint-disable-next-line no-console
      console.error(assetBreadcrumbsQuery.error);
    }
  }, [currentAssetQuery.isError, assetBreadcrumbsQuery.isError]);

  if (!currentAsset) {
    return <Loading />;
  }

  const tabs: {
    title: string;
    key: AssetTabKey;
    content: React.ReactElement | null;
  }[] = [
    {
      title: 'Detail',
      key: 'detail',
      content: <AssetDetailsTab assetId={currentAsset.id} />,
    },
    {
      title: 'Documents',
      key: 'documents',
      content: <DocumentTab assetId={currentAsset.id} />,
    },
    {
      title: 'Events',
      key: 'events',
      content: <EventTab assetId={currentAsset.id} />,
    },
    {
      title: '3D',
      key: '3d',
      content: (
        <div style={{ height: '100%' }}>
          <ThreeDPreview assetId={currentAsset.id} />
        </div>
      ),
    },
    {
      title: 'Time Series',
      key: 'timeseries',
      content: <TimeSeriesTab assetId={currentAsset.id} />,
    },
    // Coming soon
    // { title: 'Boards', key: 'boards', content: null },
  ];

  const renderBreadcrumbs = () => {
    if (assetBreadcrumbsQuery.isLoading) {
      return <Icon type="Loader" />;
    }
    if (!assetBreadcrumbsQuery.data) {
      return null;
    }
    return (
      <AssetBreadcrumbsWrapper>
        {assetBreadcrumbsQuery.data
          .slice()
          .reverse()
          .map((asset) => (
            <span key={asset.id}>
              <NavLink
                to={`/explore/${asset.id}${
                  activeTabKey ? `/${activeTabKey}` : ''
                }`}
                className="breadcrumb-item"
              >
                {asset.name}
              </NavLink>
              <span className="breadcrumb-divider">/</span>
            </span>
          ))}
        <span className="breadcrumb-item">{currentAsset?.name}</span>
      </AssetBreadcrumbsWrapper>
    );
  };

  if (currentAssetQuery.isLoading) {
    return (
      <AssetTabsWrapper>
        <Loading />
      </AssetTabsWrapper>
    );
  }

  return (
    <AssetTabsWrapper>
      <>
        <AssetTitle>{currentAsset?.name}</AssetTitle>
        {renderBreadcrumbs()}
        <Tabs
          activeKey={activeTabKey || tabs[0].key}
          onChange={(next) => onTabChange && onTabChange(next as AssetTabKey)}
        >
          {tabs.map((tab) => (
            <Tabs.TabPane tab={tab.title} key={tab.key}>
              {tab.content}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </>
    </AssetTabsWrapper>
  );
};

export default React.memo(AssetTabs);
