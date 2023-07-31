import flatten from 'lodash/flatten';
import { pluralize } from 'utils/pluralize';

import { WellWellboreSelection } from '../types';

export const getWellboreSelectionInfo = (
  wellWellboreSelection: WellWellboreSelection
) => {
  const selectedWellsCount = Object.keys(wellWellboreSelection).length;

  const selectedWellboresCount = flatten(
    Object.values(wellWellboreSelection)
  ).length;

  const title = getSelectionTitle(selectedWellboresCount);
  const subtitle = getSelectionSubtitle(selectedWellsCount);

  return {
    title,
    subtitle,
    selectedWellsCount,
    selectedWellboresCount,
  };
};

export const getSelectionTitle = (selectedWellboresCount: number) => {
  return `${selectedWellboresCount} ${pluralize(
    'wellbore',
    selectedWellboresCount
  )} selected`;
};

export const getSelectionSubtitle = (count: number) => {
  return `From ${count} ${pluralize('well', count)}`;
};
