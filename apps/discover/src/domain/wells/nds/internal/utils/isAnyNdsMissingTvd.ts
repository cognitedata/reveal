import { NdsInternalWithTvd } from '../types';

type NdsType = Pick<NdsInternalWithTvd, 'holeStart' | 'holeStartTvd'>;

export const isAnyNdsMissingTvd = <T extends NdsType>(data: T[]) => {
  return data.some(({ holeStart, holeStartTvd }) => holeStart && !holeStartTvd);
};
