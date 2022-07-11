import { addColor } from 'domain/wells/wellbore/internal/selectors/addColor';
import { addTitle } from 'domain/wells/wellbore/internal/selectors/addTitle';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { DEFAULT_WELLBORE_COLOR } from './constants';

export const wellboreAdapter = (
  wellbore: WellboreInternal,
  isColoredWellbores: boolean
) => {
  const withColor =
    addColor(isColoredWellbores)(wellbore) || DEFAULT_WELLBORE_COLOR;
  const withTitle = addTitle(withColor);

  return withTitle;
};
