import compact from 'lodash/compact';

import {
  NDSEvent,
  NPTEvent,
  PreviewCasingType,
} from 'modules/wellSearch/types';

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

export const getMdRange = (
  casingsList: CasingType[],
  nptEvents: NPTEvent[],
  ndsEvents: NDSEvent[]
) => {
  /**
   * Move to data layer after sdk clean up
   */
  const casingMin = Math.min(...casingsList.map((casing) => casing.startDepth));
  const casingMax = Math.max(...casingsList.map((casing) => casing.endDepth));
  const nptMdList = nptEvents.filter((event) => !!event.measuredDepth);
  const nptMin = Math.min(
    ...compact(nptMdList.map((event) => event.measuredDepth?.value))
  );
  const nptMax = Math.max(
    ...compact(nptMdList.map((event) => event.measuredDepth?.value))
  );
  const ndsMin = Math.min(
    ...compact(
      ndsEvents
        .filter((event) => event.metadata && !!event.metadata.md_hole_start)
        .map((event) => Number(event.metadata!.md_hole_start))
    )
  );
  const ndsMax = Math.max(
    ...compact(
      ndsEvents
        .filter((event) => event.metadata && !!event.metadata.md_hole_end)
        .map((event) => Number(event.metadata!.md_hole_end))
    )
  );

  return [
    Math.min(casingMin, nptMin, ndsMin),
    Math.max(casingMax, nptMax, ndsMax),
  ];
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
