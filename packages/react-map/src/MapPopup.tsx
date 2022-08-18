import * as React from 'react';
import { Map, Popup } from 'maplibre-gl';

import { MapPoint } from './types';

export interface Props {
  point: MapPoint;
  map?: Map;
  children: JSX.Element;
  // Add custom styles in 'globalStyles.ts' with prefix of 'mapbox-popup-X'
  className?: 'mapbox-popup-previewcard';
}
const wrapperStyle = { display: 'none' };
export const MapPopup = ({ children, map, point, className }: Props) => {
  const popupRef = React.useRef<any>();
  const currentPopup = React.useRef<any>();

  const extendedClassnames = ['mapbox-popup', className]
    .filter(Boolean)
    .join(' ');

  React.useEffect(() => {
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

  const handleClose = React.useCallback(() => {
    if (currentPopup.current) {
      currentPopup.current.remove();
    }
  }, []);

  return (
    <div style={wrapperStyle}>
      <div ref={popupRef}>
        {React.cloneElement(children, { onPopupClose: handleClose })}
      </div>
    </div>
  );
};
