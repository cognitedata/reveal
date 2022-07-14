import * as React from 'react';

import {
  getShowingLayers,
  SelectableLayer,
  getSortedFlatLayers,
} from '@cognite/react-map';

import { useLayers } from '../hooks/useLayers';

/**
 *
 * This function takes all the layers
 * and removes the ones that are not enabled (from UI)
 * then returns them in a consumable form by the map
 *
 */
export const useVisibleLayers = (selectedLayers: SelectableLayer['id'][]) => {
  const { selectableLayers, alwaysVisible } = useLayers();
  return React.useMemo(() => {
    const showing = getShowingLayers(selectableLayers, selectedLayers);
    return getSortedFlatLayers([...showing, ...alwaysVisible]);
  }, [selectedLayers]);
};
