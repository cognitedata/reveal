import findLast from 'lodash/findLast';

import { SelectableLayer } from './types';

/*
 * When adding layers we need to do it in the right order
 * This function helps us find the previous showing one
 * so we can position our new layer to show above or below that
 *
 */
export const choosePreviousSelectedLayer = (
  layers: SelectableLayer[],
  currentIndex: number
) => {
  const allLayersBeforeThisOne = layers.slice(0, currentIndex);
  const previous = findLast(allLayersBeforeThisOne, 'selected');
  return previous?.id;
};
