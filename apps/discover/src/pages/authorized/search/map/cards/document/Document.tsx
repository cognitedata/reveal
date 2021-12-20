import React from 'react';

import mapboxgl from 'maplibre-gl';

import { useMap } from 'modules/map/selectors';

import MapPopup from '../../MapPopup';

import DocumentPreviewCard from './components';

interface Props {
  map?: mapboxgl.Map;
}
export const DocumentCard: React.FC<Props> = ({ map }) => {
  const { selectedDocument } = useMap();

  if (map && selectedDocument && selectedDocument.point) {
    return (
      <MapPopup point={selectedDocument.point} map={map}>
        <DocumentPreviewCard documentId={selectedDocument.id} />
      </MapPopup>
    );
  }

  return null;
};
