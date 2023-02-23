import React from 'react';
import styled from 'styled-components';

import MapboxGl, { GeoJSONLayer } from 'react-mapbox-gl';
import { FileGeoLocation } from '@cognite/sdk';
import * as MapboxGL from 'mapbox-gl';
import { Icon } from '@cognite/cogs.js';
import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from './constants';

const Map = MapboxGl({
  accessToken: MAPBOX_TOKEN,
  attributionControl: false,
});

const mapPlaceHolder = () => {
  return (
    <MapPlaceHolder>
      <Icon type="Map" size={16} />
      No location data
    </MapPlaceHolder>
  );
};

export const InlineMapView = ({
  geoLocation,
}: {
  geoLocation?: FileGeoLocation;
}) => {
  if (!geoLocation) {
    return mapPlaceHolder();
  }

  const coordinates = {
    longitude: geoLocation.geometry.coordinates[0] as number,
    latitude: geoLocation.geometry.coordinates[1] as number,
  };

  const delta = 5;
  const bounds: [[number, number], [number, number]] = [
    [coordinates.longitude - delta, coordinates.latitude - delta],
    [coordinates.longitude + delta, coordinates.latitude + delta],
  ];

  const circleLayout: MapboxGL.CircleLayout = { visibility: 'visible' };
  const circlePaint: MapboxGL.CirclePaint = {
    'circle-color': '#C844DB',
    'circle-radius': 7.5,
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
  };
  return (
    <>
      <Map
        style={MAPBOX_MAP_ID}
        containerStyle={{
          width: '100%',
          maxHeight: 179,
          overflow: 'hidden',
        }}
        fitBoundsOptions={{ duration: 0 }}
        fitBounds={bounds}
      >
        <GeoJSONLayer
          data={geoLocation}
          circleLayout={circleLayout}
          circlePaint={circlePaint}
        />
      </Map>
    </>
  );
};

const MapPlaceHolder = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 179px;
  background: #f5f5f5;
  color: #8c8c8c;
  margin: auto;
  justify-content: center;
  align-items: center;
`;
