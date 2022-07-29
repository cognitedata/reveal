import React, { useState, useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import mapboxgl from 'maplibre-gl';
import type { MapboxOptions } from 'maplibre-gl';

import { addLayer, removeLayer } from './layers/addRemoveVisibleLayer';
import {
  MapDataSource,
  MapEvent,
  MapIcon,
  MapAddedProps,
  MapGeometries,
  MapFeature,
  MapFeatureCollection,
} from './types';
import { SelectableLayer } from './layers/types';
import { useDeepEffect } from './hooks/useDeep';
import { MapContainer } from './elements';
import { DrawMode, drawModes, FreeDraw } from './FreeDraw';
import { useZoomToFeature } from './hooks/useZoomToFeature';
import { Minimap } from './Minimap/Minimap';
import { getMapStyles } from './style';
import { choosePreviousSelectedLayer } from './layers/choosePreviousSelectedLayer';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@cognite/cogs.js/dist/cogs.css';

export interface Props {
  center?: MapboxOptions['center'];
  disableMinimap?: boolean;
  drawMode: DrawMode;
  events: MapEvent[];
  features: MapFeatureCollection;
  flyTo: {
    center: number[];
    zoom?: number;
  } | null;
  focusedFeature?: MapFeature;
  layerConfigs: SelectableLayer[];
  layerData: MapDataSource[];
  mapIcons?: MapIcon[];
  maxBounds?: MapboxOptions['maxBounds'];
  renderNavigationControls?: (mapWidth: number) => React.ReactElement;
  selectedFeature?: MapFeature;
  initialPolygon?: MapGeometries;
  setMapReference?: (map: mapboxgl.Map) => void;
  zoom?: MapboxOptions['zoom'];

  MAPBOX_TOKEN: string;
  MAPBOX_MAP_ID: string;
}

/**
 *
 * What is what?
 *
 * sources: the actual from files or geospatial endpoint
 * layers: selections/filters of stuff from the sources to display on the map
 * features: polygons/lines drawn by user to display on the map
 *
 */
export const Map: React.FC<React.PropsWithChildren<Props>> = ({
  center,
  children,
  disableMinimap,
  drawMode,
  events,
  features,
  flyTo,
  focusedFeature,
  layerConfigs,
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

  const [draw, setDraw] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedFeatures, _setSelectedFeatures] = useState<any[]>([]);
  const [, setNavigation] = useState<boolean | undefined>(false);

  const zoomToFeature = useZoomToFeature(map);

  useDeepEffect(() => {
    if (features && features.type && draw) {
      draw.set(features);
    }
  }, [features, draw]);

  useDeepEffect(() => {
    if (map && focusedFeature) {
      zoomToFeature(focusedFeature);
    }
  }, [focusedFeature, zoomToFeature, !!map]);

  React.useEffect(() => {
    if (!mapRef.current) return noop;

    const initializeMap = async (initProps: any) => {
      const { innerSetMap, innerSetDraw, mapContainer } = initProps;
      mapboxgl.accessToken = MAPBOX_TOKEN;

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
         * since the state is being changing very fast with the resize event and the useState also asynchronous,
         * unable to pick the the updated state. so that's why useState has been used in a little bit different way here.
         *
         */
        setNavigation((previousState) => {
          if (mapWidth > 80) {
            mapInstance.addControl(navigationButtons, 'bottom-right');
            return true;
          }
          if (previousState && mapWidth < 80) {
            mapInstance.removeControl(navigationButtons);
            return !previousState;
          }
          return undefined;
        });
      });
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

  // Add zoom if it exists. (note: cannot do zoom:0 with this)
  useDeepEffect(() => {
    if (map && flyTo) {
      let safe = true;

      if (flyTo.center[1] < -90 || flyTo.center[1] > 90) {
        // eslint-disable-next-line no-console
        console.log('Error in y when changing map to:', flyTo);
        safe = false;
      }
      if (flyTo.center[0] < -180 || flyTo.center[0] > 180) {
        // eslint-disable-next-line no-console
        console.log('Error in x when changing map to:', flyTo);
        safe = false;
      }

      if (safe) {
        map.flyTo({
          ...(flyTo.zoom && { zoom: flyTo.zoom }),
          center: [flyTo.center[0], flyTo.center[1]],
        });
      }
    }
  }, [!!map, flyTo]);

  useDeepEffect(() => {
    if (map === null || draw === null) return noop;
    if (selectedFeature && drawMode === drawModes.SIMPLE_SELECT) return noop;
    if (drawMode === drawModes.DIRECT_SELECT) {
      if (selectedFeature) {
        draw.changeMode(drawModes.DIRECT_SELECT, {
          featureId: selectedFeature.id,
        });
      } else {
        draw.changeMode(drawModes.SIMPLE_SELECT);
      }
      return noop;
    }
    const currentDrawmode = draw.getMode();
    if (currentDrawmode !== drawMode || drawMode !== drawModes.SIMPLE_SELECT)
      draw.changeMode(drawMode);

    return noop;
  }, [drawMode, !!draw, selectedFeature]);

  const addSource = (
    mapInstance: mapboxgl.Map,
    id: string,
    data: any,
    clusterProps?: {
      cluster: boolean;
      clusterMaxZoom: number;
      clusterRadius: number;
    }
  ) => {
    if (mapInstance === null) return;
    if (mapInstance.getSource(id) === undefined) {
      mapInstance.addSource(id, {
        type: 'geojson',
        data,
        ...clusterProps,
      });
    } else {
      const source = mapInstance.getSource(id) as mapboxgl.GeoJSONSource;
      source.setData(data);
    }
  };

  useDeepEffect(() => {
    if (map) {
      layerData.forEach((source) => {
        addSource(map, source.id, source.data, source.clusterProps);
      });
    }
  }, [!!map, layerData]);

  useDeepEffect(() => {
    if (map && layerData.length > 0) {
      layerConfigs.forEach((layer, index) => {
        const addLayerBeforeThisLayer = choosePreviousSelectedLayer(
          layerConfigs,
          index
        );

        layer.layers.forEach((innerLayer) => {
          if (layer.selected) {
            addLayer(map, innerLayer, addLayerBeforeThisLayer);
          } else {
            removeLayer(map, innerLayer.id);
          }
        });
      });
    }
  }, [!!map, layerConfigs, layerData]);

  useDeepEffect(() => {
    if (!map) return noop;
    events.forEach((event: MapEvent) => {
      if (event.layers) {
        event.layers.forEach((layer) => {
          map.on(event.type, layer, event.callback);
        });
      } else {
        map.on(event.type, event.callback);
      }
    });

    return () => {
      events.forEach((event: MapEvent) => {
        if (event.layers) {
          event.layers.forEach((layer) => {
            map.off(event.type, layer, event.callback);
          });
        } else {
          map.off(event.type, event.callback);
        }
      });
    };
  }, [!!map, events]);

  useDeepEffect(() => {
    // This is needed to resize the map when the parent container changes size (e.g expanded mode)
    if (map) {
      map.resize();
    }
  }, [mapRef?.current?.offsetWidth]);

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
