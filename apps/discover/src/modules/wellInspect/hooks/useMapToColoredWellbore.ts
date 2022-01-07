import { Wellbore } from 'modules/wellSearch/types';

import { WELLBORE_COLORS } from '../constants';

export const useMapToColoredWellbore = () => {
  let wellboreIndex = -1;
  const colors = [
    ...WELLBORE_COLORS,
    ...WELLBORE_COLORS.map((color) => `${color}_`),
  ];

  return (wellbore: Wellbore): Wellbore => {
    wellboreIndex += 1;
    const colorIndex = wellboreIndex % colors.length;
    return {
      ...wellbore,
      metadata: {
        ...wellbore.metadata,
        color: colors[colorIndex],
      },
    };
  };
};
