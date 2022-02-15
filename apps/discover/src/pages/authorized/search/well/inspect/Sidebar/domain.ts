import { addColor } from 'dataLayers/wells/wellbores/selectors/addColor';
import { addTitle } from 'dataLayers/wells/wellbores/selectors/addTitle';

import { Wellbore } from '@cognite/sdk-wells-v2';

export const wellboreAdapter = (
  wellbore: Wellbore,
  isColoredWellbores: boolean
) => {
  // const datalayers = [addTitle, addColor(is)];

  const withColor = addColor(isColoredWellbores)(wellbore);
  const withTitle = addTitle(withColor);

  return withTitle;
};
