import { Button, Title } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { FileSidebar } from './elements/FileSidebar';
import { Header } from './elements/Header';
import { LinkedAssetList } from './elements/LinkedAssetList';
import LinkedAsset from './LinkedAsset';

const defaultTranslations = makeDefaultTranslations(
  'Linked assets',
  'Exact match on external id',
  'View all'
);

type Props = {
  onClose: () => void;
  assets: {
    asset: ComponentProps<typeof LinkedAsset>['asset'];
    loading: ComponentProps<typeof LinkedAsset>['loading'];
    timeseries: ComponentProps<typeof LinkedAsset>['timeseries'];
    loadingTimeseries: ComponentProps<typeof LinkedAsset>['loadingTimeseries'];
  }[];
  onAssetClick: ComponentProps<typeof LinkedAsset>['onAssetClick'];
  onTimeSeriesClick: ComponentProps<typeof LinkedAsset>['onTimeSeriesClick'];
  onPAndIDClick: ComponentProps<typeof LinkedAsset>['onPAndIDClick'];
  title: string;
  highlight: string;
  exactMatchLabel: ComponentProps<typeof LinkedAsset>['exactMatchLabel'];
  viewAllLabel: ComponentProps<typeof LinkedAsset>['viewAllLabel'];
};

function LinkedAssetsSidebar({
  onClose,
  assets,
  highlight,
  onAssetClick,
  onTimeSeriesClick,
  onPAndIDClick,
  title = defaultTranslations['Linked assets'],
  exactMatchLabel = defaultTranslations['Exact match on external id'],
  viewAllLabel = defaultTranslations['View all'],
}: Props) {
  return (
    <FileSidebar>
      <Header>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={4}>{title}</Title>
          <Button
            type="ghost"
            icon="Close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      </Header>
      <LinkedAssetList>
        {assets.map((asset) => (
          <LinkedAsset
            key={asset.asset?.id}
            asset={asset.asset}
            timeseries={asset.timeseries}
            highlight={highlight}
            onAssetClick={onAssetClick}
            onTimeSeriesClick={onTimeSeriesClick}
            onPAndIDClick={onPAndIDClick}
            loading={asset.loading}
            loadingTimeseries={asset.loadingTimeseries}
            exactMatchLabel={exactMatchLabel}
            viewAllLabel={viewAllLabel}
          />
        ))}
      </LinkedAssetList>
    </FileSidebar>
  );
}

LinkedAssetsSidebar.translationNamespace = 'LinkedAssetsSidebar';
LinkedAssetsSidebar.defaultTranslations = defaultTranslations;
LinkedAssetsSidebar.translationKeys = translationKeys(defaultTranslations);

export default LinkedAssetsSidebar;
