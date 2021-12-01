import React, { useState, useEffect, useRef, useCallback } from 'react';

import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import { FeatureCollection, Feature } from '@turf/helpers';
import noop from 'lodash/noop';
import mapboxgl from 'maplibre-gl';

import { GeoJson } from '@cognite/seismic-sdk-js';

import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from 'modules/map/constants';
import { useMapConfig } from 'modules/map/hooks/useMapConfig';
import { SelectableLayer, MapDataSource, DrawMode } from 'modules/map/types';
import { useMapContext } from 'modules/map/useMapCache';
import { MapLayer } from 'tenants/types';

import {
  OIL_GAS_PATTERN,
  GAS_CONDENSATE_PATTERN,
  SURFACE_FACILITY_ICON,
  SUBSURFACE_FACILITY_ICON,
} from './constants';
import { MapContainer } from './elements';
import { FreeDraw } from './FreeDraw';
import {
  surfacefacilityImage,
  subsurfacefacilityImage,
} from './icons/facility';
import { Minimap } from './minimap/Minimap';
import { oilgasImage, gascondensateImage } from './patterns/fields';
import { getMapStyles } from './style';
import { choosePreviousSelectedLayer } from './utils/layers';

/**
 * This should be a GENERIC map file
 * no app specific code is to go in here
 */

export interface MapEvent {
  type: string;
  layers?: string[];
  callback: any;
}

export interface MapIcon {
  name: string;
  icon: HTMLImageElement;
}

interface Props {
  drawMode: DrawMode;
  events: MapEvent[];
  features: FeatureCollection;
  flyTo: {
    zoom: number;
    center: number[];
  } | null;
  focusedFeature: Feature | null;
  layers: SelectableLayer[];
  renderNavigationControls?: (mapWidth: number) => void;
  selectedFeature: GeoJson | null;
  sources: MapDataSource[];
  setMapReference?: any;
  mapIcons?: MapIcon[];
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
export const Map: React.FC<Props> = React.memo(
  ({
    setMapReference,
    drawMode,
    events,
    features,
    flyTo,
    focusedFeature,
    layers,
    renderNavigationControls,
    selectedFeature,
    sources,
    mapIcons,
  }) => {
    const mapRef = useRef<any>();

    const [draw, setDraw] = useState<any>(null);
    const [map, setMap] = useState<any>(null);

    const [mapStateSettings] = useMapContext();
    const { data: mapSettings } = useMapConfig();

    const zoomToFeature = useCallback(
      (feature: any) => {
        if (!map) return;
        if (!feature) return;
        const geo = feature.geometry || feature.geoJson;
        if (!geo) return;

        const fitToBounds = (coordinates: any) => {
          if (coordinates) {
            try {
              const bounds = coordinates.reduce((result: any, coord: any) => {
                return result.extend(coord);
              }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
              map.fitBounds(bounds, {
                padding: 20,
                maxZoom: 8,
              });
            } catch (error) {
              console.error(error);
            }
          }
        };
        if (geo.type === 'Polygon') {
          fitToBounds(geo.coordinates[0]);
        } else if (geo.type === 'MultiPolygon') {
          fitToBounds(geo.coordinates[0][0]);
        } else if (geo.type === 'MultiLineString') {
          fitToBounds(geo.coordinates);
        } else if (geo.type === 'GeometryCollection') {
          zoomToFeature({ geometry: geo.geometries[0] });
        } else {
          console.error('Unknown feature type, geo', geo);
        }
      },
      [map]
    );

    useEffect(() => {
      if (features && draw) {
        draw.set(features);
      }
    }, [features, draw]);

    useEffect(() => {
      if (map && focusedFeature) {
        zoomToFeature(focusedFeature);
      }
    }, [focusedFeature, zoomToFeature, map]);

    useEffect(() => {
      if (!mapRef.current) return noop;

      const initializeMap = async (initProps: any) => {
        const { innerSetMap, innerSetDraw, mapContainer } = initProps;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const mapInstance = new mapboxgl.Map({
          preserveDrawingBuffer: true,
          container: mapContainer.current,
          style: MAPBOX_MAP_ID,
          center:
            mapStateSettings?.center ||
            (mapSettings?.center as mapboxgl.MapboxOptions['center']),
          zoom: mapStateSettings?.zoom || mapSettings?.zoom,
          maxBounds:
            mapSettings?.maxBounds as mapboxgl.MapboxOptions['maxBounds'],
        });

        const miniMap = new Minimap();

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

        const oilgasPattern = new Image();
        oilgasPattern.src = oilgasImage;

        const gascondensatePattern = new Image();
        gascondensatePattern.src = gascondensateImage;

        const surfacefacilityIcon = new Image();
        surfacefacilityIcon.src = surfacefacilityImage;

        const subsurfacefacilityIcon = new Image();
        subsurfacefacilityIcon.src = subsurfacefacilityImage;

        mapInstance.on('load', () => {
          innerSetMap(mapInstance);
          setMapReference(mapInstance);

          mapInstance.addImage(OIL_GAS_PATTERN, oilgasPattern);
          mapInstance.addImage(GAS_CONDENSATE_PATTERN, gascondensatePattern);
          mapInstance.addImage(SURFACE_FACILITY_ICON, surfacefacilityIcon);
          mapInstance.addImage(
            SUBSURFACE_FACILITY_ICON,
            subsurfacefacilityIcon
          );
          if (mapIcons && mapIcons.length) {
            mapIcons.forEach((mapIcon) => {
              mapInstance.addImage(mapIcon.name, mapIcon.icon);
            });
          }

          mapInstance.addControl(drawMap, 'top-right');
          innerSetDraw(drawMap);

          mapInstance.resize();
        });

        mapInstance.on('resize', () => {
          const mapWidth = mapInstance.getCanvasContainer().offsetWidth;
          const miniMapExists = !!miniMap._parentMap; // eslint-disable-line no-underscore-dangle

          if (!miniMapExists && mapWidth > 400) {
            mapInstance.addControl(scaleControl, 'bottom-right');
            mapInstance.addControl(miniMap, 'bottom-left');
          } else if (miniMapExists && mapWidth < 400) {
            mapInstance.removeControl(scaleControl);
            mapInstance.removeControl(miniMap);
          }
        });
      };

      if (!map) {
        if (!mapSettings) return noop;

        initializeMap({
          innerSetMap: setMap,
          innerSetDraw: setDraw,
          mapContainer: mapRef,
        });
      }

      return noop;
    }, [map, mapRef, mapSettings]);

    // Add zoom if it exists. (note: cannot do zoom:0 with this)
    useEffect(() => {
      if (map && flyTo) {
        let safe = true;

        if (flyTo.center[1] < -90 || flyTo.center[1] > 90) {
          // eslint-disable-next-line no-console
          console.log('Error in y when changing map to:', flyTo);
          safe = false;
        }
        if (flyTo.center[0] < -90 || flyTo.center[0] > 90) {
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
    }, [map, flyTo]);

    useEffect(() => {
      if (map === null || draw === null) return noop;
      if (selectedFeature && drawMode === 'simple_select') return noop;
      if (drawMode === 'direct_select') {
        if (selectedFeature) {
          draw.changeMode('direct_select', { featureId: selectedFeature.id });
        } else {
          draw.changeMode('simple_select');
        }
        return noop;
      }
      const currentDrawmode = draw.getMode();
      if (currentDrawmode !== drawMode || drawMode !== 'simple_select')
        draw.changeMode(drawMode);

      return noop;
    }, [drawMode, draw, selectedFeature]);

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

    useEffect(() => {
      if (map) {
        sources.forEach((source) => {
          addSource(map, source.id, source.data, source.clusterProps);
        });
      }
    }, [map, sources]);

    const getLayer = (innerMap: mapboxgl.Map, layerId: string) => {
      return innerMap.getLayer(layerId);
    };

    const addLayer = (
      innerMap: mapboxgl.Map,
      innerLayer: MapLayer,
      beforeLayer?: string
    ) => {
      // console.log('Adding before:', beforeLayer);
      let beforeLayerToUse;

      // Check if the layer is already added to map
      const innerLayerExist = getLayer(innerMap, innerLayer.id);
      // Check if the layer's source is already added to map
      const sourceExist = innerMap.getSource(innerLayer.source);
      // console.log('beforeLayerExist', beforeLayerExist);

      if (beforeLayer === undefined) {
        // this default will cause the first layer to be drawn before
        // the gl-draw ones, eg: the layers where we draw the user polygon
        const fallbackBeforeLayerName = 'gl-draw-polygon-fill-inactive.cold';
        const fallbackBeforeLayer = getLayer(innerMap, fallbackBeforeLayerName);
        if (fallbackBeforeLayer) {
          beforeLayerToUse = fallbackBeforeLayerName;
        }
      } else {
        // Check if the layer has a before layer and already added to the map
        const beforeLayerExist = getLayer(innerMap, beforeLayer);
        if (beforeLayerExist) {
          beforeLayerToUse = beforeLayer;
        }
      }

      if (!innerLayerExist && sourceExist) {
        try {
          innerMap.addLayer(innerLayer, beforeLayerToUse);
        } catch (error) {
          console.error('Layer not ready:', error);
        }
      }
    };

    const removeLayer = (innerMap: mapboxgl.Map, layerId: string) => {
      if (getLayer(map, layerId)) {
        innerMap.removeLayer(layerId);
      }
    };

    useEffect(() => {
      if (map && sources.length > 0) {
        layers.forEach((layer, index) => {
          // console.log('Working on layer:', layer.id);
          const addLayerBeforeThisLayer = choosePreviousSelectedLayer(
            layers,
            index
          );

          layer.layers.forEach((innerLayer) => {
            // console.log('Processing inner layer:', {
            //   id: innerLayer.id,
            //   selected: layer.selected,
            // });
            if (layer.selected) {
              addLayer(map, innerLayer, addLayerBeforeThisLayer);
            } else {
              removeLayer(map, innerLayer.id);
            }
          });
        });
      }
    }, [map, layers, sources]);

    useEffect(() => {
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
    }, [map, events]);

    useEffect(() => {
      // This is needed to resize the map when the parent container changes size (e.g expanded mode)
      if (map) {
        map.resize();
      }
    }, [mapRef?.current?.offsetWidth]);

    return (
      <MapContainer ref={mapRef} data-testid="map-container">
        {renderNavigationControls &&
          renderNavigationControls(mapRef?.current?.offsetWidth)}
      </MapContainer>
    );
  }
);

export default Map;
