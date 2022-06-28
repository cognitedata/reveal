import { NdsInternal } from 'domain/wells/nds/internal/types';

export const isEventsOverlap = (
  parentEvent: NdsInternal,
  childEvent: NdsInternal
) => {
  return (
    parentEvent.wellboreMatchingId !== childEvent.wellboreMatchingId &&
    parentEvent.riskType === childEvent.riskType &&
    Number(parentEvent.holeStart?.value) >=
      Number(childEvent.holeStart?.value) &&
    Number(parentEvent.holeEnd?.value) <= Number(childEvent.holeEnd?.value)
  );
};
