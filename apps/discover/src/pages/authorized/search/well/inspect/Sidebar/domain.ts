import { addColor } from 'domain/wells/wellbore/internal/selectors/addColor';
import { addTitle } from 'domain/wells/wellbore/internal/selectors/addTitle';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

export const wellboreAdapter = (
  wellbore: Wellbore,
  isColoredWellbores: boolean
) => {
  // const datalayers = [addTitle, addColor(is)];

  const withColor = addColor(isColoredWellbores)(wellbore);
  const withTitle = addTitle(withColor);

  return withTitle;
};
