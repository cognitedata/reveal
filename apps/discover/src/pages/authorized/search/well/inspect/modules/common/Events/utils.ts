import { NDSEvent, NPTEvent } from 'modules/wellSearch/types';

export const filterNptByDepth = (
  events: NPTEvent[],
  minDepth: number,
  maxDepth: number
): NPTEvent[] =>
  events?.filter(
    (nptEvent) =>
      nptEvent.measuredDepth &&
      nptEvent.measuredDepth.value >= minDepth &&
      nptEvent.measuredDepth.value <= maxDepth
  );

export const filterNdsByDepth = (
  events: NDSEvent[],
  minDepth: number,
  maxDepth: number
): NDSEvent[] =>
  events?.filter(
    (ndsEvent) =>
      ndsEvent.metadata &&
      ndsEvent.metadata.md_hole_start &&
      Number(ndsEvent.metadata.md_hole_start) >= minDepth &&
      Number(ndsEvent.metadata.md_hole_start) <= maxDepth
  );
