import { MapAddedProps, drawModes, MapFeatures } from '@cognite/react-map';

import { useMap } from 'modules/map/selectors';

import { WellPreviewCard } from './WellPreviewCard';

export const WellCard: React.FC<MapAddedProps> = ({ map, drawMode }) => {
  const { selectedWell } = useMap(); // map provider

  if (drawMode === drawModes.DRAW_POLYGON) {
    return null;
  }

  if (!map || !selectedWell?.point) {
    return null;
  }

  return (
    <MapFeatures.Popup
      point={selectedWell.point}
      map={map}
      className="mapbox-popup-previewcard"
    >
      <WellPreviewCard wellId={selectedWell.id} />
    </MapFeatures.Popup>
  );
};
