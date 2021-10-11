import React from 'react';

import mapboxgl from 'maplibre-gl';

import { useMap } from 'modules/map/selectors';

import { MapPreviewContainer } from '../CardContainer';

import DocumentPreviewCard from './components';

interface Props {
  map?: mapboxgl.Map;
}
export const DocumentCard: React.FC<Props> = ({ map }) => {
  const { selectedDocument } = useMap();

  if (map && selectedDocument) {
    return (
      <MapPreviewContainer map={map} point={selectedDocument?.point}>
        <DocumentPreviewCard documentId={selectedDocument.id} />
      </MapPreviewContainer>
    );
  }

  return null;
};
