import { useMemo } from 'react';
import { render } from 'react-dom';
import { batch, useDispatch } from 'react-redux';

import simplify from '@turf/simplify';
import {
  // MapboxGeoJSONFeature,
  MapLayerMouseEvent,
  MapMouseEvent,
  Popup,
} from 'maplibre-gl';
import { log } from 'utils/log';

import { MapEvent } from '@cognite/react-map';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  clearSelectedDocument,
  clearSelectedWell,
  setSelectedDocument,
  setSelectedWell,
} from 'modules/map/actions';
import { Modules } from 'modules/sidebar/types';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  useWellQueryResultWellIds,
  useWellQueryResultWellsById,
} from 'modules/wellSearch/hooks/useWellQueryResultSelectors';

import { useSavedSearch } from '../../../../../domain/savedSearches/internal/hooks';
import { useProjectConfigByKey } from '../../../../../hooks/useProjectConfig';
import { useMapDrawMode } from '../../../../../modules/map/selectors';
import {
  DOCUMENT_MARKER,
  GROUPED_CLUSTER_LAYER_ID,
  UNCLUSTERED_LAYER_ID,
  WELL_MARKER,
} from '../constants';
import { MapLayerSearchModal } from '../map-overlay-actions/MapLayerSearchModal';
import { extractDocumentMapLayers } from '../utils';
import { getAbsoluteCoordinates } from '../utils/getAbsoluteCoordinates';

const hoverPopup = new Popup({
  closeButton: false,
  closeOnClick: false,
  className: 'map-hover-popup',
  anchor: 'top',
});

const filterPopup = new Popup({
  closeButton: false,
  closeOnClick: true,
  className: 'map-layer-filter-menu',
  anchor: 'top',
  focusAfterOpen: true,
  closeOnMove: true,
});

const getHoverPopupCoords = (e: MapLayerMouseEvent): [number, number] => {
  const view: any = e.target.queryRenderedFeatures(e.point, {
    layers: [GROUPED_CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID],
  });
  const coordinates = getAbsoluteCoordinates(
    e.lngLat.lng,
    view[0].geometry.coordinates.slice()
  );

  return [coordinates[0], coordinates[1]];
};

const getHoverPopupOffset = (event: MapLayerMouseEvent): [number, number] => {
  const properties = event.features && event.features[0].properties;
  if (properties) {
    if (!properties.point_count) {
      return [0, 32];
    }
    if (properties.point_count && properties.point_count <= 10) {
      return [0, 38];
    }

    if (properties.point_count > 10 && properties.point_count <= 100) {
      return [0, 46];
    }

    return [0, 60];
  }

  return [0, 0];
};

const getHoverPopupContent = (event: MapLayerMouseEvent) => {
  const properties = event.features && event.features[0].properties;

  if (properties) {
    if (properties.point_count && properties.point_count > 0) {
      if (properties.point_count === properties.wellsCount) {
        return "Wells' cluster";
      }
      if (properties.point_count === properties.documentsCount) {
        return "Documents' cluster";
      }

      return "Wells' & Documents' cluster";
    }
    if (properties.iconType === DOCUMENT_MARKER) {
      return 'Document';
    }
    if (properties.iconType === WELL_MARKER) {
      return 'Well';
    }
  }

  log('Unhandled hover case: ', [properties]);
  return 'No data found';
};

const onMouseEnter = (e: MapLayerMouseEvent) => {
  const canvas = e.target.getCanvas();
  canvas.style.cursor = 'pointer';

  hoverPopup
    .setLngLat(getHoverPopupCoords(e))
    .setOffset(getHoverPopupOffset(e))
    .setHTML(`<div>${getHoverPopupContent(e)}</div>`)
    .addTo(e.target);
};

const onMouseMove = (e: MapLayerMouseEvent) => {
  const canvas = e.target.getCanvas();
  canvas.style.cursor = 'pointer';

  hoverPopup
    .setLngLat(getHoverPopupCoords(e))
    .setOffset(getHoverPopupOffset(e))
    .setHTML(`<div>${getHoverPopupContent(e)}</div>`)
    .addTo(e.target);
};

const onMouseLeave = (event: MapMouseEvent) => {
  const canvas = event.target.getCanvas();
  canvas.style.cursor = '';

  // hide 'tooltip'
  hoverPopup.remove();
};

export const useMapEvents = () => {
  const metrics = useGlobalMetrics('wells');
  const wellsById = useWellQueryResultWellsById();
  const wellIds = useWellQueryResultWellIds();
  const dispatch = useDispatch();
  const { data: documentConfig } = useProjectConfigByKey(Modules.DOCUMENTS);
  const patchSavedSearch = useSavedSearch();
  const drawMode = useMapDrawMode();

  const onMouseEnterFilterableMapLayer = (e: MapMouseEvent) => {
    if (drawMode !== 'draw_polygon') {
      const canvas = e.target.getCanvas();
      canvas.style.cursor = 'pointer';
    }
  };

  const onMouseLeaveFilterableMapLayer = (e: MapMouseEvent) => {
    const canvas = e.target.getCanvas();
    canvas.style.cursor = '';
  };

  const clusterZoomOnClickEvent = (e: MapMouseEvent) => {
    const view: any = e.target.queryRenderedFeatures(e.point, {
      layers: [GROUPED_CLUSTER_LAYER_ID],
    });
    if (view && view[0]) {
      const clusterId = view[0].properties.cluster_id;
      (
        e.target.getSource(GROUPED_CLUSTER_LAYER_ID) as any
      ).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) {
          return;
        }

        e.target.easeTo({
          center: view[0].geometry.coordinates,
          zoom,
        });
      });
    }
  };

  const markerClickEvent = (e: MapMouseEvent) => {
    if (drawMode === 'draw_polygon') {
      return;
    }

    // prevent bubbling the event to other layers
    const event = e.originalEvent;
    event.cancelBubble = true;

    const view: any = e.target.queryRenderedFeatures(e.point, {
      layers: [UNCLUSTERED_LAYER_ID],
    });

    if (view && view[0]) {
      const coordinates = getAbsoluteCoordinates(
        e.lngLat.lng,
        view[0].geometry.coordinates.slice()
      );

      const { iconType } = view[0].properties;

      if (iconType === DOCUMENT_MARKER) {
        const { documentId } = view[0].properties;

        batch(() => {
          dispatch(
            setSelectedDocument({
              id: documentId,
              point: { type: 'Point', coordinates },
            })
          );
          dispatch(clearSelectedWell());
        });
      }

      if (iconType === WELL_MARKER) {
        const wellId = view[0]?.properties?.id;

        if (wellId && wellIds.includes(wellId)) {
          dispatch<any>(
            wellSearchActions.toggleSelectedWells([wellsById[wellId]], {
              isSelected: true,
            })
          );
        }
        metrics.track('click-open-well-preview-button');
        const coordinates = getAbsoluteCoordinates(
          e.lngLat.lng,
          view[0].geometry.coordinates.slice()
        );

        batch(() => {
          dispatch(
            setSelectedWell({
              id: wellId,
              point: { type: 'Point', coordinates },
            })
          );
          dispatch(clearSelectedDocument());
        });
      }
    }
  };

  // Note: This is causing way to many redux dispatch.
  // figure out why this is needed, and if it can be done differently.
  // const handleMouseDown = () => {
  //   dispatch(clearSelectedDocument());
  // };

  const onClickFilterableMapLayer = (event: MapMouseEvent) => {
    const view: any[] = event.target.queryRenderedFeatures(event.point);

    /**
     * Don't show the filter popup if we click on one of our custom layers
     * or we are drawing a polygon
     * */

    if (
      view.find((f) => f.properties?.customLayer) ||
      drawMode === 'draw_polygon'
    ) {
      return;
    }

    const filteredFeatures = extractDocumentMapLayers(
      view,
      documentConfig?.mapLayerFilters
    );

    if (filteredFeatures.length) {
      const placeholder = document.createElement('div');
      render(
        <MapLayerSearchModal
          items={filteredFeatures.map((f) => f.geoFilter)}
          onItemSelect={(item) => {
            const filter = { ...item };
            if (filter.geoJson.type === 'Polygon') {
              let tolerance = 0.002;

              while (filter.geoJson.coordinates[0].length > 50) {
                simplify(filter.geoJson, { mutate: true, tolerance });
                tolerance += 0.001;
              }
            }
            patchSavedSearch({
              // TODO(PP-2162)(https://cognitedata.atlassian.net/browse/PP-2162)

              /* filters: {
                extraGeoJsonFilters: appliedFilters.extraGeoJsonFilters
                  ? [
                      ...appliedFilters.extraGeoJsonFilters.filter(
                        (f) => f.label !== item.label
                      ),
                      item,
                    ]
                  : [item],
              }, */
              filters: {
                extraGeoJsonFilters: [filter],
              },
              geoJson: [],
            });

            filterPopup.remove();
          }}
        />,
        placeholder
      );
      filterPopup
        .setLngLat(event.lngLat)
        .setDOMContent(placeholder)
        .addTo(event.target);
    }
  };

  const events: MapEvent[] = useMemo(
    (): MapEvent[] => [
      // Cluster

      {
        type: 'mouseleave',
        layers: [GROUPED_CLUSTER_LAYER_ID],
        callback: onMouseLeave,
      },
      {
        type: 'click',
        layers: [GROUPED_CLUSTER_LAYER_ID],
        callback: clusterZoomOnClickEvent,
      },
      // NOTE: we use mousemove instead of mouseenter because the enter event is not triggered when clusters are close and we move from one to other
      {
        type: 'mousemove',
        layers: [GROUPED_CLUSTER_LAYER_ID],
        callback: (e: any) => {
          onMouseMove(e);
        },
      },

      // Marker

      {
        type: 'mouseenter',
        layers: [UNCLUSTERED_LAYER_ID],
        callback: onMouseEnter,
      },
      {
        type: 'mouseleave',
        layers: [UNCLUSTERED_LAYER_ID],
        callback: onMouseLeave,
      },

      {
        type: 'click',
        layers: [UNCLUSTERED_LAYER_ID],
        callback: markerClickEvent,
      },

      // Map Filter Layers
      {
        type: 'click',
        layers: documentConfig?.mapLayerFilters
          ? Object.keys(documentConfig.mapLayerFilters)
          : undefined,
        callback: onClickFilterableMapLayer,
      },

      {
        type: 'mouseenter',
        layers: documentConfig?.mapLayerFilters
          ? Object.keys(documentConfig.mapLayerFilters)
          : undefined,
        callback: onMouseEnterFilterableMapLayer,
      },
      {
        type: 'mouseleave',
        layers: documentConfig?.mapLayerFilters
          ? Object.keys(documentConfig.mapLayerFilters)
          : undefined,
        callback: onMouseLeaveFilterableMapLayer,
      },

      // Map

      // {
      //   type: 'mousedown',
      //   callback: handleMouseDown,
      // },
      // {
      //   type: 'moveend',
      //   callback: handleMouseDown,
      // },
      {
        type: 'zoom',
        callback: () => {
          hoverPopup.remove();
        },
      },
    ],
    [drawMode]
  );

  return events;
};
