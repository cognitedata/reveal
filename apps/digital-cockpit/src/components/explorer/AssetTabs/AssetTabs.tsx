import { InternalId } from '@cognite/sdk';
import React, { useEffect } from 'react';
import DocumentTab from 'components/explorer/DocumentTab';
import { Icon, IconType, Label, Tabs } from '@cognite/cogs.js';
import {
  useAssetBreadcrumbsQuery,
  useAssetRetrieveQuery,
} from 'hooks/useQuery/useAssetQuery';
import Loading from 'components/utils/Loading';
import { NavLink } from 'react-router-dom';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import noop from 'lodash/noop';
import useAssetChildrenAggregates from 'hooks/useQuery/useAssetChildrenAggregates';

import ThreeDPreview from '../ThreeDPreview';
import EventTab from '../EventTab';
import TimeSeriesTab from '../TimeSeriesTab';
import AssetDetailsTab from '../AssetDetailsTab';

import { AssetTabKey } from './types';
import {
  AssetBreadcrumbsWrapper,
  AssetTabsWrapper,
  AssetTitle,
  CountLabel,
} from './elements';

export type AssetTabsProps = {
  assetId: InternalId;
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

  const { data: count } = useAssetChildrenAggregates(assetId.id);

  const assetBreadcrumbsQuery = useAssetBreadcrumbsQuery(
    currentAsset?.parentId ? { id: currentAsset.parentId } : undefined
  );

  const { handleError = noop, trackMetrics = noop } = useCDFExplorerContext();

  useEffect(() => {
    if (currentAssetQuery.isError) {
      handleError(currentAssetQuery.error as Error);
      return;
    }
    if (assetBreadcrumbsQuery.isError) {
      handleError(assetBreadcrumbsQuery.error as Error);
    }
  }, [currentAssetQuery.isError, assetBreadcrumbsQuery.isError]);

  if (!currentAsset) {
    return <Loading />;
  }

  const tabs: {
    title: string;
    icon: IconType;
    key: AssetTabKey;
    content: React.ReactElement | null;
    badge?: React.ReactElement | null;
  }[] = [
    {
      title: 'Detail',
      key: 'detail',
      icon: 'List',
      content: <AssetDetailsTab assetId={currentAsset.id} />,
    },
    {
      title: 'Documents',
      key: 'documents',
      icon: 'Document',
      content: <DocumentTab assetId={currentAsset.id} />,
      badge: count?.files ? (
        <CountLabel size="small">{count?.files.toLocaleString()}</CountLabel>
      ) : null,
    },
    {
      title: 'Events',
      key: 'events',
      icon: 'Events',
      content: <EventTab assetId={currentAsset.id} />,
      badge: count?.events ? (
        <CountLabel size="small">{count?.events.toLocaleString()}</CountLabel>
      ) : null,
    },
    {
      title: '3D',
      key: '3d',
      icon: 'Cube',
      content: (
        <div style={{ height: '100%' }}>
          <ThreeDPreview assetId={currentAsset.id} />
        </div>
      ),
    },
    {
      title: 'Time Series',
      key: 'timeseries',
      icon: 'Timeseries',
      content: <TimeSeriesTab assetId={currentAsset.id} />,
      badge: count?.timeseries ? (
        <CountLabel size="small">
          {count?.timeseries.toLocaleString()}
        </CountLabel>
      ) : null,
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
            <Tabs.TabPane
              tab={
                <>
                  <Icon type={tab.icon} />
                  {tab.title}
                  {tab.badge}
                </>
              }
              key={tab.key}
            >
              {tab.content}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </>
    </AssetTabsWrapper>
  );
};

export default React.memo(AssetTabs);
