import React, { useState } from 'react';

import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';
import { Point } from '@cognite/seismic-sdk-js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { Asset } from 'modules/map/types';

import Assets from './Assets';
import { Container } from './elements';

export interface Props {
  assets: Asset[];
  zoomToAsset: (center: Point) => void;
}

type Options = 'Assets' | 'Layers' | null;

export const ContentSelector: React.FC<Props> = React.memo(
  ({ assets, zoomToAsset }) => {
    const [selected, setSelected] = useState<Options>(null);

    const metrics = useGlobalMetrics('map');

    const handleClose = () => {
      if (selected !== null) {
        setSelected(null);
      }
    };

    const handleSelectAssets = () => {
      metrics.track('click-select-assets-button', { selected });
      if (selected === 'Assets') {
        setSelected(null);
      } else {
        setSelected('Assets');
      }
    };

    const handleZoomToAsset = (item: Asset) => {
      handleClose();
      zoomToAsset(item.geometry);
    };

    const assetsIcon = selected === 'Assets' ? 'ChevronUp' : 'ChevronDown';

    const { t } = useTranslation('Search');
    const ASSET_TOOLTIP_TEXT = 'Zoom to an asset';

    const renderAssetsButton = React.useMemo(
      () => (
        <Dropdown
          content={<Assets assets={assets} zoomToAsset={handleZoomToAsset} />}
          visible={selected === 'Assets'}
          onClickOutside={handleClose}
        >
          <Tooltip content={t(ASSET_TOOLTIP_TEXT) as string}>
            <Button
              data-testid="map-button-assets"
              type={selected === 'Assets' ? 'primary' : 'ghost'}
              icon={assetsIcon}
              iconPlacement="right"
              onClick={handleSelectAssets}
              aria-label="Map Assets"
              toggled={selected === 'Assets'}
            >
              {t('Assets')}
            </Button>
          </Tooltip>
        </Dropdown>
      ),
      [assetsIcon, assets]
    );

    if (assets.length === 0) {
      return null;
    }

    return <Container>{renderAssetsButton}</Container>;
  }
);
