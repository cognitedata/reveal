import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { WELLBORE_COLORS } from '../../constants';

export const addColorToWellbore = () => {
  let wellboreIndex = -1;
  const colors = [
    ...WELLBORE_COLORS,
    ...WELLBORE_COLORS.map((color) => `${color}_`),
  ];

  return (wellbore: WellboreInternal): WellboreInternal => {
    wellboreIndex += 1;
    const colorIndex = wellboreIndex % colors.length;
    return {
      ...wellbore,
      color: colors[colorIndex],
    };
  };
};
