import * as React from 'react';

import { MapAddedProps, drawModes, MapFeatures } from '@cognite/react-map';

import { useMap } from 'modules/map/selectors';

import DocumentPreviewCard from './components';

export const DocumentCard: React.FC<MapAddedProps> = ({ map, drawMode }) => {
  const { selectedDocument } = useMap();

  if (
    drawMode !== drawModes.DRAW_POLYGON &&
    map &&
    selectedDocument &&
    selectedDocument.point
  ) {
    return (
      <MapFeatures.Popup
        point={selectedDocument.point}
        map={map}
        className="mapbox-popup-previewcard"
      >
        <DocumentPreviewCard documentId={selectedDocument.id} />
      </MapFeatures.Popup>
    );
  }

  return null;
};
