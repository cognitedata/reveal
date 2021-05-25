import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl';
import * as MapboxGL from 'mapbox-gl';
import { ResultData } from 'src/modules/Common/types';
import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopup } from './MapPopup';
import { MapFileTable } from './MapFileTable';
import { TableDataItem } from '../../types';
import { FileExplorerTableProps } from '../FileTable/types';

const Mapbox = ReactMapboxGl({
  minZoom: 1,
  maxZoom: 30,
  accessToken: MAPBOX_TOKEN,
  attributionControl: false,
});

export const MapView = (props: FileExplorerTableProps) => {
  const [selectedFileOnMap, setSelectedFileOnMap] = useState<ResultData>();
  const [mapActive, setMapActive] = useState<boolean>(true);
  const [center, setCenter] = useState<[number, number]>();
  const [zoom] = useState<[number] | undefined>([2]);

  const fitBounds = undefined; // TODO: calculate this based on the provided data

  const selectedFiles = useMemo(() => {
    return props.data || [];
  }, [props.data]);

  const handleStyleLoad = (map: MapboxGL.Map) => map.resize();

  const mapStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  const flyToOptions = {
    speed: 0.8,
  };

  const circleLayout: MapboxGL.CircleLayout = { visibility: 'visible' };
  const circlePaint: MapboxGL.CirclePaint = {
    'circle-color': mapActive ? '#C844DB' : 'grey',
    'circle-radius': 7.5,
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-color-transition': { duration: 0 },
  };
  const features = Object.assign(
    {},
    ...selectedFiles
      .filter((f: ResultData) => f.geoLocation && f)
      .map((s: ResultData) => ({
        [s.id]: s.geoLocation?.geometry.coordinates as [number, number],
      }))
  );

  const showMapPopup = (fileId: number) => {
    setSelectedFileOnMap(selectedFiles.find((file) => file.id === fileId));
    setCenter(features[fileId.toString()]);
  };

  const handleOnDrag = () => {
    if (selectedFileOnMap) setSelectedFileOnMap(undefined);
  };

  const handleOnClick = (fileId: number) => {
    showMapPopup(fileId);
    const item = selectedFiles.find((file) => file.id === fileId);
    if (item) props.onRowClick(item, false);
  };

  return (
    <Container>
      <div style={{ width: '400px', paddingRight: '20px' }}>
        <MapFileTable
          {...props}
          mapCallback={showMapPopup}
          setMapActive={setMapActive}
          setSelectedFileOnMap={setSelectedFileOnMap}
        />
      </div>
      <div style={{ width: `calc(100% - 400px)`, paddingRight: '20px' }}>
        <Mapbox
          style={MAPBOX_MAP_ID}
          onStyleLoad={handleStyleLoad}
          fitBounds={fitBounds}
          center={center}
          zoom={zoom}
          containerStyle={mapStyle}
          flyToOptions={flyToOptions}
          onDrag={handleOnDrag}
          onClick={handleOnDrag}
        >
          <Layer type="circle" layout={circleLayout} paint={circlePaint}>
            {Object.keys(features).map((f, _) => (
              <Feature
                key={f}
                coordinates={features[f]}
                onClick={() => handleOnClick(+f)}
              />
            ))}
          </Layer>
          {selectedFileOnMap ? (
            <Popup
              key={selectedFileOnMap.id}
              coordinates={features[selectedFileOnMap.id.toString()]}
              anchor="bottom"
              offset={[0, -10]}
              style={{
                position: 'fixed',
              }}
            >
              <MapPopup
                item={selectedFiles.find(
                  (element: TableDataItem) =>
                    element.id === selectedFileOnMap.id
                )}
              />
            </Popup>
          ) : (
            <div />
          )}
        </Mapbox>
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;
