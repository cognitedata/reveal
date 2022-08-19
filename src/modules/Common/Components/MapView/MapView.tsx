/* eslint-disable @cognite/no-number-z-index */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FileMapTableProps } from 'src/modules/Common/Components/FileTable/types';
import { MapFileTable } from 'src/modules/Common/Components/MapFileTable/MapFileTable';
import styled from 'styled-components';
import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl';
import * as MapboxGL from 'mapbox-gl';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopup } from './MapPopup';

// should be defined outside MapView to avoid re-rendering
const Mapbox = ReactMapboxGl({
  minZoom: 1,
  maxZoom: 30,
  accessToken: MAPBOX_TOKEN,
  attributionControl: false,
  trackResize: true,
});

export const MapView = (props: FileMapTableProps<TableDataItem>) => {
  const [selectedFile, setSelectedFile] = useState<ResultData | undefined>();
  const [popupState, setPopupState] =
    useState<'open' | 'hidden' | 'close'>('close');
  const [mapActive, setMapActive] = useState<boolean>(true);
  const [center, setCenter] = useState<[number, number]>();
  const [zoom] = useState<[number] | undefined>([2]);
  const mapObj = useRef<MapboxGL.Map | null>(null);

  const fitBounds = undefined; // TODO: calculate this based on the provided data

  const files = useMemo(() => {
    return props.data || [];
  }, [props.data]);

  const handleStyleLoad = useCallback((map: MapboxGL.Map) => {
    map.resize();
    mapObj.current = map;
  }, []);

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
  const pinStyle = {
    'circle-radius': 7.5,
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-color-transition': { duration: 0 },
  };
  const circlePaint: MapboxGL.CirclePaint = {
    'circle-color': mapActive ? '#C844DB' : 'grey',
    ...pinStyle,
  };

  const circlePaintSelected: MapboxGL.CirclePaint = {
    'circle-color': '#4A67FB',
    ...pinStyle,
  };

  const features = Object.assign(
    {},
    ...files
      .filter((f: ResultData) => f.geoLocation && f)
      .map((s: ResultData) => ({
        [s.id]: s.geoLocation?.geometry.coordinates as [number, number],
      }))
  );

  const showMapPopup = (fileId: number) => {
    if (fileId in features && mapActive) {
      setPopupState('open');
      setSelectedFile(files.find((file) => file.id === fileId));
      setCenter(features[fileId.toString()]);
    } else {
      setSelectedFile(undefined);
    }
  };

  const selectedFileIsInTable = !!(selectedFile && selectedFile.id in features);

  const handleOnClick = (fileId: number) => {
    showMapPopup(fileId);
    const item = files.find((file) => file.id === fileId);
    if (item) props.onItemClick(item, false);
  };

  // set popup visibility based on whether the selected file is within map bounds or not
  const handleZoomAndDrag = (map: MapboxGL.Map, _: MapboxGL.EventData) => {
    if (selectedFileIsInTable) {
      const coords = features[selectedFile!.id.toString()];
      const bounds = map.getBounds();
      const isWhithin = bounds.contains(coords);
      if (isWhithin && !['open', 'close'].includes(popupState)) {
        setPopupState('open');
      } else if (!isWhithin && popupState === 'open') {
        setPopupState('hidden');
      }
    }
  };

  // resize map on rerender
  useEffect(() => {
    if (mapObj.current) {
      mapObj.current?.resize();
      console.log('map resized!');
    }
  });

  return (
    <Container>
      <div
        style={{
          width: '400px',
          paddingRight: '20px',
        }}
      >
        <MapFileTable
          {...props}
          mapCallback={showMapPopup}
          setMapActive={setMapActive}
        />
      </div>
      <div
        style={{
          width: `calc(100% - 400px)`,
          paddingRight: '20px',
          // eslint-disable-next-line  @cognite/no-number-z-index
          zIndex: 0, // HACK: popup overflows the map
        }}
      >
        <Mapbox
          style={MAPBOX_MAP_ID}
          onStyleLoad={handleStyleLoad}
          fitBounds={fitBounds}
          center={center}
          zoom={zoom}
          containerStyle={mapStyle}
          flyToOptions={flyToOptions}
          movingMethod="easeTo"
          onDrag={handleZoomAndDrag}
          onZoom={handleZoomAndDrag}
        >
          <Layer type="circle" layout={circleLayout} paint={circlePaint}>
            {files.length &&
              Object.keys(features)
                .filter((f, _) => f !== selectedFile?.id.toString())
                .map((f, _) => (
                  <Feature
                    key={f}
                    coordinates={features[f]}
                    onClick={() => handleOnClick(+f)}
                  />
                ))}
          </Layer>
          {selectedFileIsInTable ? (
            <Layer
              type="circle"
              layout={circleLayout}
              paint={circlePaintSelected}
            >
              <Feature
                key={selectedFile!.id}
                coordinates={features[selectedFile!.id.toString()]}
                onClick={() => handleOnClick(+selectedFile!.id)}
              />
            </Layer>
          ) : undefined}
          {selectedFileIsInTable && popupState === 'open' ? (
            <Popup
              key={selectedFile!.id}
              coordinates={features[selectedFile!.id.toString()]}
              anchor="bottom"
              offset={[0, -10]}
            >
              <MapPopup
                item={files.find(
                  (element: TableDataItem) => element.id === selectedFile!.id
                )}
                onClose={() => setPopupState('close')}
                actionDisabled={!!props.selectedIds.length}
              />
            </Popup>
          ) : undefined}
        </Mapbox>
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 99%;
  display: flex;

  .mapboxgl-popup {
    position: absolute;
  }
`;
