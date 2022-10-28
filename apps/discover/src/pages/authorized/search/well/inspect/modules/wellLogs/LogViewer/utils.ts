import { NdsInternal } from 'domain/wells/nds/internal/types';

export const isEventsOverlap = (
  parentEvent: NdsInternal,
  childEvent: NdsInternal
) => {
  return (
    parentEvent.wellboreMatchingId !== childEvent.wellboreMatchingId &&
    parentEvent.riskType === childEvent.riskType &&
    Number(parentEvent.holeTop?.value) >= Number(childEvent.holeTop?.value) &&
    Number(parentEvent.holeBase?.value) <= Number(childEvent.holeBase?.value)
  );
};
