import noop from 'lodash/noop';

import { useDeepEffect } from '../hooks/useDeep';
import { MapType, MapProps, EventSetters } from '../types';

import { useDefaultEvents } from './useDefaultEvents';

export interface Props extends EventSetters {
  map?: MapType;
  setupEvents?: MapProps['setupEvents'];
}
export const useLayerEvents = (props: Props) => {
  const { setupEvents, map, ...setters } = props;
  const defaultEvents = useDefaultEvents(props);

  useDeepEffect(() => {
    if (!map) return noop;

    const events =
      typeof setupEvents === 'function'
        ? setupEvents({ defaultEvents, ...setters })
        : defaultEvents;

    events.forEach((event) => {
      // console.log('Adding event:', event.type);
      if (event.layers) {
        event.layers.forEach((layer) => {
          // not sure how to get maplibregl.Map to like my extended event types
          // @ts-expect-error Type '"draw.create"' is not assignable to type 'keyof MapLayerEventType'
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
            // not sure how to get maplibregl.Map to like my extended event types
            // @ts-expect-error Type '"draw.create"' is not assignable to type 'keyof MapLayerEventType'
            map.off(event.type, layer, event.callback);
          });
        } else {
          map.off(event.type, event.callback);
        }
      });
    };
  }, [!!map, setupEvents]);
};
