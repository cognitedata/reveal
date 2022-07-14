import React, { useMemo } from 'react';

import { TS_FIX_ME } from 'core';

import { Point } from '@cognite/seismic-sdk-js';

import { useMap } from 'modules/map/selectors';
import { MapDataSource, MapState } from 'modules/map/types';
import { FlexGrow } from 'styles/layout';

import { useSelectedLayers } from '../hooks';
import { useLayers } from '../hooks/useLayers';
import { useSearchableConfig } from '../hooks/useSearchableConfig';
import {
  ContentSelector,
  InfoButton,
  InfoCode,
  LineButton,
  PolygonButton,
  SearchableAssets,
} from '../map-overlay-actions';
import { TopButtonMenu } from '../TopButtonMenu';

interface Props {
  polygon: MapState['geoFilter'];
  sources: MapDataSource[];
  onPolygonButtonToggle: () => void;
  onQuickSearchSelection: (selection: TS_FIX_ME) => void;
  zoomToAsset: (point: Point, changeZoom?: number | false) => void;
}

export const PolygonBar: React.FC<Props> = ({
  polygon,
  sources,
  onPolygonButtonToggle,
  onQuickSearchSelection,
  zoomToAsset,
}) => {
  const {
    selectedLayers: selected,
    assets,
    drawMode,
    selectedFeature,
  } = useMap();

  const { allLayers, selectableLayers } = useLayers();
  // add selected status to layers from redux
  const layersWithUpdatedSelectedStatus = useSelectedLayers(
    selectableLayers,
    selected
  );

  const { layers: searchableAssets, title: searchableTitle } =
    useSearchableConfig(allLayers, sources);

  const isPolygonButtonActive =
    drawMode === 'draw_polygon' || polygon.length > 0;

  const infoCodes: InfoCode[] = useMemo(() => {
    if (!isPolygonButtonActive) {
      return [];
    }
    if (!selectedFeature && polygon.length) {
      return ['edit'];
    }
    return ['finish', 'cancel'];
  }, [isPolygonButtonActive, polygon, selectedFeature]);

  return (
    <TopButtonMenu>
      <InfoButton infoCodes={infoCodes} />

      <FlexGrow />

      <PolygonButton
        onToggle={onPolygonButtonToggle}
        isActive={isPolygonButtonActive}
      />

      <LineButton />

      <>
        {searchableTitle && (
          <SearchableAssets
            onSelect={onQuickSearchSelection}
            items={searchableAssets}
            placeholder={searchableTitle}
          />
        )}
      </>

      <ContentSelector
        layers={layersWithUpdatedSelectedStatus}
        zoomToAsset={zoomToAsset}
        assets={assets}
      />
    </TopButtonMenu>
  );
};
