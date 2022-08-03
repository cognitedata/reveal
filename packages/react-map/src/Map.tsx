import React, { useState, useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import mapboxgl from 'maplibre-gl';

import { useDrawMode } from './hooks/useDrawMode';
import { useAddSources } from './layers/useAddSources';
import { MapAddedProps, MapProps } from './types';
import { useDeepEffect } from './hooks/useDeep';
import { useFlyTo } from './hooks/useFlyTo';
import { MapContainer } from './elements';
import { FreeDraw } from './FreeDraw';
import { useResizeAware } from './hooks/useResizeAware';
import { useZoomToFeature } from './hooks/useZoomToFeature';
import { Minimap } from './Minimap/Minimap';
import { getMapStyles } from './style';
import { useAddLayers } from './layers/useAddLayers';
import { useLayerEvents } from './events/useLayerEvents';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@cognite/cogs.js/dist/cogs.css';

export const Map: React.FC<React.PropsWithChildren<MapProps>> = ({
  center,
  children,
  disableMinimap,
  drawMode,
  setupEvents,
  features,
  flyTo,
  focusedFeature,
  layerConfigs,
  hideShowNagivationWidth = 80,
  mapIcons,
  maxBounds,
  renderNavigationControls,
  selectedFeature,
  setMapReference,
  layerData,
  zoom,
  initialPolygon,
  MAPBOX_TOKEN,
  MAPBOX_MAP_ID,
}) => {
  const mapRef = useRef<any>();

  const [draw, setDraw] = useState<MapboxDraw>();
  const [map, setMap] = useState<maplibregl.Map>();
  const [selectedFeatures, _setSelectedFeatures] = useState<any[]>([
    selectedFeature,
  ]);
  const [, setNavigation] = useState<boolean | undefined>(false);

  useZoomToFeature({ map, zoomTo: focusedFeature });
  useFlyTo({ map, flyTo });
  useAddSources({ map, layerData });
  useAddLayers({ map, layerConfigs, layerData });
  useLayerEvents({ map, setupEvents });
  useResizeAware({ map, mapRef });
  useDrawMode({
    map,
    draw,
    drawMode,
    selectedFeatures,
  });

  useDeepEffect(() => {
    if (features && features.type && draw) {
      draw.set(features);
    }
  }, [features, draw]);

  React.useEffect(() => {
    if (!mapRef.current) return noop;

    const initializeMap = async (initProps: any) => {
      const { innerSetMap, innerSetDraw, mapContainer } = initProps;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        const mapInstance = new mapboxgl.Map({
          preserveDrawingBuffer: true,
          container: mapContainer.current,
          style: MAPBOX_MAP_ID,
          center,
          zoom,
          maxBounds,
        });

        const miniMap = disableMinimap
          ? undefined
          : new Minimap({ style: MAPBOX_MAP_ID });

        const drawMap = new MapboxDraw({
          userProperties: true,
          displayControlsDefault: false,
          styles: [...getMapStyles()],
          modes: {
            draw_free_polygon: FreeDraw,
            ...MapboxDraw.modes,
          },
          controls: {},
        });

        const scaleControl = new mapboxgl.ScaleControl({ maxWidth: 200 });
        const navigationButtons = new mapboxgl.NavigationControl();

        mapInstance.on('load', () => {
          innerSetMap(mapInstance);
          if (setMapReference) {
            setMapReference(mapInstance);
          }

          if (mapIcons && mapIcons.length) {
            mapIcons.forEach((mapIcon) => {
              mapInstance.addImage(mapIcon.name, mapIcon.icon);
            });
          }

          // @ts-expect-error mapbox vs maplibre
          mapInstance.addControl(drawMap, 'top-right');
          innerSetDraw(drawMap);

          mapInstance.resize();
        });

        mapInstance.on('resize', () => {
          const mapWidth = mapInstance.getCanvasContainer().offsetWidth;

          if (!isUndefined(miniMap)) {
            const miniMapExists = !!miniMap._parentMap; // eslint-disable-line no-underscore-dangle

            if (!miniMapExists && mapWidth > 400) {
              mapInstance.addControl(scaleControl, 'bottom-right');
              mapInstance.addControl(miniMap, 'bottom-left');
            } else if (miniMapExists && mapWidth < 400) {
              mapInstance.removeControl(scaleControl);
              mapInstance.removeControl(miniMap);
            }
          }

          /*
           *
           * This used for memorize and track the updated previousState.
           * since the state is being changing very fast with the resize event
           * and the normal useState is also asynchronous,
           * thus unable to pick the the updated state.
           * so that's why useState has been used in the callback mode
           *
           */
          setNavigation((previousState) => {
            if (mapWidth > hideShowNagivationWidth) {
              mapInstance.addControl(navigationButtons, 'bottom-right');
              return true;
            }
            if (previousState && mapWidth < hideShowNagivationWidth) {
              mapInstance.removeControl(navigationButtons);
              return !previousState;
            }
            return undefined;
          });
        });
      } catch (error) {
        // commonly in jest -> "Error: Failed to initialize WebGL."
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    if (!map) {
      initializeMap({
        innerSetMap: setMap,
        innerSetDraw: setDraw,
        mapContainer: mapRef,
      });
    }

    return noop;
  }, [map, mapRef]);

  const propsToGiveToChildren: MapAddedProps = {
    draw,
    polygon: initialPolygon,
    setDraw,
    selectedFeatures,
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    // Checking isValidElement is the safe way
    // and avoids a typescript error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, propsToGiveToChildren);
    }
    return child;
  });

  return (
    <MapContainer ref={mapRef} data-testid="map-container">
      {renderNavigationControls &&
        renderNavigationControls(mapRef?.current?.offsetWidth)}
      {childrenWithProps}
    </MapContainer>
  );
};
