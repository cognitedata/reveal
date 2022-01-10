import React from 'react';

import { openInNewTab } from 'utils/openInNewTab';

import { Body, Button, Menu } from '@cognite/cogs.js';

import { useExternalLinksConfig } from 'hooks/useExternalLinksConfig';
import { Asset } from 'modules/map/types';
import { WELL_FIELDS_WITH_PRODUCTION_DATA } from 'modules/wellSearch/constants';

import { AssetListItem, AssetListItemContainer } from './elements';

interface Props {
  assets: Asset[];
  zoomToAsset: (asset: Asset) => void;
}

const Item = ({
  asset,
  zoomToAsset,
}: {
  asset: Asset;
  zoomToAsset: (asset: Asset) => void;
}) => {
  const handleZoomtoAsset = () => {
    zoomToAsset(asset);
  };
  const tenantConfigExternalLinks = useExternalLinksConfig();

  const links =
    tenantConfigExternalLinks && tenantConfigExternalLinks.hasProductionData
      ? [tenantConfigExternalLinks.hasProductionData(asset.name)]
      : [];

  return (
    <AssetListItemContainer>
      <AssetListItem
        onClick={handleZoomtoAsset}
        data-testid={`asset-${asset.name}`}
      >
        <Body level={2} as="span">
          {asset.name}
        </Body>
      </AssetListItem>
      {WELL_FIELDS_WITH_PRODUCTION_DATA.includes(asset.name) && (
        <Button
          icon="ArrowUpRight"
          type="link"
          aria-label="Open an external dashboard"
          onClick={(event) => openInNewTab(event, links)}
        />
      )}
    </AssetListItemContainer>
  );
};

export const QuickAssetNavigation: React.FC<Props> = ({
  assets,
  zoomToAsset,
}) => {
  return (
    <Menu>
      {assets.map((asset) => {
        return (
          <Menu.Item key={`asset-${asset.name}`}>
            <Item
              key={`asset-${asset.name}`}
              zoomToAsset={zoomToAsset}
              asset={asset}
            />
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default QuickAssetNavigation;
