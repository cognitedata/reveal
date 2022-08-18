import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Actions, MapAddedProps, SelectableLayer } from '@cognite/react-map';
import { Point } from '@cognite/seismic-sdk-js';

import { toggleLayer } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { MapDataSource } from 'modules/map/types';
import { FlexGrow } from 'styles/layout';

import { useSelectedLayers } from '../hooks';
import { useLayers } from '../hooks/useLayers';
import { ContentSelector } from '../map-overlay-actions';
// import { SearchableAssetsOverlay } from '../map-overlay-actions/SearchableAssetsOverlay';

interface Props {
  mapAddedProps: MapAddedProps;
  sources: MapDataSource[];
  onQuickSearchSelection: (selection: unknown) => void;
  zoomToAsset: (point: Point, changeZoom?: number | false) => void;
}
export const PolygonBar: React.FC<Props> = ({
  // sources,
  // onQuickSearchSelection,
  zoomToAsset,
  mapAddedProps,
}) => {
  const { selectedLayers: selected, assets } = useMap();
  const dispatch = useDispatch();

  const { selectableLayers } = useLayers();

  // add selected status to layers from redux
  const layersWithUpdatedSelectedStatus = useSelectedLayers(
    selectableLayers,
    selected
  );
  const handleLayerToggle = (item: SelectableLayer) => {
    dispatch(toggleLayer(item));
  };

  const renderChildren = (props: MapAddedProps) => {
    return (
      <>
        <Actions.Status {...props} />
        <FlexGrow />
        <Actions.Polygon {...props} />
        {/* 
        <SearchableAssetsOverlay
          sources={sources}
          onQuickSearchSelection={onQuickSearchSelection}
        />
      */}
        <ContentSelector zoomToAsset={zoomToAsset} assets={assets} />
        <Actions.LayersButton
          {...props}
          layers={layersWithUpdatedSelectedStatus}
          onChange={handleLayerToggle}
        />
      </>
    );
  };

  return <Actions.Wrapper renderChildren={renderChildren} {...mapAddedProps} />;
};
