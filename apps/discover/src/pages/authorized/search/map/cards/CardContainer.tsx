import React from 'react';

import mapboxgl, { LngLatLike } from 'maplibre-gl';

import { Point } from '@cognite/seismic-sdk-js';

import { CARD_WIDTH } from 'components/Card/PreviewCard/constants';

import { MapDocumentPreviewContainer } from '../elements';

export const MapPreviewContainer: React.FC<
  React.PropsWithChildren<{
    point?: Point;
    map: mapboxgl.Map;
  }>
> = ({ point, map, children }) => {
  const getRightByGeo = ({
    coordinates,
  }: { coordinates?: Point['coordinates'] } = {}) => {
    if (coordinates) {
      const coo = map.project(coordinates as LngLatLike);
      const centerCardOnGeo = coo.x - CARD_WIDTH / 2;
      return centerCardOnGeo < 20 ? 20 : centerCardOnGeo;
    }

    // default position if the document does not have one:
    return '1vw';
  };

  const getTopByGeo = ({
    coordinates,
  }: { coordinates?: Point['coordinates'] } = {}) => {
    if (coordinates) {
      const coo = map.project(coordinates as LngLatLike);
      return coo.y + 25; // Adjust the card to be below the document point
    }

    // default position if the document does not have one:
    return '8vh';
  };

  const geoStyle = {
    right: getRightByGeo(point),
    top: getTopByGeo(point),
  };

  return (
    <MapDocumentPreviewContainer style={geoStyle}>
      {children}
    </MapDocumentPreviewContainer>
  );
};
