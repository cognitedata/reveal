import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { NPTEvent, PreviewCasingType } from 'modules/wellSearch/types';

import { CasingType } from './interfaces';

export const mirrorCasingData = (data: PreviewCasingType[]) => {
  const reverseData = data.reduce((accumulator, item) => {
    return [
      {
        ...item,
        // the '*-1' for the duplicate/mirrored casing seems to be the easiest way to get a unique id that will not clash with any existing ones
        id: item.id * -1,
        leftEnd: true,
      },
      ...accumulator,
    ];
  }, [] as PreviewCasingType[]);

  return [...reverseData, ...data];
};

export const getMinMaxDepth = (
  casingsList: CasingType[],
  events: NPTEvent[]
) => {
  const minDepth = 0;

  let maxDepth = Math.max(...casingsList.map((row) => row.endDepth));
  if (isEmpty(casingsList) && !isEmpty(events)) {
    maxDepth = Math.max(
      ...compact(events.map((row) => row.measuredDepth?.value))
    );
  }

  return [minDepth, maxDepth];
};

/**
 * This function helps to determine if the sideline should be rendered or not.
 * If tied, a sideline should be rendered.
 */
export const isTied = (
  normalizedCasings: PreviewCasingType[],
  index: number
) => {
  const currentCasing = normalizedCasings[index];

  // If the schema has only one casing or,
  // Last casing.
  if (index === normalizedCasings.length - 1) {
    return false;
  }

  // When the depth indicator is flipped (both sides view).
  if (index > 0 && currentCasing.leftEnd) {
    const previousCasing = normalizedCasings[index - 1];
    return (
      currentCasing.startDepth > previousCasing.startDepth &&
      currentCasing.endDepth >= previousCasing.endDepth
    );
  }

  // First casing (index === 0) or,
  // When the depth indicator is not flipped (one side view).
  const nextCasing = normalizedCasings[index + 1];
  return (
    currentCasing.startDepth > nextCasing.startDepth &&
    currentCasing.endDepth >= nextCasing.endDepth
  );
};
