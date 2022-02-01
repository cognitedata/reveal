import { Asset, AssetIdEither } from '@cognite/sdk';
import React, { useEffect, useState } from 'react';
import DocumentTab from 'components/explorer/DocumentTab';
import { Icon, Tabs } from '@cognite/cogs.js';
import {
  useAssetBreadcrumbsQuery,
  useAssetRetrieveQuery,
} from 'hooks/useQuery/useAssetQuery';
import Loading from 'components/utils/Loading';

import { AssetTabKey } from './types';
import {
  AssetBreadcrumbsWrapper,
  AssetTabsWrapper,
  AssetTitle,
} from './elements';

export type AssetTabsProps = {
  assetId: AssetIdEither;
};

const AssetTabs: React.FC<AssetTabsProps> = ({ assetId }) => {
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

  const tabs: {
    title: string;
    key: AssetTabKey;
    content: React.ReactElement | null;
  }[] = [
    {
      title: 'Detail',
      key: 'detail',
      content: null,
    },
    {
      title: 'Documents',
      key: 'documents',
      content: <DocumentTab assetId={currentAsset?.id as number} />,
    },
    { title: 'Events', key: 'events', content: null },
    { title: '3D', key: '3d', content: null },
    { title: 'Time Series', key: 'timeseries', content: null },
    { title: 'Boards', key: 'boards', content: null },
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
          .map((asset, index, { length }) => (
            <span key={asset.id}>
              <span className="breadcrumb-item">{asset.name}</span>
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
        <Tabs>
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
