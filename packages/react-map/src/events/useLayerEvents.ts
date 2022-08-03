import mapboxgl from 'maplibre-gl';
import noop from 'lodash/noop';

import { useDeepEffect } from '../hooks/useDeep';
import { MapProps } from '../types';

import { defaultEvents } from './defaultEvents';

interface Props {
  map?: mapboxgl.Map;
  setupEvents?: MapProps['setupEvents'];
}
export const useLayerEvents = ({ setupEvents, map }: Props) => {
  useDeepEffect(() => {
    if (!map) return noop;

    const events =
      typeof setupEvents === 'function'
        ? setupEvents({ defaultEvents })
        : defaultEvents;

    events.forEach((event) => {
      if (event.layers) {
        event.layers.forEach((layer) => {
          map.on(event.type, layer, event.callback);
        });
      } else {
        map.on(event.type, event.callback);
      }
    });

    return () => {
      events.forEach((event) => {
        if (event.layers) {
          event.layers.forEach((layer) => {
            map.off(event.type, layer, event.callback);
          });
        } else {
          map.off(event.type, event.callback);
        }
      });
    };
  }, [!!map, setupEvents]);
};
