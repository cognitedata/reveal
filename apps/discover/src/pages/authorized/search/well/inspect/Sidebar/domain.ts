import { addColor } from 'dataLayers/wells/wellbores/selectors/addColor';
import { addTitle } from 'dataLayers/wells/wellbores/selectors/addTitle';

import { Wellbore } from 'modules/wellSearch/types';

export const wellboreAdapter = (
  wellbore: Wellbore,
  isColoredWellbores: boolean
) => {
  // const datalayers = [addTitle, addColor(is)];

  const withColor = addColor(isColoredWellbores)(wellbore);
  const withTitle = addTitle(withColor);

  return withTitle;
};
