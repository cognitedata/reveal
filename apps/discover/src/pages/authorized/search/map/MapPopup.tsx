import { cloneElement, useCallback, useEffect, useRef } from 'react';

import { Map, Popup } from 'maplibre-gl';

import { Point } from '@cognite/seismic-sdk-js';

interface Props {
  point: Point;
  map?: Map;
  children: JSX.Element;
  // Add custom styles in 'globalStyles.ts' with prefix of 'mapbox-popup-X'
  className?: 'mapbox-popup-previewcard';
}
export const MapPopup = ({ children, map, point, className }: Props) => {
  const popupRef = useRef<any>();
  const currentPopup = useRef<any>();

  const extendedClassnames = ['mapbox-popup', className]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (!map || !popupRef.current) return undefined;

    currentPopup.current = new Popup({
      className: extendedClassnames,
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
  }, [map, point.coordinates]);

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
