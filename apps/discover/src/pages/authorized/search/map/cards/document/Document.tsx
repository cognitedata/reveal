import React from 'react';

import { Map } from 'maplibre-gl';

import { useMap } from 'modules/map/selectors';

import MapPopup from '../../MapPopup';

import DocumentPreviewCard from './components';

interface Props {
  map?: Map;
}
export const DocumentCard: React.FC<Props> = ({ map }) => {
  const { drawMode, selectedDocument } = useMap();

  if (
    drawMode !== 'draw_polygon' &&
    map &&
    selectedDocument &&
    selectedDocument.point
  ) {
    return (
      <MapPopup
        point={selectedDocument.point}
        map={map}
        className="mapbox-popup-previewcard"
      >
        <DocumentPreviewCard documentId={selectedDocument.id} />
      </MapPopup>
    );
  }

  return null;
};
