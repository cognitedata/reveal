import isEmpty from 'lodash/isEmpty';
import { Feature, featureCollection, Geometry } from '@turf/helpers';
// import { DrawCreateEvent, DrawDeleteEvent } from '@mapbox/mapbox-gl-draw';

import { MapEvent, MapFeature } from '../types';
import type { DrawMode } from '../FreeDraw';

import { EventSetters } from './useLayerEvents';

const handleFeatureChange =
  ({
    setDrawnFeatures,
    setSelectedFeatures,
  }: {
    setDrawnFeatures: EventSetters['setDrawnFeatures'];
    setSelectedFeatures: EventSetters['setSelectedFeatures'];
  }) =>
  (event: { features: Feature[]; type: string }) => {
    // console.log('Event caught:', event);
    if (isEmpty(event.features)) return;

    const eventType = event && event.type;

    if (!eventType) {
      // console.log('Missing event type!')
      return;
    }

    if (setSelectedFeatures) {
      setSelectedFeatures(event.features);
    }

    if (setDrawnFeatures) {
      // this is an example on how to type events if we need:
      //   const drawEvent = event as DrawCreateEvent;
      setDrawnFeatures(
        featureCollection(event.features as Feature<Geometry>[])
      );
    } else {
      // console.log('Missing user feature setter!')
    }
  };

const handleSelectionChange =
  ({
    setSelectedFeatures,
  }: {
    setSelectedFeatures: EventSetters['setSelectedFeatures'];
  }) =>
  (event: { features: MapFeature[] }) => {
    if (!setSelectedFeatures) {
      return;
    }
    // when the polygon you are drawing changes etc.
    if (event.features.length === 0) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(event.features);
    }
  };

const handleModeChange =
  ({ setDrawMode }: { setDrawMode: EventSetters['setDrawMode'] }) =>
  (event: { mode: DrawMode }) => {
    if (setDrawMode) {
      setDrawMode(event.mode);
    }
  };

export const getDrawEvents = ({
  setDrawMode,
  setDrawnFeatures,
  setSelectedFeatures,
}: EventSetters): MapEvent[] => {
  return [
    {
      type: 'draw.selectionchange',
      callback: handleSelectionChange({ setSelectedFeatures }),
    },
    {
      type: 'draw.modechange',
      callback: handleModeChange({ setDrawMode }),
    },
    {
      type: 'draw.create',
      callback: handleFeatureChange({ setDrawnFeatures, setSelectedFeatures }),
    },
    {
      type: 'draw.update',
      callback: handleFeatureChange({ setDrawnFeatures, setSelectedFeatures }),
    },
  ];
};
