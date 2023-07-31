import { NdsInternalWithTvd } from '../types';

type NdsType = Pick<NdsInternalWithTvd, 'holeTop' | 'holeTopTvd'>;

export const isAnyNdsMissingTvd = <T extends NdsType>(data: T[]) => {
  return data.some(({ holeTop, holeTopTvd }) => holeTop && !holeTopTvd);
};
