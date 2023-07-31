import * as React from 'react';
import noop from 'lodash/noop';
import mapboxgl from 'maplibre-gl';
import isUndefined from 'lodash/isUndefined';

import { getMinimap } from '../Minimap/getMinimap';
import { getMapboxDraw } from '../FreeDraw/getMapboxDraw';
import { MapProps } from '../types';

type Props = Pick<
  React.PropsWithChildren<MapProps>,
  | 'center'
  | 'zoom'
  | 'maxBounds'
  | 'setMapReference'
  | 'disableMinimap'
  | 'mapIcons'
  | 'hideShowNagivationWidth'
  | 'MAPBOX_TOKEN'
  | 'MAPBOX_MAP_ID'
>;
export const useMapSetup = ({
  center,
  zoom,
  maxBounds,
  setMapReference,
  disableMinimap,
  mapIcons,
  hideShowNagivationWidth = 80,
  MAPBOX_TOKEN,
  MAPBOX_MAP_ID,
}: Props) => {
  const mapRef = React.useRef<any>();
  const [draw, setDraw] = React.useState<MapboxDraw>();
  const [map, setMap] = React.useState<maplibregl.Map>();
  const [, setNavigation] = React.useState<boolean | undefined>(false);
  const miniMap = React.useMemo(
    () =>
      getMinimap({
        style: MAPBOX_MAP_ID,
        disabled: disableMinimap,
      }),
    [disableMinimap]
  );

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

        const mapboxDraw = getMapboxDraw();

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
          mapInstance.addControl(mapboxDraw, 'top-right');
          innerSetDraw(mapboxDraw);

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

  return { map, draw, mapRef };
};
