import React, { useState } from 'react';

import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';
import { SelectableLayer } from '@cognite/react-map';
import { Point } from '@cognite/seismic-sdk-js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { Asset } from 'modules/map/types';

import { useLayers } from '../hooks/useLayers';

import Assets from './Assets';
import { Container } from './elements';
import Layers from './Layers';

export interface Props {
  assets: Asset[];
  zoomToAsset: (center: Point) => void;
  layers: SelectableLayer[];
}

type Options = 'Assets' | 'Layers' | null;

export const ContentSelector: React.FC<Props> = React.memo(
  ({ assets, zoomToAsset, layers }) => {
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

    const handleSelectLayers = () => {
      metrics.track('click-select-layers-button', { selected });
      if (selected === 'Layers') {
        setSelected(null);
      } else {
        setSelected('Layers');
      }
    };

    const handleZoomToAsset = (item: Asset) => {
      handleClose();
      zoomToAsset(item.geometry);
    };
    const { allLayers } = useLayers();

    const assetsIcon = selected === 'Assets' ? 'ChevronUp' : 'ChevronDown';
    const layersIcon = selected === 'Layers' ? 'ChevronUp' : 'ChevronDown';

    const { t } = useTranslation('Search');
    const ASSET_TOOLTIP_TEXT = 'Zoom to an asset';
    const LAYER_TOOLTIP_TEXT = 'Toggle layers';

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

    const renderLayersButton = React.useMemo(
      () => (
        <Dropdown
          content={<Layers layers={layers} />}
          visible={selected === 'Layers'}
          onClickOutside={handleClose}
        >
          <Tooltip content={t(LAYER_TOOLTIP_TEXT) as string}>
            <Button
              type={selected === 'Layers' ? 'primary' : 'ghost'}
              icon={layersIcon}
              iconPlacement="right"
              data-testid="map-button-layers"
              onClick={handleSelectLayers}
              aria-label="Layers"
              toggled={selected === 'Layers'}
            >
              {t('Layers')}
            </Button>
          </Tooltip>
        </Dropdown>
      ),
      [layersIcon, allLayers, layers]
    );

    return (
      <>
        <Container>{renderAssetsButton}</Container>
        <Container>{renderLayersButton}</Container>
      </>
    );
  }
);
