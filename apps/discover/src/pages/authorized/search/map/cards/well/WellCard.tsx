import mapboxgl from 'maplibre-gl';

import { useMap } from 'modules/map/selectors';

import { MapPreviewContainer } from '../CardContainer';

import { WellPreviewCard } from './WellPreviewCard';

interface Props {
  map?: mapboxgl.Map;
}

export const WellCard: React.FC<Props> = ({ map }) => {
  const { selectedWell } = useMap(); // map provider

  if (map && selectedWell) {
    return (
      <MapPreviewContainer map={map} point={selectedWell.point}>
        <WellPreviewCard wellId={selectedWell.id} />
      </MapPreviewContainer>
    );
  }

  return null;
};
