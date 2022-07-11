import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

export const addColor =
  (isColoredWellbores: boolean) =>
  <T extends WellboreInternal>(wellbore: T) => {
    const color = isColoredWellbores
      ? wellbore.color?.replace('_', '')
      : undefined;

    return {
      ...wellbore,
      color,
    };
  };
