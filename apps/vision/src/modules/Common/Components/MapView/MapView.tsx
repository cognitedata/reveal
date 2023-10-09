import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl';

import styled from 'styled-components';

import * as MapboxGL from 'mapbox-gl';

import { ResultData, TableDataItem } from '../../types';
import { FileMapTableProps } from '../FileTable/types';
import { MapFileTable } from '../MapFileTable/MapFileTable';

import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from './constants';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPopup } from './MapPopup';

/*
the access token was not being set even though it's passed to ReactMapboxGL
https://github.com/alex3165/react-mapbox-gl/issues/822#issuecomment-735726872
*/
(MapboxGL as any).accessToken = MAPBOX_TOKEN;

// should be defined outside MapView to avoid re-rendering
const Mapbox = ReactMapboxGl({
  minZoom: 1,
  maxZoom: 30,
  accessToken: MAPBOX_TOKEN,
  attributionControl: false,
  trackResize: true,
});

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

const circlePaintSelected: MapboxGL.CirclePaint = {
  'circle-color': '#4A67FB',
  ...pinStyle,
};

export const MapView = (props: FileMapTableProps<TableDataItem>) => {
  const [selectedFile, setSelectedFile] = useState<ResultData | undefined>();
  const [popupState, setPopupState] = useState<'open' | 'hidden' | 'close'>(
    'close'
  );
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

  const circlePaint: MapboxGL.CirclePaint = useMemo(() => {
    return {
      'circle-color': mapActive ? '#C844DB' : 'grey',
      ...pinStyle,
    };
  }, [mapActive]);

  const features = useMemo(() => {
    return Object.assign(
      {},
      ...files
        .filter((f: ResultData) => f.geoLocation && f)
        .map((s: ResultData) => ({
          [s.id]: s.geoLocation?.geometry.coordinates as [number, number],
        }))
    );
  }, [files]);

  const showMapPopup = useCallback(
    (fileId: number) => {
      if (fileId in features && mapActive) {
        setPopupState('open');
        setSelectedFile(files.find((file) => file.id === fileId));
        setCenter(features[fileId.toString()]);
      } else {
        setSelectedFile(undefined);
      }
    },
    [files, features, mapActive]
  );

  const selectedFileIsInTable = useMemo(() => {
    return !!(selectedFile && selectedFile.id in features);
  }, [selectedFile]);

  const handleOnClick = useCallback(
    (fileId: number) => {
      showMapPopup(fileId);
      const item = files.find((file) => file.id === fileId);
      if (item) props.onItemClick(item, false);
    },
    [files, props.onItemClick]
  );

  // set popup visibility based on whether the selected file is within map bounds or not
  const handleZoomAndDrag = useCallback(
    (map: MapboxGL.Map, _: MapboxGL.EventData) => {
      if (selectedFileIsInTable) {
        const coords = features[selectedFile!.id.toString()];
        const bounds = map.getBounds();
        const isWithin = bounds.contains(coords);
        if (isWithin && !['open', 'close'].includes(popupState)) {
          setPopupState('open');
        } else if (!isWithin && popupState === 'open') {
          setPopupState('hidden');
        }
      }
    },
    [selectedFileIsInTable, features, selectedFile, popupState]
  );

  // resize map on rerender
  useEffect(() => {
    if (mapObj.current) {
      mapObj.current?.resize();
    }
  });

  const selectedFileObj = useMemo(() => {
    return files.find(
      (element: TableDataItem) => element.id === selectedFile?.id
    );
  }, [files, selectedFile?.id]);

  return (
    <Container>
      <div>
        <MapFileTable
          {...props}
          mapCallback={showMapPopup}
          setMapActive={setMapActive}
        />
      </div>
      <div
        style={{
          position: 'relative',
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
            // @ts-ignore wrong types from package
            <Popup
              key={selectedFile!.id}
              coordinates={features[selectedFile!.id.toString()]}
              anchor="bottom"
              offset={[0, -10]}
            >
              {selectedFileObj ? (
                <MapPopup
                  item={selectedFileObj}
                  onClose={() => setPopupState('close')}
                  actionDisabled={!!props.selectedIds.length}
                />
              ) : (
                <div />
              )}
            </Popup>
          ) : undefined}
        </Mapbox>
      </div>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 100%;
  grid-template-columns: 400px 1fr;
  grid-column-gap: 20px;

  .mapboxgl-popup {
    position: absolute;
  }
`;
