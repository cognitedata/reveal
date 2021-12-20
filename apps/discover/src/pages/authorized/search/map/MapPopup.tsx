import { cloneElement, useCallback, useEffect, useRef } from 'react';

import mapboxgl from 'maplibre-gl';

import { Point } from '@cognite/seismic-sdk-js';

interface Props {
  point: Point;

  map?: mapboxgl.Map;

  children: JSX.Element;
}
export const MapPopup = ({ children, map, point }: Props) => {
  const popupRef = useRef<any>();
  const currentPopup = useRef<any>();

  useEffect(() => {
    if (!map || !popupRef.current) return undefined;

    currentPopup.current = new mapboxgl.Popup({
      className: 'mapbox-popup',
      offset: 16,
      closeButton: false,
    })
      .setLngLat(point.coordinates as [number, number])
      .setDOMContent(popupRef.current)
      .addTo(map);

    return () => {
      if (currentPopup.current) {
        currentPopup.current.remove();
      }
    };
  }, [map, point]);

  const handleClose = useCallback(() => {
    if (currentPopup.current) {
      currentPopup.current.remove();
    }
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <div ref={popupRef}>
        {cloneElement(children, { onPopupClose: handleClose })}
      </div>
    </div>
  );
};

export default MapPopup;
