import { NptInternalWithTvd } from '../types';

type NptType = Pick<NptInternalWithTvd, 'measuredDepth' | 'trueVerticalDepth'>;

export const isAnyNptMissingTvd = <T extends NptType>(data: T[]) => {
  return data.some(
    ({ measuredDepth, trueVerticalDepth }) =>
      measuredDepth && !trueVerticalDepth
  );
};
