import * as React from 'react';
import ReactDOM from 'react-dom';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@cognite/cogs.js/dist/cogs.css';

import { useDrawMode } from './hooks/useDrawMode';
import { useAddSources } from './layers/useAddSources';
import { MapAddedProps, MapFeature, MapProps } from './types';
import { useFlyTo } from './hooks/useFlyTo';
import { MapContainer } from './elements';
import { useResizeAware } from './hooks/useResizeAware';
import { useZoomToFeature } from './hooks/useZoomToFeature';
import { useAddLayers } from './layers/useAddLayers';
import { useLayerEvents } from './events/useLayerEvents';
import { useMapSetup } from './hooks/useMapSetup';
import { UnmountConfirmation } from './UnmountConfirmation';
import { useUserDrawnFeatures } from './hooks/useUserDrawnFeatures';

export const Map: React.FC<MapProps> = ({
  center,
  disableMinimap,
  disableUnmountConfirmation,
  extrasRef,
  ExtraContent,
  setupEvents,
  flyTo,
  focusedFeature,
  layerConfigs,
  hideShowNagivationWidth = 80,
  mapIcons,
  maxBounds,
  renderWithWidth,
  renderChildren,
  selectedFeature,
  setMapReference,
  layerData,
  zoom,
  initialDrawnFeatures,
  MAPBOX_TOKEN,
  MAPBOX_MAP_ID,
}) => {
  const [selectedFeatures, setSelectedFeatures] = React.useState<MapFeature[]>(
    selectedFeature ? [selectedFeature] : []
  );
  const { map, mapRef, draw } = useMapSetup({
    center,
    zoom,
    maxBounds,
    setMapReference,
    disableMinimap,
    mapIcons,
    hideShowNagivationWidth,
    MAPBOX_TOKEN,
    MAPBOX_MAP_ID,
  });
  const { drawnFeatures, setDrawnFeatures } = useUserDrawnFeatures({
    draw,
    initialDrawnFeatures,
  });
  useZoomToFeature({ map, zoomTo: focusedFeature });
  useFlyTo({ map, flyTo });
  useAddSources({ map, layerData });
  useAddLayers({ map, layerConfigs, layerData });
  const { drawMode, setDrawMode } = useDrawMode({
    map,
    draw,
    selectedFeatures,
  });
  useLayerEvents({
    map,
    setupEvents,
    setDrawnFeatures,
    setSelectedFeatures,
    setDrawMode,
  });
  useResizeAware({ map, mapRef });

  const propsToGiveToChildren: MapAddedProps = {
    map,
    drawMode,
    setDrawMode,
    drawnFeatures,
    setDrawnFeatures,
    selectedFeatures,
    setSelectedFeatures,
  };

  return (
    <>
      {extrasRef &&
        ReactDOM.createPortal(
          <>
            {!disableUnmountConfirmation && (
              <UnmountConfirmation
                map={map}
                drawMode={drawMode}
                setDrawMode={setDrawMode}
              />
            )}
            {ExtraContent && <ExtraContent {...propsToGiveToChildren} />}
          </>,
          extrasRef
        )}

      <MapContainer ref={mapRef} data-testid="map-container">
        {renderWithWidth && renderWithWidth(mapRef?.current?.offsetWidth)}
        {renderChildren && renderChildren(propsToGiveToChildren)}
      </MapContainer>
    </>
  );
};
