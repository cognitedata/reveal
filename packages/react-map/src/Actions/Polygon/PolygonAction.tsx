import * as React from 'react';
import { featureCollection } from '@turf/helpers';

import { MapAddedProps } from '../../types';
import { drawModes } from '../../FreeDraw';
import { useKeyPressListener } from '../../hooks/useKeyPressListener';
import { isPolygon } from '../../utils/isPolygon';
import { isCollectionEmpty } from '../../utils/isCollectionEmpty';

import { PolygonButton } from './PolygonButton';

/**
 * Note: setting the drawn features is handled by the `draw` event
 */
type Props = {
  onToggle?: () => void;
} & MapAddedProps;
export const PolygonAction = ({
  onToggle,
  drawMode,
  setDrawMode,
  selectedFeatures,
  setSelectedFeatures,
  setDrawnFeatures,
  drawnFeatures,
}: Props) => {
  const hasDrawnFeatures = !isCollectionEmpty(drawnFeatures);
  const isPolygonMode = drawMode === drawModes.DRAW_POLYGON;
  const isActive = isPolygonMode || hasDrawnFeatures;

  const handleToggle = () => {
    if (isActive) {
      setDrawMode(drawModes.SIMPLE_SELECT);
      setSelectedFeatures([]);
      setDrawnFeatures(featureCollection([]));
    } else {
      setDrawMode(drawModes.DRAW_POLYGON);
    }

    if (onToggle) {
      onToggle();
    }
  };

  const selectedFeature = selectedFeatures ? selectedFeatures[0] : undefined;

  useKeyPressListener({
    onKeyDown: () => {
      if (isActive || isPolygon(selectedFeature)) {
        handleToggle();
      }
    },
    deps: [isActive, selectedFeature],
    key: 'Escape',
  });

  return <PolygonButton isActive={isActive} onToggle={handleToggle} />;
};
