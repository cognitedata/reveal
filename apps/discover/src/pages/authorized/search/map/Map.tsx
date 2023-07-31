import {
  useClearPolygon,
  useSetPolygon,
} from 'domain/savedSearches/internal/hooks/useClearPolygon';

import * as React from 'react';
import { useDispatch } from 'react-redux';

import {
  Feature,
  feature as turfFeature,
  featureCollection,
  Geometry,
  Geometry as TurfGeometry,
} from '@turf/helpers';
import { TS_FIX_ME } from 'core';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

import { PerfMetrics } from '@cognite/metrics';
import {
  Map as MapboxMap,
  MapType,
  resetDrawState,
  MapFeatures,
  drawModes,
  MapAddedProps,
  MapFeatureCollection,
  MapFeature,
} from '@cognite/react-map';
import { GeoJson, Point } from '@cognite/seismic-sdk-js';

import { BlockExpander } from 'components/BlockExpander/BlockExpander';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { setSelectedLayers } from 'modules/map/actions';
import { MAPBOX_TOKEN, MAPBOX_MAP_ID } from 'modules/map/constants';
import { getFeature } from 'modules/map/helper';
import { useMapConfig } from 'modules/map/hooks/useMapConfig';
import { useMap } from 'modules/map/selectors';
import { useActivePanel } from 'modules/resultPanel/selectors';
import { hideResults, showResults } from 'modules/search/actions';
import { useSearchState } from 'modules/search/selectors';
import { setCategoryPage } from 'modules/sidebar/actions';
import { useFilterCategory } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';

import { MS_TRANSITION_TIME } from '../search/SideBar/constants';

import { SeismicCard, WellCard, DocumentCard } from './cards';
import {
  EXPAND_SEARCH_RESULTS_TEXT,
  EXPAND_MAP_TEXT,
  DEFAULT_CLUSTER_ZOOM_LEVEL,
} from './constants';
import { MapWrapper, MapBlockExpander } from './elements';
import { useLayers } from './hooks/useLayers';
import { useMapEvents } from './hooks/useMapEvents';
import { useMapSources } from './hooks/useMapSources';
import { useVisibleLayers } from './hooks/useVisibleLayers';
import { PolygonBar } from './polygon/PolygonBar';
import { getMapIcons } from './utils/mapIcons';

function getGeometryType<T>(item: T) {
  return get(item, 'geometry.type');
}

const mapIcons = getMapIcons();

type ReactMapProps = React.ComponentProps<typeof MapboxMap>;
type FloatingActionsProps = React.ComponentProps<
  typeof MapFeatures.FloatingActions
>;

export const Map: React.FC = () => {
  const dispatch = useDispatch();
  const {
    geoFilter,
    arbitraryLine,
    otherGeo,
    zoomToFeature,
    zoomToCoords,
    moveToCoords,
    selectedLayers,
  } = useMap();
  const extrasRef = React.useRef<any>();
  const { selectableLayers } = useLayers();
  const metrics = useGlobalMetrics('map');
  const [flyTo, setFlyTo] = React.useState<ReactMapProps['flyTo']>();
  const [mapReference, setMapReference] = React.useState<MapType>();
  const [focusedFeature, setFocusedFeature] = React.useState<Feature>();
  const { showSearchResults } = useSearchState();
  const searchPendingRef = React.useRef<boolean>(false);
  const activePanel = useActivePanel();
  const sidebarCategory = useFilterCategory();
  const sidebarCategoryUnsetRef = React.useRef<boolean>(false);
  const { data: mapConfig } = useMapConfig();
  const [combinedSources] = useMapSources();
  // console.log('Final map sources:', combinedSources);
  const layers = useVisibleLayers(selectedLayers);
  const { t } = useTranslation();
  const setSavedPolygon = useSetPolygon();
  const clearPolygon = useClearPolygon({ hideResult: true });

  const onDeleteClicked = () => {
    searchPendingRef.current = false;
    clearPolygon();
  };

  useDeepEffect(() => {
    if (zoomToFeature) {
      setFocusedFeature(turfFeature(zoomToFeature as TurfGeometry));
    }
  }, [zoomToFeature]);

  useDeepEffect(() => {
    if (zoomToCoords) {
      zoomToAsset(zoomToCoords);
    }
  }, [zoomToCoords]);

  useDeepEffect(() => {
    if (moveToCoords) {
      zoomToAsset(moveToCoords, false);
    }
  }, [moveToCoords]);

  React.useEffect(() => {
    if (mapReference && mapReference?.areTilesLoaded()) {
      PerfMetrics.trackPerfEnd('MAP_RENDER');
    }
  }, [mapReference]);

  useDeepEffect(() => {
    PerfMetrics.trackPerfStart('MAP_RENDER');
  }, []);

  const mapEvents = useMapEvents();

  const setupEvents: ReactMapProps['setupEvents'] = useDeepMemo(
    () =>
      ({ defaultEvents }) => {
        return [...defaultEvents, ...mapEvents];
      },
    [mapEvents]
  );

  const zoomToAsset = (point: Point, changeZoom?: number | false) => {
    let zoom: number | undefined;

    // default zoom
    if (isUndefined(changeZoom)) {
      // since the data is clustered we zoom in one level deeper to "get out" of the cluster
      zoom = DEFAULT_CLUSTER_ZOOM_LEVEL + 1;
    } else if (changeZoom === false) {
      // allow option to NOT change zoom
      zoom = undefined;
    } else {
      zoom = changeZoom;
    }

    setFlyTo({
      center: point.coordinates as [number, number],
      zoom,
    });
  };

  const handleQuickSearchSelection = (selection: TS_FIX_ME) => {
    setFocusedFeature(selection.feature);
    metrics.track('click-asset-menu-item');
  };

  const handleSearchClicked: FloatingActionsProps['onSearchClicked'] = ({
    drawnFeatures,
  }) => {
    searchPendingRef.current = false;
    if (drawnFeatures?.features) {
      setSavedPolygon(drawnFeatures?.features as GeoJson[]);
    }
  };

  const handleToggleResult = () => {
    if (showSearchResults) {
      dispatch(hideResults());
    } else {
      dispatch(showResults());

      if (sidebarCategory !== 'landing') {
        return;
      }

      if (isUndefined(activePanel)) {
        sidebarCategoryUnsetRef.current = true;
      } else {
        dispatch(setCategoryPage(activePanel as CategoryTypes));
      }
    }
  };

  useDeepEffect(() => {
    if (!isUndefined(activePanel) && sidebarCategoryUnsetRef.current) {
      sidebarCategoryUnsetRef.current = false;
      dispatch(setCategoryPage(activePanel as CategoryTypes));
    }
  }, [activePanel]);

  useDeepEffect(() => {
    const timeout = setTimeout(() => {
      // Trigger a resize for the map to change width after transition has finished
      mapReference?.resize();
    }, MS_TRANSITION_TIME);

    return () => clearTimeout(timeout);
  }, [showSearchResults]);

  // sync the initial map state to the 'default' layers selection
  // note: this might be better done when initially loading the layers
  // so we can skip this step entirly.
  useDeepEffect(() => {
    const initialSelectedLayers = selectableLayers.reduce((result, layer) => {
      if (!layer.id || !layer.selected) {
        return result;
      }
      return [...result, layer.id];
    }, [] as string[]);

    dispatch(setSelectedLayers(initialSelectedLayers));
  }, [selectableLayers]);

  const features: ReactMapProps['features'] = React.useMemo(() => {
    const collection = [
      // any other geometrys we want to show
      ...Object.keys(otherGeo).map((key) =>
        getFeature(otherGeo[key], 'Preview', key)
      ),
      arbitraryLine, // ------- seismic line
    ];
    const safeFeatures = collection.filter((item) =>
      getGeometryType(item)
    ) as Feature<Geometry, any>[];

    // remove any null or empty points and convert to an official 'featureCollection'
    return featureCollection(safeFeatures);
  }, [otherGeo, arbitraryLine]);

  const renderMapExpander = React.useMemo(() => {
    if (showSearchResults) {
      return null;
    }

    return (
      <BlockExpander
        data-testid="expand-search-result"
        text={t(EXPAND_SEARCH_RESULTS_TEXT)}
        onClick={handleToggleResult}
      />
    );
  }, [showSearchResults]);

  const initialDrawnFeatures = featureCollection(
    geoFilter as MapFeature[]
  ) as MapFeatureCollection;

  return (
    <>
      <div ref={extrasRef} />

      <MapWrapper>
        {renderMapExpander}

        <MapboxMap
          MAPBOX_TOKEN={MAPBOX_TOKEN}
          MAPBOX_MAP_ID={MAPBOX_MAP_ID}
          // project config stuff:
          // -todo: should we fix project config types?
          center={mapConfig?.center as ReactMapProps['center']}
          zoom={mapConfig?.zoom}
          // things to overlay:
          layerData={combinedSources}
          layerConfigs={layers}
          setupEvents={setupEvents}
          features={features}
          mapIcons={mapIcons}
          initialDrawnFeatures={initialDrawnFeatures}
          // others:
          flyTo={flyTo}
          focusedFeature={focusedFeature}
          // callbacks
          setMapReference={setMapReference}
          renderChildren={(props: MapAddedProps) => {
            return (
              <>
                <MapFeatures.FloatingActions
                  {...props}
                  onSearchClicked={handleSearchClicked}
                  onDeleteClicked={onDeleteClicked}
                />
                <MapFeatures.UnmountConfirmation
                  map={props.map}
                  enabled={
                    searchPendingRef.current ||
                    props.drawMode === drawModes.DRAW_POLYGON
                  }
                  onCancel={() => {
                    resetDrawState(props);
                  }}
                />
                <DocumentCard {...props} />
                <SeismicCard {...props} />
                <WellCard {...props} />
                <PolygonBar
                  sources={combinedSources}
                  onQuickSearchSelection={handleQuickSearchSelection}
                  zoomToAsset={zoomToAsset}
                  mapAddedProps={props}
                />
              </>
            );
          }}
          renderWithWidth={(mapWidth) => {
            return (
              <>
                {/* Collapsed state. Show the expand button */}
                {showSearchResults && mapWidth === 60 && (
                  <MapBlockExpander data-testid="expand-map">
                    <BlockExpander
                      text={t(EXPAND_MAP_TEXT)}
                      onClick={handleToggleResult}
                    />
                  </MapBlockExpander>
                )}
              </>
            );
          }}
        />
      </MapWrapper>
    </>
  );
};

// for lazy loading
export default Map;
