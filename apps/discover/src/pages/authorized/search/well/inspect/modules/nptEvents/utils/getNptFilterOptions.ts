import { NptInternal } from 'domain/wells/npt/internal/types';

export const getNptFilterOptions = (events: NptInternal[]) => {
  const nptCodes: string[] = [];
  const nptDetailCodes: string[] = [];
  let min = 0;
  let max = 0;

  events.forEach(({ nptCode, nptCodeDetail, duration }) => {
    if (nptCode && !nptCodes.includes(nptCode)) {
      nptCodes.push(nptCode);
    }
    if (nptCodeDetail && !nptDetailCodes.includes(nptCodeDetail)) {
      nptDetailCodes.push(nptCodeDetail);
    }

    if (duration) {
      if (min > duration) {
        min = duration;
      }
      if (max < duration) {
        max = duration;
      }
    }
  });

  return {
    nptCodes,
    nptDetailCodes,
    minMaxDuration: [Math.floor(min), Math.ceil(max)],
  };
};
