import * as React from 'react';
import { MapAddedProps } from 'types';
import isEmpty from 'lodash/isEmpty';

import { POLYGON_EDIT_MESSAGE } from '../../constants';
import { drawModes } from '../../FreeDraw';
import { isCollectionEmpty } from '../../utils/isCollectionEmpty';

import { StatusKey } from './elements';

export const allMessages: { [status: string]: React.ReactNode } = {
  finish: (
    <>
      Press <StatusKey>Enter</StatusKey> to finish editing{' '}
    </>
  ),
  cancel: (
    <>
      Press <StatusKey>Esc</StatusKey> to cancel polygon search
    </>
  ),
  edit: POLYGON_EDIT_MESSAGE,
};

export const getStatusMessage = ({
  drawMode,
  drawnFeatures,
  selectedFeatures,
}: MapAddedProps): (keyof typeof allMessages)[] => {
  const hasDrawnFeatures = !isCollectionEmpty(drawnFeatures);
  const hasNoSelectedFeatures = isEmpty(selectedFeatures);
  const drawModeEnabled = drawMode === drawModes.DRAW_POLYGON;

  // initial state: in select mode and nothing is drawn
  if (!drawModeEnabled && !hasDrawnFeatures) {
    return [];
  }

  // second state: clicked 'draw polygon'
  if (drawModeEnabled && !hasDrawnFeatures) {
    return ['finish', 'cancel'];
  }

  // user has drawn something, but not selected it
  if (!drawModeEnabled && hasDrawnFeatures && !hasNoSelectedFeatures) {
    return ['cancel'];
  }

  // user has drawn something, and mode it back to select
  // (should be listed last here)
  if (!drawModeEnabled && hasDrawnFeatures) {
    return ['edit'];
  }

  return [];
};
