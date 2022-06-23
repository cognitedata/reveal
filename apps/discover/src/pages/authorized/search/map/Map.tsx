import {
  useClearPolygon,
  useSetPolygon,
} from 'domain/savedSearches/internal/hooks/useClearPolygon';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { batch, useDispatch } from 'react-redux';

import cleanCoords from '@turf/clean-coords';
import {
  Feature,
  feature as turfFeature,
  featureCollection,
  Geometry as TurfGeometry,
} from '@turf/helpers';
import { TS_FIX_ME } from 'core';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import mapboxgl from 'maplibre-gl';
import { v1 } from 'uuid';

import { PerfMetrics } from '@cognite/metrics';
import { Point } from '@cognite/seismic-sdk-js';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { BlockExpander } from 'components/BlockExpander/BlockExpander';
import { showErrorMessage } from 'components/Toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useKeyPressListener } from 'hooks/useKeyPressListener';
import {
  addArbitraryLine,
  clearSelectedFeature,
  removeArbitraryLine,
  setDrawMode,
  setSelectedFeature,
  setSelectedLayers,
} from 'modules/map/actions';
import { getRightMostPoint, getFeature } from 'modules/map/helper';
import { useMap } from 'modules/map/selectors';
import { MapState } from 'modules/map/types';
import { useActivePanel } from 'modules/resultPanel/selectors';
import { hideResults, showResults } from 'modules/search/actions';
import { useSearchState } from 'modules/search/selectors';
import {
  searchForSlicesByLine,
  setSelectedSliceId,
  setSeismicCompareIsOpen,
} from 'modules/seismicSearch/actions';
import { SEISMIC_NO_SURVEY_ERROR_MESSAGE } from 'modules/seismicSearch/constants';
import { useSelectedSurvey } from 'modules/seismicSearch/hooks';
import { setCategoryPage } from 'modules/sidebar/actions';
import { useFilterCategory } from 'modules/sidebar/selectors';
import { CategoryTypes } from 'modules/sidebar/types';

import { useDeepEffect, useDeepMemo } from '../../../../hooks/useDeep';
import { useTranslation } from '../../../../hooks/useTranslation';
import { setClearPolygon } from '../../../../modules/map/actions';
import { MS_TRANSITION_TIME } from '../search/SideBar/constants';

import { SeismicCard, WellCard, DocumentCard } from './cards';
import {
  EXPAND_SEARCH_RESULTS_TEXT,
  EXPAND_MAP_TEXT,
  DEFAULT_CLUSTER_ZOOM_LEVEL,
} from './constants';
import { MapWrapper, MapBlockExpander } from './elements';
import FloatingActions from './FloatingActions';
import { useLayers } from './hooks/useLayers';
import { useMapEvents } from './hooks/useMapEvents';
import { useMapSources } from './hooks/useMapSources';
import { useTouchedEvent } from './hooks/useTouchedEvent';
import { useVisibleLayers } from './hooks/useVisibleLayers';
import LeaveConfirmModal from './LeaveConfirmModal';
import { Map as MapboxMap } from './MapboxMap';
import MapPopup from './MapPopup';
import { PolygonBar } from './polygon/PolygonBar';
import { getMapIcons } from './utils/mapIcons';

function getGeometryType<T>(item: T) {
  return get(item, 'geometry.type');
}

const mapIcons = getMapIcons();

export const Map: React.FC = () => {
  const dispatch = useDispatch();
  const {
    geoFilter,
    arbitraryLine,
    otherGeo,
    zoomToFeature,
    zoomToCoords,
    moveToCoords,
    drawMode,
    selectedFeature,
    cancelPolygonSearch,
  } = useMap();
  const { selectableLayers } = useLayers();
  const { data: selectedSurveyData } = useSelectedSurvey();
  const metrics = useGlobalMetrics('map');
  const [flyTo, setFlyTo] = useState<{
    center: number[];
    zoom?: number;
  } | null>(null);
  const [mapReference, setMapReference] = useState<mapboxgl.Map>();
  const [focusedFeature, setFocusedFeature] = useState<Feature | null>(null);
  const { showSearchResults } = useSearchState();
  const [polygon, setPolygon] = useState<MapState['geoFilter']>(() => []);
  const [showModal, setShowModal] = useState(false);
  const searchPendingRef = useRef<boolean>(false);
  const { touched, touchedEvent } = useTouchedEvent();
  const activePanel = useActivePanel();
  const sidebarCategory = useFilterCategory();
  const sidebarCategoryUnsetRef = useRef<boolean>(false);

  const [combinedSources] = useMapSources();

  const isPolygonButtonActive =
    drawMode === 'draw_polygon' || !isEmpty(polygon);

  const { t } = useTranslation();

  const layers = useVisibleLayers(selectableLayers);

  const setSavedPolygon = useSetPolygon();
  const clearPolygon = useClearPolygon();

  useEffect(() => {
    if (cancelPolygonSearch) {
      deletePolygon();
      dispatch(setClearPolygon(false));
    }
  }, [cancelPolygonSearch]);

  useEffect(() => {
    if (zoomToFeature) {
      setFocusedFeature(turfFeature(zoomToFeature as TurfGeometry));
    }
  }, [zoomToFeature]);

  useEffect(() => {
    if (zoomToCoords) {
      zoomToAsset(zoomToCoords);
    }
  }, [zoomToCoords]);

  useEffect(() => {
    if (moveToCoords) {
      zoomToAsset(moveToCoords, false);
    }
  }, [moveToCoords]);

  useEffect(() => {
    // Draw polygon when loads a saved search
    if (!isEmpty(geoFilter)) {
      const firstGeo = geoFilter[0];
      if (getGeometryType(firstGeo) === 'LineString') {
        dispatch(addArbitraryLine(v1(), firstGeo as Feature));
      } else {
        setPolygon(geoFilter);
      }
    } else if (!geoFilter.length && polygon.length) {
      // Remove polygon from map when clearing the polygon search from results page
      setPolygon([]);
    }
  }, [geoFilter]);

  // Handle clicking outside while on drawing mode
  useEffect(() => {
    const outsideListener = (event: MouseEvent) => {
      if (
        mapReference &&
        !mapReference.getContainer().contains(event.target as Node)
      ) {
        if (searchPendingRef.current || drawMode === 'draw_polygon') {
          event.preventDefault();
          event.stopPropagation();
          setShowModal(true);
        }

        //   else {
        //     dispatch(clearSelectedFeature());
        //   }
      }
    };

    document.addEventListener('mousedown', outsideListener);
    return () => {
      document.removeEventListener('mousedown', outsideListener);
    };
  }, [mapReference, drawMode]);

  // Handle keyboard listeners
  useKeyPressListener({
    onKeyDown: () => {
      if (
        isPolygonButtonActive ||
        getGeometryType(selectedFeature) === 'Polygon'
      ) {
        handlePolygonButtonToggle();
      }
    },
    deps: [isPolygonButtonActive, selectedFeature],
    key: 'Escape',
  });

  const updateArea = React.useCallback((event: TS_FIX_ME) => {
    if (isEmpty(event.features)) return;

    const eventType = event && event.type;

    if (!eventType) {
      // console.log('Missing event type!')
      return;
    }

    const feature = event.features[0];
    dispatch(setSelectedFeature(feature));

    searchPendingRef.current = true;

    const type = getGeometryType(feature);
    if (type === 'LineString') {
      if (eventType === 'draw.create') {
        dispatch(addArbitraryLine(v1(), feature));
        metrics.track('draw-linestring-search-on-map');
      }
      if (eventType === 'draw.delete') {
        dispatch(removeArbitraryLine());
        metrics.track('click-delete-linestring-button');
      }
    } else if (type === 'Polygon') {
      cleanCoords(feature, { mutate: true });
      if (eventType === 'draw.create') {
        setPolygon(event.features);
        metrics.track('draw-polygon-search-on-map');
      }
      if (eventType === 'draw.update') {
        setPolygon(event.features);
        metrics.track('update-drawn-polygon-on-map');
      }
    }
  }, []);

  React.useEffect(() => {
    if (mapReference && mapReference?.areTilesLoaded()) {
      PerfMetrics.trackPerfEnd('MAP_RENDER');
    }
  }, [mapReference]);

  React.useEffect(() => {
    PerfMetrics.trackPerfStart('MAP_RENDER');
  }, []);

  const mapEvents = useMapEvents();

  // Try to get these into the useMapEvents hooks, as of now they require some work if we're to avoid passing
  // tons of props, perhaps go with a context instead of all the useStates.
  const events = useDeepMemo(
    () => [
      {
        type: 'draw.create',
        callback: updateArea,
      },
      {
        type: 'draw.update',
        callback: updateArea,
      },
      ...touchedEvent,
      ...mapEvents,
    ],
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
      center: point.coordinates,
      zoom,
    });
  };

  const handleQuickSearchSelection = (selection: TS_FIX_ME) => {
    setFocusedFeature(selection.feature);
    metrics.track('click-asset-menu-item');
  };

  const handlePolygonButtonToggle = () => {
    if (isPolygonButtonActive) {
      dispatch(setDrawMode('simple_select'));
      deletePolygon();
      metrics.track('click-cancel-polygon-search-button');
    } else {
      dispatch(setDrawMode('draw_polygon'));
      metrics.track('click-enable-polygon-search-button');
    }
  };

  const deletePolygon = () => {
    setPolygon([]);
    dispatch(clearSelectedFeature());
    searchPendingRef.current = false;

    if (!isEmpty(geoFilter)) {
      clearPolygon();
    }
  };

  const handleRemoveFeature = () => {
    searchPendingRef.current = false;

    if (getGeometryType(selectedFeature) === 'LineString') {
      batch(() => {
        dispatch(removeArbitraryLine());
        dispatch(clearSelectedFeature());
      });
    } else {
      deletePolygon();
      // Keep the drawing mode even after deleting the current polgon
      dispatch(setDrawMode('draw_polygon'));
    }
  };

  // this is when the 'search' icon is clicked from a polygon
  const handleSearchClicked = () => {
    searchPendingRef.current = false;
    metrics.track('click-polygon-search-button');

    batch(() => {
      // doing a slice on a survey
      // NOTE: refactor this into the seismic module, it's not a 'map' thing
      if (
        selectedFeature &&
        getGeometryType(selectedFeature) === 'LineString'
      ) {
        if (
          !selectedSurveyData ||
          'error' in selectedSurveyData ||
          isEmpty(selectedSurveyData.files)
        ) {
          showErrorMessage(SEISMIC_NO_SURVEY_ERROR_MESSAGE);
          return;
        }

        const id = v1();

        dispatch(
          searchForSlicesByLine(id, selectedSurveyData.files, selectedFeature)
        );

        dispatch(setSelectedSliceId(id));
        dispatch(setSeismicCompareIsOpen(true));
      } else {
        dispatch(setDrawMode('direct_select')); // Trick to unselect polygon on search click
        if (polygon) {
          setSavedPolygon(polygon);
        }
      }
      dispatch(clearSelectedFeature());
    });
  };

  const handleToggleResult = () => {
    if (showSearchResults) {
      dispatch(hideResults());
    } else {
      dispatch(showResults());

      if (sidebarCategory !== 'landing') return;

      if (isUndefined(activePanel)) {
        sidebarCategoryUnsetRef.current = true;
      } else {
        dispatch(setCategoryPage(activePanel as CategoryTypes));
      }
    }
  };

  useEffect(() => {
    if (!isUndefined(activePanel) && sidebarCategoryUnsetRef.current) {
      sidebarCategoryUnsetRef.current = false;
      dispatch(setCategoryPage(activePanel as CategoryTypes));
    }
  }, [activePanel]);

  useEffect(() => {
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
    const initialSelectedLayers = selectableLayers
      .filter((layer) => layer.selected)
      .map((layer) => layer.id);

    dispatch(setSelectedLayers(initialSelectedLayers));
  }, [selectableLayers]);

  const features = useMemo(() => {
    const collection = [
      // any other geometrys we want to show
      ...Object.keys(otherGeo).map((key) =>
        getFeature(otherGeo[key], 'Preview', key)
      ),
      ...polygon, // -------- main polygon
      arbitraryLine, // ------- seismic line
    ];
    const safeFeatures = collection.filter((item) =>
      getGeometryType(item)
    ) as Feature[];
    // remove any null or empty points and convert to an official 'featureCollection'
    return featureCollection(safeFeatures);
  }, [polygon, otherGeo, arbitraryLine]);

  const renderFloatingActions = () => {
    if (selectedFeature && mapReference && !touched) {
      const rightMostPoint = getRightMostPoint(mapReference, selectedFeature);
      // Disabling this (v) for now, might be useful in the future if the 'MapPopup' is acting weird.
      // const coo = mapReference.project(rightMostPoint.geometry.coordinates);
      return (
        <MapPopup point={rightMostPoint.geometry} map={mapReference}>
          <FloatingActions
            handleSearchClicked={handleSearchClicked}
            handleRemoveFeature={handleRemoveFeature}
          />
        </MapPopup>
      );
    }
    return null;
  };

  const renderBlockExpander = useMemo(() => {
    if (showSearchResults) return null;

    return (
      <BlockExpander
        data-testid="expand-search-result"
        text={t(EXPAND_SEARCH_RESULTS_TEXT)}
        onClick={handleToggleResult}
      />
    );
  }, [showSearchResults]);

  return (
    <>
      {showModal && (
        <LeaveConfirmModal
          open={showModal}
          onCancel={() => {
            handlePolygonButtonToggle();
            setShowModal(false);
          }}
          onOk={() => {
            setShowModal(false);
          }}
        />
      )}
      <DocumentCard map={mapReference} />
      <SeismicCard map={mapReference} />
      <WellCard map={mapReference} />

      <MapWrapper>
        {renderBlockExpander}

        <MapboxMap
          setMapReference={setMapReference}
          sources={combinedSources}
          drawMode={drawMode}
          events={events}
          features={features}
          flyTo={flyTo}
          focusedFeature={focusedFeature}
          layers={layers}
          mapIcons={mapIcons}
          selectedFeature={selectedFeature}
          renderNavigationControls={(mapWidth) => {
            return (
              <>
                {renderFloatingActions()}

                {/* Collapsed state. Show the expand button */}
                {showSearchResults && mapWidth === 60 && (
                  <MapBlockExpander data-testid="expand-map">
                    <BlockExpander
                      text={t(EXPAND_MAP_TEXT)}
                      onClick={handleToggleResult}
                    />
                  </MapBlockExpander>
                )}

                <PolygonBar
                  polygon={polygon}
                  sources={combinedSources}
                  zoomToAsset={zoomToAsset}
                  onPolygonButtonToggle={handlePolygonButtonToggle}
                  onQuickSearchSelection={handleQuickSearchSelection}
                />
              </>
            );
          }}
        />
      </MapWrapper>
    </>
  );
};

export default Map;
